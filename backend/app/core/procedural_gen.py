import uuid
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Tuple
from PIL import Image, ImageDraw

from ..models.project import Project, Scene, AudioTrack, AspectRatio
from ..models.render_job import PromptGenerateRequest, AssetMeta
from ..config import SAMPLE_ASSETS_DIR
from .storage import save_asset_meta

# Theme palettes for procedural scene graphics
STYLE_PALETTES = {
    "cartoon": [
        ("#FF6B6B", "#FFE66D", "ADVENTURE BEGINS", "#4ECDC4"),
        ("#4ECDC4", "#556270", "DISCOVERY TIME", "#FF6B6B"),
        ("#C7F464", "#FF6B6B", "THE CHALLENGE", "#C7F464"),
        ("#FFE66D", "#4ECDC4", "A HAPPY ENDING!", "#FFE66D")
    ],
    "educational": [
        ("#0F2027", "#2C5364", "CORE PRINCIPLES", "#00ADB5"),
        ("#1A2980", "#26D0CE", "DEEP DIVE ANALYSIS", "#4FACFE"),
        ("#134E5E", "#71B280", "KEY EVIDENCE & FACTS", "#43E97B"),
        ("#232526", "#414345", "SUMMARY TAKEAWAYS", "#F38181")
    ],
    "social": [
        ("#FA709A", "#FEE140", "WAIT FOR THIS! ⚡", "#FF0844"),
        ("#667EEA", "#764BA2", "THE SECRET REVEALED", "#6B11FF"),
        ("#F857A6", "#FF5858", "HOW IT WORKS", "#FF512F"),
        ("#00C6FB", "#005BEA", "TRY IT OUT TODAY!", "#00F2FE")
    ],
    "natural": [
        ("#1E3C72", "#2A5298", "SCENIC HORIZONS", "#6DD5ED"),
        ("#134E5E", "#71B280", "WHISPERS OF THE WILD", "#43E97B"),
        ("#2C3E50", "#FD746C", "GOLDEN HOUR MAJESTY", "#FF8235"),
        ("#16222F", "#3B82F6", "JOURNEY'S REFLECTION", "#93C5FD")
    ],
    "ai_generated": [
        ("#240046", "#7B2CBF", "NEURAL PERSPECTIVE", "#E0AAFF"),
        ("#3A0CA3", "#4CC9F0", "SYNTHETIC FRONTIERS", "#7209B7"),
        ("#03071E", "#370617", "DIGITAL GENESIS", "#D00000"),
        ("#10002B", "#5A189A", "FUTURE HORIZON", "#9D4EDD")
    ],
    "visualizer": [
        ("#050505", "#1F1C2C", "BEAT INTRO", "#928DAB"),
        ("#0D0221", "#0F084B", "DYNAMIC FREQUENCY", "#26408B"),
        ("#240046", "#3C096C", "CRESCENDO PEAK", "#7B2CBF"),
        ("#050505", "#1A1A24", "OUTRO FADE", "#5A189A")
    ]
}

def create_procedural_scene_image(
    title: str,
    subtitle: str,
    tag: str,
    col1: str,
    col2: str,
    accent: str,
    width: int = 1920,
    height: int = 1080
) -> Path:
    """Generates a high-quality stylized scene backdrop card."""
    filename = f"gen_{uuid.uuid4().hex[:8]}.png"
    dest = SAMPLE_ASSETS_DIR / filename

    img = Image.new("RGB", (width, height), color=col1)
    draw = ImageDraw.Draw(img)

    # Vertical gradient
    r1, g1, b1 = int(col1[1:3], 16), int(col1[3:5], 16), int(col1[5:7], 16)
    r2, g2, b2 = int(col2[1:3], 16), int(col2[3:5], 16), int(col2[5:7], 16)
    for y in range(height):
        ratio = y / float(height)
        r = int(r1 + (r2 - r1) * ratio)
        g = int(g1 + (g2 - g1) * ratio)
        b = int(b1 + (b2 - b1) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Architectural framing
    draw.rectangle([60, 60, width - 60, height - 60], outline=(255, 255, 255, 45), width=2)
    draw.rectangle([80, 80, width - 80, height - 80], outline=(255, 255, 255, 25), width=1)

    # Center card
    card_w, card_h = int(width * 0.75), int(height * 0.45)
    card_x0 = (width - card_w) // 2
    card_y0 = (height - card_h) // 2
    draw.rounded_rectangle([card_x0, card_y0, card_x0 + card_w, card_y0 + card_h], radius=24, fill=(10, 10, 16, 175), outline=(255, 255, 255, 60), width=2)

    # Tag badge
    draw.rounded_rectangle([card_x0 + 40, card_y0 + 35, card_x0 + 320, card_y0 + 80], radius=12, fill=(255, 255, 255, 30))
    draw.text((card_x0 + 60, card_y0 + 45), tag.upper(), fill=(255, 255, 255, 230))

    # Title & Subtitle
    draw.text((width // 2, height // 2 - 20), title[:50], fill=(255, 255, 255, 255), anchor="mm")
    draw.text((width // 2, height // 2 + 50), subtitle[:80], fill=(210, 225, 255, 220), anchor="mm")

    img.save(dest, "PNG")

    # Index in asset library
    save_asset_meta(AssetMeta(
        id=f"gen_{dest.stem}",
        original_filename=filename,
        stored_filename=filename,
        file_path=str(dest),
        url=f"/api/assets/raw/{filename}?sample=true",
        mime_type="image/png",
        size_bytes=dest.stat().st_size,
        media_type="image",
        width=width,
        height=height
    ))

    return dest

def build_dynamic_scene_content(
    clean_prompt: str,
    style: str,
    index: int,
    total_scenes: int,
    doc_lines: List[str]
) -> Tuple[str, str, str, str]:
    """Dynamically generates contextual title, subtitle, voiceover, and motion for a scene based on the user's prompt."""
    topic = clean_prompt.strip()
    words = re.findall(r'\b[A-Za-z0-9_-]+\b', topic)
    short_topic = " ".join(words[:5]) if words else "Video Concept"
    
    # Progress phase in story
    phase_ratio = index / max(1, total_scenes - 1)
    
    if doc_lines and index < len(doc_lines):
        line = doc_lines[index]
        scene_title = f"{short_topic}: Part {index + 1}"
        scene_sub = line[:75]
        scene_vo = f"Examining: {line}. This directly shapes our understanding of {short_topic}."
        motion = "ken_burns_zoom_in" if index % 2 == 0 else "pan_left"
        return scene_title, scene_sub, scene_vo, motion

    if style == "cartoon":
        if phase_ratio == 0:
            scene_title = f"Story Time: {short_topic}"
            scene_sub = f"An exciting adventure begins with {short_topic}"
            scene_vo = f"Welcome everyone! Today our story takes us into the wonderful world of {topic}."
            motion = "cartoon_bounce"
        elif phase_ratio < 0.6:
            scene_title = f"Exploring {short_topic}"
            scene_sub = "Discovering new clues and exciting secrets along the way"
            scene_vo = f"Look closely! Every step brings us closer to understanding {short_topic}."
            motion = "ken_burns_zoom_in"
        elif phase_ratio < 0.9:
            scene_title = f"The Big Challenge!"
            scene_sub = "Facing the obstacle with creativity and courage"
            scene_vo = f"With quick thinking and determination, the challenge is met head on!"
            motion = "cartoon_bounce"
        else:
            scene_title = f"Celebration & Victory"
            scene_sub = f"A happy resolution for {short_topic}"
            scene_vo = f"And so our joyful adventure with {short_topic} comes to an inspiring end!"
            motion = "ken_burns_zoom_out"

    elif style == "educational":
        if phase_ratio == 0:
            scene_title = f"Overview: {short_topic}"
            scene_sub = f"Foundational concepts and importance of {short_topic}"
            scene_vo = f"In this visual explainer, we examine {topic} and why it matters."
            motion = "ken_burns_zoom_in"
        elif phase_ratio < 0.6:
            scene_title = f"Key Mechanics: {short_topic}"
            scene_sub = "Breaking down the core principles step by step"
            scene_vo = f"Let us look under the surface at the fundamental mechanisms that drive {short_topic}."
            motion = "pan_left"
        elif phase_ratio < 0.9:
            scene_title = f"Real-World Impact & Analysis"
            scene_sub = "Practical applications, experiments, and observed data"
            scene_vo = f"Notice how this applies in practice, delivering real results and measurable impact."
            motion = "ken_burns_zoom_in"
        else:
            scene_title = f"Key Takeaways & Summary"
            scene_sub = f"Mastering the essential insights of {short_topic}"
            scene_vo = f"To summarize: remembering these core insights gives you a complete grasp of {short_topic}."
            motion = "ken_burns_zoom_out"

    elif style == "social":
        if phase_ratio == 0:
            scene_title = f"Stop Scrolling! ⚡ {short_topic}"
            scene_sub = f"The truth about {short_topic} you need right now"
            scene_vo = f"Stop scrolling! Here is what you really need to know about {topic}."
            motion = "ken_burns_zoom_in"
        elif phase_ratio < 0.6:
            scene_title = f"The Secret Behind {short_topic}"
            scene_sub = "Here is what happens behind the scenes"
            scene_vo = f"Most people get this completely wrong. Here is how it actually works."
            motion = "pan_right"
        elif phase_ratio < 0.9:
            scene_title = f"Step-by-Step Action Plan"
            scene_sub = "How you can apply this immediately"
            scene_vo = f"Here is the simple, high-impact routine you can use starting today."
            motion = "ken_burns_zoom_in"
        else:
            scene_title = f"Save & Share This! 🚀"
            scene_sub = f"Follow for more daily insights on {short_topic}"
            scene_vo = f"Double tap if this helped you and share it with someone who needs it!"
            motion = "ken_burns_zoom_out"

    else:  # natural / ai_generated / visualizer
        if phase_ratio == 0:
            scene_title = f"Vision: {short_topic}"
            scene_sub = f"A visual journey into {short_topic}"
            scene_vo = f"Entering the atmosphere of {topic}. Light, texture, and rhythm converge."
            motion = "ken_burns_zoom_in"
        elif phase_ratio < 0.6:
            scene_title = f"Depth & Elements: {short_topic}"
            scene_sub = "Nuanced details emerge across the perspective"
            scene_vo = f"Observing the intricate details and motion within {short_topic}."
            motion = "pan_left"
        elif phase_ratio < 0.9:
            scene_title = f"The Climax of Form"
            scene_sub = "Dynamic energy reaches its peak state"
            scene_vo = f"Every component locks into harmonious alignment as the scene evolves."
            motion = "ken_burns_zoom_in"
        else:
            scene_title = f"Lasting Horizons: {short_topic}"
            scene_sub = "A serene, lasting perspective"
            scene_vo = f"Reflecting on the horizon of {topic}. Created with FreeVerse Video Studio."
            motion = "ken_burns_zoom_out"

    return scene_title, scene_sub, scene_vo, motion

def generate_storyboard_from_prompt(req: PromptGenerateRequest) -> Project:
    """
    Transforms natural language prompt or document into a structured video project with
    scenes, camera motion, narration scripts, and pre-generated visual cards.
    """
    clean_prompt = req.prompt.strip()
    style = req.style
    scene_count = min(req.scene_count or 4, 8)
    per_scene_duration = round(max(3.0, req.target_duration / scene_count), 1)

    # Determine default aspect ratio
    aspect: AspectRatio = "9:16" if style == "social" else "16:9"

    # Select color themes
    palette = STYLE_PALETTES.get(style, STYLE_PALETTES["natural"])

    # Extract key concepts or bullet points if document provided
    doc_lines = []
    if req.source_document:
        doc_lines = [l.strip("#-* ") for l in req.source_document.split("\n") if len(l.strip()) > 10]

    # Generate scene outlines based on style
    scenes: List[Scene] = []
    
    for i in range(scene_count):
        theme = palette[i % len(palette)]
        col1, col2, tag, accent = theme

        scene_title, scene_sub, scene_vo, motion = build_dynamic_scene_content(
            clean_prompt=clean_prompt,
            style=style,
            index=i,
            total_scenes=scene_count,
            doc_lines=doc_lines
        )

        # Procedural visual card
        w, h = (1080, 1920) if aspect == "9:16" else (1920, 1080)
        img_path = create_procedural_scene_image(
            title=scene_title,
            subtitle=scene_sub,
            tag=f"Scene {i+1} • {style.replace('_', ' ').title()}",
            col1=col1,
            col2=col2,
            accent=accent,
            width=w,
            height=h
        )

        scenes.append(Scene(
            id=f"scene_{uuid.uuid4().hex[:8]}",
            title=f"Scene {i+1}: {scene_title}",
            duration=per_scene_duration,
            asset_id=f"gen_{img_path.stem}",
            asset_url=f"/api/assets/raw/{img_path.name}?sample=true",
            text_overlay=f"{scene_title}\n{scene_sub}",
            text_position="bottom",
            transition="fade",
            transition_duration=0.5,
            motion_effect=motion,
            voiceover_text=scene_vo if req.include_voiceover else None,
            order=i
        ))

    # Create project instance
    proj = Project(
        id=str(uuid.uuid4()),
        title=f"{style.replace('_', ' ').title()} - {clean_prompt[:30]}",
        description=f"Generated via FreeVerse Smart Storyboard Engine.\nPrompt: {clean_prompt}",
        style=style,
        aspect_ratio=aspect,
        resolution="1080p",
        fps=30,
        scenes=scenes,
        audio_tracks=[
            AudioTrack(
                id=f"audio_{uuid.uuid4().hex[:8]}",
                title="Cinematic Ambient Track",
                type="music",
                volume=0.8,
                fade_in=1.0,
                fade_out=1.5,
                ducking=True
            )
        ]
    )

    return proj
