# PPQ Voice

PPQ Voice is a lightweight Electron desktop app that turns any text field into a dictation box. Press a single hotkey, speak, and the app streams your audio directly to OpenAI’s speech-to-text API. The finished text is automatically cleaned up (Optionally by OpenAI, Anthropic Claude, or Google Gemini) and pasted wherever your cursor was. No local models, no Python installs—just reliable cloud transcription with a tidy UI.

## Why Teams Use PPQ Voice

- **Cloud-first dictation** – Streams audio to OpenAI Whisper API for fast, consistent transcriptions.
- **Automatic paste + history** – Captured text is pasted into the active app and stored locally in SQLite.
- **AI clean-up pipeline** – Optional refinement via OpenAI Responses, Anthropic Claude, or Gemini models.
- **Cross-platform** – macOS, Windows, and Linux packages powered by Electron + Vite.
- **Ops-friendly** – Toggle `PPQVOICE_DEBUG=true` to write rich logs to the user data directory.
- **Zero local-model overhead** – No llama.cpp builds, Python dependencies, or multi-GB downloads.

## Quick Start

```bash
git clone https://github.com/HeroTools/ppq-voice.git
cd ppq-voice
npm install
cp env.example .env   # add your OpenAI / optional Anthropic+Gemini keys
npm run dev           # launches Vite + Electron with hot reload
```

Want the production build? Run `npm start` to launch Electron with the prebuilt renderer bundle.

## Configuration

### `.env` keys

| Key | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | ✅ | Used for speech-to-text and (optionally) reasoning. |
| `ANTHROPIC_API_KEY` | optional | Enables Claude-based text clean-up. |
| `GEMINI_API_KEY` | optional | Enables Gemini-based text clean-up. |
| `PPQVOICE_OPENAI_BASE_URL` | optional | Override the default OpenAI base (HTTPS or localhost only). |
| `PPQVOICE_TRANSCRIPTION_BASE_URL` | optional | Override the transcription endpoint separately. |
| `PPQVOICE_DEBUG` | optional | `true` writes detailed logs to `~/Library/Application Support/ppq-voice/logs` (platform-specific equivalents). |

All other preferences (language, reasoning model, hotkeys, API fallbacks) can be changed inside the Control Panel UI. They persist in `localStorage` and synchronize with the renderer.

## NPM Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Runs Vite + Electron with live reload. |
| `npm start` | Launches Electron in production mode (expects a built renderer). |
| `npm run build` | Builds the renderer and packages the desktop app for the current OS. |
| `npm run pack` | Prepares an unsigned directory build (great for quick installs). |
| `npm run lint` | Runs ESLint on the renderer source (`src/`). |
| `npm run clean` | Sweeps `dist/`, `src/dist/`, and resets the dev SQLite DB. |

## Building Installers

```bash
npm run pack                # unsigned build (all platforms)
npm run build:mac           # macOS DMG/ZIP
npm run build:win           # Windows NSIS + portable
npm run build:linux         # Linux AppImage + deb
```

Artifacts land in `dist/`. On macOS the unsigned app lives at `dist/mac-arm64/PPQ Voice.app`; Windows gets `dist/win-unpacked/PPQ Voice.exe`.

## Permissions You’ll Need

PPQ Voice needs two macOS permissions (Windows/Linux equivalents are requested automatically):

1. **Microphone** – required for recording audio.
2. **Accessibility** – needed so the app can paste transcriptions for you.

You can revisit both in **Control Panel → Settings → Permissions** if something stops working. The onboarding wizard also walks through granting them.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| “OpenAI key not found” | Confirm `.env` + Control Panel → AI Keys has a valid value. |
| Nothing pastes after transcription | Re-request Accessibility permission from Settings, then relaunch the app. |
| Need extra logs | Run `PPQVOICE_DEBUG=true npm start` (or `npm run dev -- --debug`). Logs go to `%APPDATA%/ppq-voice/logs`, `~/Library/Application Support/ppq-voice/logs`, or `~/.config/ppq-voice/logs`. |
| Updater stuck | Use Control Panel → Settings → Updates → “Download Update” to retry, or grab the latest release from GitHub. |

## Support & Feedback

- Email: [support@ppqvoice.com](mailto:support@ppqvoice.com)
- Issues: [github.com/HeroTools/ppq-voice/issues](https://github.com/HeroTools/ppq-voice/issues)

## License

[MIT](LICENSE) – you can use PPQ Voice for commercial or personal projects. Contributions and forks are welcome.
