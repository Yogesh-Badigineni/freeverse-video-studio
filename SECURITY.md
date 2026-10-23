# Security Policy & Defense in Depth

## Security Philosophy
FreeVerse Video Studio is committed to the highest standards of software security, privacy, and integrity. As a local-first application processing untrusted user media and AI prompts, security controls are implemented at every layer of the system.

## Supported Versions
| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Controls Implemented

### 1. Zero Command Injection (CWE-78)
All process invocations to FFmpeg, FFprobe, and system tools are executed via safe argument arrays:
```python
subprocess.run([FFMPEG_EXE, "-y", "-i", str(input_file), ...], shell=False)
```
Shell interpretation (`shell=True`) is strictly prohibited throughout the entire codebase, eliminating shell character injection risks.

### 2. Path Traversal & Directory Escape Prevention (CWE-22)
All file read, write, and deletion operations validate the resolved absolute path against designated sandbox roots using canonical resolution (`resolve_safe_path`):
- Dangerous sequences (`../`, `..\\`, null bytes, drive roots) are rejected immediately with HTTP 400.
- Filenames are sanitized via regex `[^a-zA-Z0-9_\-\.]` and length-limited.

### 3. Strict Upload & MIME Type Validation (CWE-434)
Uploads are validated on multiple independent tiers:
- File extension matching against an explicit whitelist (`.png`, `.jpg`, `.mp4`, `.webm`, `.mp3`, `.wav`, etc.).
- MIME prefix enforcement (`image/`, `video/`, `audio/`, `text/`).
- File size guardrails (150MB per file limit).
- Deep image verification using PIL to prevent disguised executable payloads.

### 4. Loopback Network Boundary & SSRF Defense (CWE-918)
- Both the FastAPI backend and Vite frontend listen strictly on the loopback interface (`127.0.0.1`), never exposing open ports to the local area network or internet.
- Model discovery calls validate that target URLs strictly begin with `http://127.0.0.1:` or `http://localhost:` to prevent SSRF.

### 5. Automated Static Application Security Testing (SAST)
- Regular Bandit security scans pass with **0 High and 0 Medium** vulnerabilities.
- Dependency audit (`pip-audit` / `npm audit`) confirms 0 known CVEs.

## Reporting a Vulnerability
If you discover a security vulnerability, please do NOT create a public issue. Instead, report it privately to:
- **Email:** `security@freeverse-studio.org` (or open a confidential GitHub Advisory)

We will acknowledge receipt within 48 hours and provide a timeline for remediation.
