# PPQ Voice – Assistant Technical Notes

Use this doc whenever you need quick architectural context while working on the repo.

## 1. What PPQ Voice Does

PPQ Voice is an Electron 36 desktop app (React 19 renderer) that:

1. Listens for a global hotkey (default `\``).
2. Records audio via the browser’s `MediaRecorder`.
3. Streams the audio blob to OpenAI’s Whisper API (cloud-only).
4. Optionally runs the transcript through a reasoning model (OpenAI Responses, Anthropic Claude, or Google Gemini).
5. Pastes the final text wherever the user’s cursor sits and stores it in a local SQLite DB.

There is **no** local inferencing, Python bridge, or llama.cpp dependency anymore. Everything runs in the renderer + Electron main process.

## 2. High-Level Architecture

```
Renderer (React/Vite)
 ├─ audioManager.js ........ handles recording, sending to cloud APIs, reasoning pipeline
 ├─ ReasoningService.ts .... routes clean-up to OpenAI / Anthropic / Gemini
 ├─ UI (App.jsx, SettingsPage.tsx, OnboardingFlow.tsx, etc.)
 └─ Hooks (useSettings, useAudioRecording, usePermissions, useLocalStorage)

Preload (preload.js)
 └─ Exposes whitelisted IPC methods (clipboard, db, settings, updater, etc.)

Main process (Electron)
 ├─ main.js ................ bootstraps managers + windows
 ├─ ipcHandlers.js ......... registers IPC endpoints used by the renderer
 ├─ clipboard.js / tray.js / windowManager.js / menuManager.js
 ├─ database.js ............ wraps better-sqlite3 for transcription history
 ├─ environment.js ......... loads and persists API keys (.env under userData)
 └─ updater.js ............. electron-updater wiring for GitHub releases
```

## 3. Key Flows

### Dictation

1. `AudioManager.startRecording()` – uses `navigator.mediaDevices.getUserMedia`.
2. On stop → converts blob to WAV → `optimizeAudio` (16 kHz mono) → `processWithOpenAIAPI`.
3. Sends `multipart/form-data` to `API_ENDPOINTS.TRANSCRIPTION` (default `https://api.openai.com/v1/audio/transcriptions` or overridden via `PPQVOICE_TRANSCRIPTION_BASE_URL`).
4. On success, runs `processTranscription`, optionally piping through `ReasoningService`.
5. Calls `window.electronAPI.pasteText` and `saveTranscription`.

### ReasoningService

- Resolves provider from `reasoningModel` (`openai`, `anthropic`, `gemini`).
- Uses cached API keys via `SecureCache`.
- For OpenAI it tries `/responses` first, then `/chat/completions` if needed.
- For Anthropic/Gemini it makes fetch calls from the renderer (no CORS issues thanks to Electron).
- Logs every stage via `window.electronAPI.logReasoning`.

## 4. Settings + Storage

`src/hooks/useSettings.ts` centralises everything. Keys currently stored in `localStorage`:

- `preferredLanguage` – used to pre-fill the transcription request.
- `cloudTranscriptionBaseUrl`, `cloudReasoningBaseUrl` – optional overrides; validated to HTTPS or localhost.
- `useReasoningModel`, `reasoningModel` – toggles the clean-up step and chosen model ID.
- `openaiApiKey`, `anthropicApiKey`, `geminiApiKey` – cached in renderer (also mirrored to `.env` via `environment.js`).
- `dictationKey` – user’s chosen hotkey.
- `agentName`, `customPrompts` – used by Prompt Studio + ReasoningService.

## 5. Permissions & Windows

- `usePermissions.ts` checks mic + accessibility.
- `WindowManager` spawns two BrowserWindows:
  - Main dictation overlay (frameless, always-on-top, 240×240).
  - Control Panel (1200×800, hidden until needed).
- Menus/Tray live in `menuManager.js` and `tray.js`.

## 6. Database Schema

`src/helpers/database.js` uses better-sqlite3. Table definition (see file for migrations):

```sql
CREATE TABLE IF NOT EXISTS transcriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Records are appended via IPC (`db-save-transcription`). There’s a cleanup helper in `cleanup.js` that wipes the dev DB under `~/Library/Application Support/ppq-voice/transcriptions-dev.db` (platform-specific path equivalents exist for Windows/Linux).

## 7. Debugging

- Set `PPQVOICE_DEBUG=true` (in `.env` or env var) **or** run the app with `--debug`.
- Logs live in `userData/logs/debug-*.log` – the path is printed on startup when debug mode is on.
- You can also run `npm run dev -- --debug` to flip the same switch.

## 8. Building & Releases

- Renderer build: `npm run build:renderer`.
- Desktop packaging: `electron-builder` via `npm run build`, `build:mac`, etc.
- GitHub auto-updates: configured in `electron-builder.json` + `src/updater.js` (owner `HeroTools`, repo `ppq-voice`).

## 9. Things Removed Compared to OpenWhispr

- No `whisper.js`, `pythonInstaller`, `modelManager`, or llama.cpp tooling.
- No local model download UI (`WhisperModelPicker`, `ProcessingModeSelector`, `LocalReasoningService`, etc.).
- All docs now assume cloud workflows only.

Use this doc whenever you need quick bearings—everything else lives in the source files noted above.
