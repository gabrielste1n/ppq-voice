# PPQ Voice Debugging Guide

Use debug logging when you need deeper insight into the microphone, transcription, or reasoning pipeline.

## Enabling Debug Mode

### Option 1 – CLI flag
```bash
# macOS
/Applications/PPQ\ Voice.app/Contents/MacOS/PPQ\ Voice --debug

# Windows
"C:\Program Files\PPQ Voice\PPQ Voice.exe" --debug
```

### Option 2 – Environment variable
```bash
# macOS / Linux
export PPQVOICE_DEBUG=true
open /Applications/PPQ\ Voice.app

# Windows (PowerShell)
$env:PPQVOICE_DEBUG="true"
Start-Process "C:\Program Files\PPQ Voice\PPQ Voice.exe"
```

Debug mode is off by default. Remove the flag/variable to disable it.

## Where Logs Live

- **macOS** – `~/Library/Application Support/ppq-voice/logs/debug-<timestamp>.log`
- **Windows** – `%APPDATA%\ppq-voice\logs\debug-<timestamp>.log`
- **Linux** – `~/.config/ppq-voice/logs/debug-<timestamp>.log`

Each launch in debug mode creates a new timestamped file.

## What Gets Logged

| Stage | Details captured |
| --- | --- |
| Hotkey & permissions | Registration status, mic/accessibility prompts, failure reasons. |
| Audio capture | Device metadata, recording duration, blob size, optimization results. |
| Groq transcription | Endpoint used, payload size, HTTP status, error body if non-200. |
| ReasoningService | Provider routing, API choices (`/responses` vs `/chat`), retries, timing. |
| Clipboard / database | Paste attempts, SQLite insert status, error stacks if operations fail. |

All entries are timestamped and marked with emojis (`🎤`, `🤖`, `📡`, etc.) to make scanning easier.

## Reading the Logs

Common entries:

- `🎤 AUDIO_RECORDER_START` / `STOP` – recording lifecycle. Zero-length blobs usually mean the microphone is muted or in use elsewhere.
- `📡 TRANSCRIPTION_REQUEST` – shows which base URL was used and the payload size. If you set `PPQVOICE_TRANSCRIPTION_BASE_URL`, confirm it appears here.
- `❌ TRANSCRIPTION_ERROR` – includes HTTP status and truncated response text. Check for expired API keys or unsupported models.
- `🤖 REASONING_*` – selection + response for Groq clean-up. Failures include Groq-specific error messages and request IDs.
- `📋 PASTE_ERROR` – indicates accessibility permission problems.

## Troubleshooting Cheatsheet

| Message | Action |
| --- | --- |
| `Microphone Access Denied` | Re-run onboarding or go to System Settings → Privacy & Security → Microphone. |
| `401 Unauthorized` in transcription | The PPQ (Groq) key is missing/invalid. Update `.env` and restart. |
| `Only HTTPS endpoints are allowed` | Custom base URLs must be HTTPS or localhost. |
| `Reasoning provider unavailable` | Ensure the relevant API key is set in Settings → AI Models. |
| `Paste failed` | Re-grant Accessibility permission and restart the app. |

## Sharing Logs

1. Enable debug mode and reproduce the issue.
2. Open the most recent file from the log directory above.
3. Redact API keys if they appear (the app tries to avoid logging them).
4. Attach the relevant excerpt when filing an issue or emailing support.
