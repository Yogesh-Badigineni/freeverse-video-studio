import subprocess
from pathlib import Path
import pytest
from app.config import FFMPEG_EXE, RENDERS_DIR
from app.models.project import Scene, AudioTrack
from app.core.ffmpeg_engine import (
    build_scene_video_clip,
    concatenate_scenes_with_transitions,
    combine_video_and_audio
)

def test_real_ffmpeg_video_render(tmp_path):
    """
    End-to-end smoke test: Renders two scenes with motion effects and text overlays,
    merges them, adds audio, and validates that a playable MP4 file is generated.
    """
    temp_dir = tmp_path / "render_test"
    temp_dir.mkdir()

    # Scene 1: 2.0 seconds with Ken Burns zoom in
    scene1 = Scene(
        id="test_scene_1",
        title="Opening Vista",
        duration=2.0,
        text_overlay="Scene 1: FreeVerse Studio",
        text_position="bottom",
        motion_effect="ken_burns_zoom_in",
        background_color="#1E3C72"
    )

    # Scene 2: 2.0 seconds with pan
    scene2 = Scene(
        id="test_scene_2",
        title="Deep Horizon",
        duration=2.0,
        text_overlay="Scene 2: Future of Open Source Video",
        text_position="center",
        motion_effect="pan_left",
        background_color="#2C5364"
    )

    width, height, fps = 1280, 720, 24

    # 1. Render Scene 1
    clip1 = build_scene_video_clip(scene1, width, height, fps, temp_dir, 0)
    assert clip1.exists()
    assert clip1.stat().st_size > 5000

    # 2. Render Scene 2
    clip2 = build_scene_video_clip(scene2, width, height, fps, temp_dir, 1)
    assert clip2.exists()
    assert clip2.stat().st_size > 5000

    # 3. Concatenate
    merged_clip = temp_dir / "merged.mp4"
    concatenate_scenes_with_transitions([clip1, clip2], [scene1, scene2], merged_clip, fps)
    assert merged_clip.exists()
    assert merged_clip.stat().st_size > 10000

    # 4. Final MP4 with audio
    final_output = temp_dir / "final_test_output.mp4"
    combine_video_and_audio(
        video_path=merged_clip,
        audio_tracks=[],
        total_duration=4.0,
        output_final_mp4=final_output,
        temp_dir=temp_dir
    )

    assert final_output.exists()
    assert final_output.stat().st_size > 15000

    # 5. Verify MP4 validity using FFmpeg probe
    probe_cmd = [FFMPEG_EXE, "-v", "error", "-i", str(final_output), "-f", "null", "-"]
    res = subprocess.run(probe_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    assert res.returncode == 0, f"FFmpeg validation failed: {res.stderr}"
