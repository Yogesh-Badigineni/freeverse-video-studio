import pytest
from pathlib import Path
from fastapi import HTTPException
from app.core.security import sanitize_filename, resolve_safe_path, validate_uploaded_file

def test_sanitize_filename():
    assert sanitize_filename("normal_video.mp4") == "normal_video.mp4"
    # Strips directory traversal
    assert sanitize_filename("../../etc/passwd") == "passwd"
    assert sanitize_filename("..\\..\\windows\\system32\\cmd.exe") == "cmd.exe"
    # Strips dangerous special characters
    assert sanitize_filename("my file; rm -rf.mp4") == "my_file__rm_-rf.mp4"
    # Handles null bytes
    assert sanitize_filename("test\x00file.png") == "testfile.png"
    # Truncates excessively long names
    long_name = "a" * 200 + ".jpg"
    sanitized = sanitize_filename(long_name)
    assert len(sanitized) <= 100
    assert sanitized.endswith(".jpg")

def test_resolve_safe_path_blocks_traversal(tmp_path):
    base_dir = tmp_path / "sandbox"
    base_dir.mkdir()

    # Normal file inside sandbox
    safe_path = resolve_safe_path(base_dir, "clean_video.mp4")
    assert safe_path.parent == base_dir.resolve()

    # Attempt to escape via relative dots
    safe_traversal = resolve_safe_path(base_dir, "../../../secret.txt")
    assert safe_traversal.parent == base_dir.resolve()
    assert safe_traversal.name == "secret.txt"

def test_validate_uploaded_file_types():
    # Valid extensions
    assert validate_uploaded_file("clip.mp4", "video/mp4", 1024) == "video"
    assert validate_uploaded_file("scene.png", "image/png", 1024) == "image"
    assert validate_uploaded_file("music.mp3", "audio/mpeg", 1024) == "audio"
    assert validate_uploaded_file("notes.md", "text/markdown", 1024) == "document"

    # Blocked dangerous extensions
    with pytest.raises(HTTPException) as exc_info:
        validate_uploaded_file("malicious.exe", "application/x-msdownload", 1024)
    assert exc_info.value.status_code == 400

    with pytest.raises(HTTPException) as exc_info:
        validate_uploaded_file("script.py", "text/x-python", 1024)
    assert exc_info.value.status_code == 400

    # Oversized file
    with pytest.raises(HTTPException) as exc_info:
        validate_uploaded_file("huge.mp4", "video/mp4", 200 * 1024 * 1024)
    assert exc_info.value.status_code == 413
