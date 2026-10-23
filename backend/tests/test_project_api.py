import pytest
from app.models.project import Project, ProjectCreate, Scene
from app.core.storage import save_project, load_project, list_projects, delete_project

def test_project_crud():
    # 1. Create
    p = Project(
        title="Test Adventure Video",
        style="cartoon",
        aspect_ratio="16:9",
        scenes=[
            Scene(title="Scene 1", duration=3.0, text_overlay="Hello World")
        ]
    )
    saved = save_project(p)
    assert saved.id == p.id
    assert len(saved.scenes) == 1

    # 2. Read
    loaded = load_project(p.id)
    assert loaded is not None
    assert loaded.title == "Test Adventure Video"
    assert loaded.scenes[0].text_overlay == "Hello World"

    # 3. Update
    loaded.title = "Updated Video Title"
    loaded.scenes.append(Scene(title="Scene 2", duration=4.0))
    save_project(loaded)

    reloaded = load_project(p.id)
    assert reloaded.title == "Updated Video Title"
    assert len(reloaded.scenes) == 2

    # 4. List
    all_projs = list_projects()
    assert any(x.id == p.id for x in all_projs)

    # 5. Delete
    deleted = delete_project(p.id)
    assert deleted is True
    assert load_project(p.id) is None
