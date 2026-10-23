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

        if style == "cartoon":
            titles = [
                f"Once Upon a Time: {clean_prompt[:30]}",
                "A Surprising Discovery in the Meadow",
                "Working Together to Save the Day",
                "Celebrating Friendship and Joy!"
            ]
            subtitles = [
                "A bright and sunny morning full of wonder",
                "The cheerful heroes find an unexpected clue",
                "Teamwork makes the biggest challenges easy",
                "Everyone dances under the colorful rainbow!"
            ]
            voiceovers = [
                f"Welcome to our story! Today we explore: {clean_prompt}.",
                "Look over there! Something magical is happening.",
                "With quick thinking and kindness, they overcame the obstacle.",
                "And they lived happily ever after. The end!"
            ]
            motion = "cartoon_bounce" if i % 2 == 1 else "ken_burns_zoom_in"
            
        elif style == "educational":
            titles = [
                f"Introduction: {clean_prompt[:35]}",
                "Core Concept & Foundations",
                "Real-World Application & Data",
                "Key Takeaways & Summary"
            ]
            subtitles = [
                "Understanding the basics and why it matters",
                doc_lines[0] if doc_lines else "Breaking down the mechanics step by step",
                doc_lines[1] if len(doc_lines) > 1 else "How this impacts modern science and industry",
                "Essential facts to remember for future study"
            ]
            voiceovers = [
                f"In this lesson, we break down {clean_prompt}.",
                "First, let us examine the foundational mechanism and definition.",
                "Notice how this applies in real world observations and experiments.",
                "To summarize, remembering these key points gives you full mastery."
            ]
            motion = "pan_left" if i % 2 == 1 else "ken_burns_zoom_in"

        elif style == "social":
            titles = [
                f"Did You Know This? 🚀",
                "Here is What Actually Happens",
                "The 3-Step Shortcut You Need",
                "Save & Share This Now!"
            ]
            subtitles = [
                clean_prompt[:45],
                "Most people get this completely wrong",
                "Instant results with this proven method",
                "Follow for more daily creative breakdowns"
            ]
            voiceovers = [
                f"Stop scrolling! Here is the truth about {clean_prompt}.",
                "Most people don't know this simple secret.",
                "Here is the exact method you should use right now.",
                "Double tap if this helped and share it with a friend!"
            ]
            motion = "ken_burns_zoom_in"

        else: # natural / ai_generated
            titles = [
                f"Vision: {clean_prompt[:30]}",
                "Atmosphere and Depth",
                "Climax of the Horizon",
                "A Lasting Impression"
            ]
            subtitles = [
                "Capturing the essence and motion of the scene",
                "Subtle details emerge through natural light",
                "The focal energy reaches its peak",
                "Silence settles over the cinematic vista"
            ]
            voiceovers = [
                f"An exploration into {clean_prompt}.",
                "Every element comes together in harmonious balance.",
                "Notice the depth and transition in this perspective.",
                "Thank you for watching FreeVerse Video Studio."
            ]
            motion = "ken_burns_zoom_in" if i % 2 == 0 else "ken_burns_zoom_out"

        scene_title = titles[i % len(titles)]
        scene_sub = subtitles[i % len(subtitles)]
        scene_vo = voiceovers[i % len(voiceovers)]

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
