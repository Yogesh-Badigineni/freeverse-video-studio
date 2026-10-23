import pytest
from app.models.render_job import PromptGenerateRequest
from app.core.procedural_gen import generate_storyboard_from_prompt

def test_generate_cartoon_storyboard():
    req = PromptGenerateRequest(
        prompt="A brave little fox exploring an enchanted forest",
        style="cartoon",
        target_duration=16.0,
        scene_count=4,
        include_voiceover=True
    )
    proj = generate_storyboard_from_prompt(req)
    assert proj.style == "cartoon"
    assert len(proj.scenes) == 4
    assert proj.scenes[0].duration == 4.0
    assert proj.scenes[0].text_overlay is not None
    assert proj.scenes[0].voiceover_text is not None
    assert proj.scenes[0].asset_id is not None

def test_generate_social_storyboard():
    req = PromptGenerateRequest(
        prompt="Top 3 productivity hacks you need in 2026",
        style="social",
        target_duration=15.0,
        scene_count=3,
        include_voiceover=True
    )
    proj = generate_storyboard_from_prompt(req)
    assert proj.style == "social"
    assert proj.aspect_ratio == "9:16"  # Vertical format for social/shorts
    assert len(proj.scenes) == 3

def test_generate_educational_from_document():
    doc = """
    # Photosynthesis Mechanics
    - Light-dependent reactions convert solar photons into chemical energy.
    - The Calvin cycle produces glucose from atmospheric carbon dioxide.
    - Essential for all terrestrial and marine life.
    """
    req = PromptGenerateRequest(
        prompt="Photosynthesis explainer",
        style="educational",
        target_duration=20.0,
        scene_count=4,
        source_document=doc
    )
    proj = generate_storyboard_from_prompt(req)
    assert proj.style == "educational"
    assert len(proj.scenes) == 4
    assert any("Photosynthesis" in s.title or "Photosynthesis" in (s.text_overlay or "") for s in proj.scenes)
