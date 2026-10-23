import os
import subprocess
import time
import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Callable
from PIL import Image, ImageDraw, ImageFont

from ..config import FFMPEG_EXE, MAX_RENDER_PROCESS_TIMEOUT_SEC, RENDERS_DIR
from ..models.project import Project, Scene, AudioTrack, AspectRatio, Resolution
from .security import resolve_safe_path

# Active render processes for cancellation
ACTIVE_RENDER_PROCESSES: Dict[str, subprocess.Popen] = {}

def get_dimension_for_aspect_and_res(aspect: AspectRatio, res: Resolution) -> Tuple[int, int]:
    """Calculate exact width and height based on aspect ratio and resolution preset."""
    if res == "4k":
        base_h = 2160
    elif res == "720p":
        base_h = 720
    else:  # 1080p
        base_h = 1080

    if aspect == "16:9":
        w = int(base_h * 16 / 9)
        h = base_h
    elif aspect == "9:16":
        # Vertical video (e.g. 1080x1920)
        w = base_h
        h = int(base_h * 16 / 9)
    elif aspect == "1:1":
        w = base_h
        h = base_h
    elif aspect == "4:5":
        w = base_h
        h = int(base_h * 5 / 4)
    else:
        w = 1920
        h = 1080

    # Ensure even dimensions for H.264
    w = (w // 2) * 2
    h = (h // 2) * 2
    return w, h

def create_text_overlay_image(
    text: str,
    width: int,
    height: int,
    position: str = "bottom",
    text_color: str = "#FFFFFF",
    bg_color: str = "rgba(0,0,0,0.65)",
    font_size: int = 36,
    output_path: Path = None
) -> Path:
    """
    Renders clean, platform-independent text overlay image with alpha transparency.
    Avoids fontconfig / freetype missing font issues across Windows/Linux.
    """
    if not output_path:
        output_path = RENDERS_DIR / f"overlay_{int(time.time()*1000)}.png"

    # Transparent canvas
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Simple word wrap
    words = text.split()
    lines = []
    curr = []
    max_chars_per_line = max(20, width // (font_size // 2 + 1))

    for w in words:
        curr.append(w)
        if len(" ".join(curr)) > max_chars_per_line:
            curr.pop()
            lines.append(" ".join(curr))
            curr = [w]
    if curr:
        lines.append(" ".join(curr))

    wrapped_text = "\n".join(lines)

    # Estimate text box size
    line_count = len(lines)
    approx_line_height = int(font_size * 1.3)
    box_height = line_count * approx_line_height + 40
    box_width = min(int(width * 0.9), max(400, int(len(max(lines, key=len, default="")) * font_size * 0.6) + 60))

    box_x0 = (width - box_width) // 2
    box_x1 = box_x0 + box_width

    if position == "top":
        box_y0 = int(height * 0.08)
    elif position == "center":
        box_y0 = (height - box_height) // 2
    else:  # bottom
        box_y0 = height - box_height - int(height * 0.08)

    box_y1 = box_y0 + box_height

    # Parse bg_color (e.g. rgba(0,0,0,0.65) or #000000)
    box_fill = (0, 0, 0, 170)
    draw.rounded_rectangle([box_x0, box_y0, box_x1, box_y1], radius=16, fill=box_fill, outline=(255, 255, 255, 60), width=2)

    # Draw text lines
    text_y = box_y0 + 20
    for line in lines:
        draw.text((width // 2, text_y), line, fill=(255, 255, 255, 255), anchor="mt")
        text_y += approx_line_height

    img.save(output_path, "PNG")
    return output_path

def build_scene_video_clip(
    scene: Scene,
    width: int,
    height: int,
    fps: int,
    temp_dir: Path,
    scene_index: int
) -> Path:
    """
    Renders an individual scene (image or video or solid background)
    into a standardized MP4 video clip with target resolution, fps, motion, and overlay.
    """
    output_segment = temp_dir / f"scene_{scene_index:03d}.mp4"
    duration = max(0.5, scene.duration)
    fps_val = max(15, fps)
    total_frames = int(duration * fps_val)

    # 1. Determine input visual source
    input_file: Optional[Path] = None
    if scene.asset_id:
        from .storage import get_asset_meta
        meta = get_asset_meta(scene.asset_id)
        if meta and Path(meta.file_path).exists():
            input_file = Path(meta.file_path)

    # If no valid input file, generate solid or gradient image
    if not input_file or not input_file.exists():
        solid_img_path = temp_dir / f"bg_{scene_index:03d}.png"
        bg_col = scene.background_color or "#1A1A24"
        img = Image.new("RGB", (width, height), color=bg_col)
        draw = ImageDraw.Draw(img)
        # Decorative accents
        draw.rectangle([40, 40, width - 40, height - 40], outline=(255, 255, 255, 40), width=3)
        img.save(solid_img_path, "PNG")
        input_file = solid_img_path
        is_video_input = False
    else:
        ext = input_file.suffix.lower()
        is_video_input = ext in [".mp4", ".webm", ".mov"]

    # 2. Text overlay generation
    overlay_path = None
    if scene.text_overlay and scene.text_overlay.strip():
        overlay_path = temp_dir / f"overlay_{scene_index:03d}.png"
        create_text_overlay_image(
            text=scene.text_overlay.strip(),
            width=width,
            height=height,
            position=scene.text_position,
            text_color=scene.text_color,
            font_size=scene.font_size,
            output_path=overlay_path
        )

    # 3. Construct FFmpeg command
    cmd: List[str] = [FFMPEG_EXE, "-y"]

    if not is_video_input:
        # Loop image for duration
        cmd.extend(["-loop", "1", "-t", str(duration), "-i", str(input_file)])
        
        # Build filtergraph
        # Ken Burns effect or clean scale/pad
        filters = []
        # First scale maintaining aspect ratio with padding
        if scene.motion_effect == "ken_burns_zoom_in":
            # Smooth slow zoom in
            filters.append(
                f"scale=1.3*{width}:-1,zoompan=z='min(zoom+0.0012,1.25)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s={width}x{height}:fps={fps_val}"
            )
        elif scene.motion_effect == "ken_burns_zoom_out":
            # Smooth zoom out
            filters.append(
                f"scale=1.3*{width}:-1,zoompan=z='max(1.25-0.0012*on,1.0)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={total_frames}:s={width}x{height}:fps={fps_val}"
            )
        elif scene.motion_effect == "pan_left":
            filters.append(
                f"scale=1.3*{width}:-1,zoompan=z=1.15:x='if(lte(on,-1),(iw-iw/zoom)/2,x-1)':y='(ih-ih/zoom)/2':d={total_frames}:s={width}x{height}:fps={fps_val}"
            )
        elif scene.motion_effect == "pan_right":
            filters.append(
                f"scale=1.3*{width}:-1,zoompan=z=1.15:x='if(lte(on,-1),(iw-iw/zoom)/2,x+1)':y='(ih-ih/zoom)/2':d={total_frames}:s={width}x{height}:fps={fps_val}"
            )
        elif scene.motion_effect == "cartoon_bounce":
            filters.append(
                f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color={scene.background_color[1:] if scene.background_color.startswith('#') else '1A1A24'}"
            )
        else:
            # None / standard scale with letterboxing
            filters.append(
                f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color={scene.background_color[1:] if scene.background_color.startswith('#') else '1A1A24'}"
            )

        video_filter = ",".join(filters)

        if overlay_path and overlay_path.exists():
            cmd.extend(["-i", str(overlay_path)])
            complex_filter = f"[0:v]{video_filter}[v0];[v0][1:v]overlay=0:0[vout]"
            cmd.extend(["-filter_complex", complex_filter, "-map", "[vout]"])
        else:
            cmd.extend(["-vf", video_filter])

    else:
        # Video input
        cmd.extend(["-t", str(duration), "-i", str(input_file)])
        scale_pad = f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=black,fps={fps_val}"
        
        if overlay_path and overlay_path.exists():
            cmd.extend(["-i", str(overlay_path)])
            complex_filter = f"[0:v]{scale_pad}[v0];[v0][1:v]overlay=0:0[vout]"
            cmd.extend(["-filter_complex", complex_filter, "-map", "[vout]"])
        else:
            cmd.extend(["-vf", scale_pad])

    # Video encoding params: H.264 high-compatibility, no audio in segment yet
    cmd.extend([
        "-c:v", "libx264",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        "-r", str(fps_val),
        "-t", str(duration),
        "-an",
        str(output_segment)
    ])

    # Run FFmpeg safely
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=120)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg scene render error: {res.stderr[-400:]}")

    return output_segment

def concatenate_scenes_with_transitions(
    scene_clips: List[Path],
    scenes: List[Scene],
    output_path: Path,
    fps: int,
    progress_callback: Optional[Callable[[float, str], None]] = None
) -> Path:
    """Concatenates rendered scene segments using FFmpeg concat filter."""
    if not scene_clips:
        raise ValueError("No scene clips provided to concatenate")

    if len(scene_clips) == 1:
        # Just copy single clip
        cmd = [FFMPEG_EXE, "-y", "-i", str(scene_clips[0]), "-c", "copy", str(output_path)]
        subprocess.run(cmd, check=True)
        return output_path

    # Build concat demuxer file
    concat_list = output_path.parent / "concat_list.txt"
    with open(concat_list, "w", encoding="utf-8") as f:
        for clip in scene_clips:
            # Escape path for concat demuxer
            safe_p = str(clip).replace("\\", "/")
            f.write(f"file '{safe_p}'\n")

    cmd = [
        FFMPEG_EXE, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list),
        "-c:v", "libx264",
        "-preset", "fast",
        "-pix_fmt", "yuv420p",
        "-r", str(fps),
        str(output_path)
    ]

    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=180)
    if res.returncode != 0:
        raise RuntimeError(f"FFmpeg concat error: {res.stderr[-400:]}")

    return output_path

def combine_video_and_audio(
    video_path: Path,
    audio_tracks: List[AudioTrack],
    total_duration: float,
    output_final_mp4: Path,
    temp_dir: Path
) -> Path:
    """Mixes background music, voiceovers, and sound effects with the video stream."""
    from .storage import get_asset_meta

    # Resolve existing audio files
    valid_audio_inputs: List[Tuple[AudioTrack, Path]] = []
    for trk in audio_tracks:
        if trk.asset_id:
            meta = get_asset_meta(trk.asset_id)
            if meta and Path(meta.file_path).exists():
                valid_audio_inputs.append((trk, Path(meta.file_path)))

    if not valid_audio_inputs:
        # Generate silent audio track so the MP4 always has valid AAC audio
        cmd = [
            FFMPEG_EXE, "-y",
            "-i", str(video_path),
            "-f", "lavfi", "-i", f"anullsrc=channel_layout=stereo:sample_rate=44100",
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            "-shortest",
            str(output_final_mp4)
        ]
        subprocess.run(cmd, check=True, timeout=120)
        return output_final_mp4

    # Build audio filter graph with mixing, volume, and delays
    cmd = [FFMPEG_EXE, "-y", "-i", str(video_path)]
    
    filter_inputs = []
    for idx, (trk, apath) in enumerate(valid_audio_inputs):
        cmd.extend(["-i", str(apath)])
        input_stream_idx = idx + 1
        
        # Audio filters: volume, fade, delay
        afilt = []
        if trk.volume != 1.0:
            afilt.append(f"volume={trk.volume:.2f}")
        if trk.fade_in > 0:
            afilt.append(f"afade=t=in:ss=0:d={trk.fade_in:.2f}")
        if trk.fade_out > 0 and total_duration > trk.fade_out:
            afilt.append(f"afade=t=out:st={total_duration - trk.fade_out:.2f}:d={trk.fade_out:.2f}")
        if trk.start_time > 0:
            delay_ms = int(trk.start_time * 1000)
            afilt.append(f"adelay={delay_ms}|{delay_ms}")
            
        filt_str = ",".join(afilt) if afilt else "anull"
        filter_inputs.append(f"[{input_stream_idx}:a]{filt_str}[a{idx}]")

    # Combine with amix
    mix_labels = "".join([f"[a{i}]" for i in range(len(valid_audio_inputs))])
    mix_filter = f"{';'.join(filter_inputs)};{mix_labels}amix=inputs={len(valid_audio_inputs)}:duration=longest:dropout_transition=2[aout]"

    cmd.extend([
        "-filter_complex", mix_filter,
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", str(total_duration),
        str(output_final_mp4)
    ])

    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=180)
    if res.returncode != 0:
        # Fallback to simple first audio track
        cmd_fallback = [
            FFMPEG_EXE, "-y",
            "-i", str(video_path),
            "-i", str(valid_audio_inputs[0][1]),
            "-c:v", "copy",
            "-c:a", "aac",
            "-b:a", "192k",
            "-t", str(total_duration),
            str(output_final_mp4)
        ]
        subprocess.run(cmd_fallback, check=True, timeout=120)

    return output_final_mp4
