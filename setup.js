const fs = require("fs");
const path = require("path");

console.log("Setting up PPQ Voice...");

const envTemplate = `# PPQ Voice Environment Variables
# Required: OpenAI key for transcription
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Claude + Gemini keys for text refinement
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# Optional: Override API bases (HTTPS only)
PPQVOICE_OPENAI_BASE_URL=
PPQVOICE_TRANSCRIPTION_BASE_URL=

# Optional: Verbose logging toggle
PPQVOICE_DEBUG=false`;

if (!fs.existsSync(".env")) {
  fs.writeFileSync(".env", envTemplate);
  console.log("✅ Created .env file template");
} else {
  console.log("⚠️  .env file already exists");
}

console.log(`
🎉 Setup complete!

Next steps:
1. Add your OpenAI API key to the .env file
2. Install dependencies: npm install
3. Run the app: npm start

Features enabled immediately:
- Global hotkey (default: backtick \`) that you can remap in the Control Panel
- Floating dictation panel you can drag anywhere
- Automatic paste at the cursor the moment text is ready
- Optional AI clean-up using OpenAI, Anthropic, or Gemini

Just grant microphone + accessibility permissions when prompted and you're good to go.`;
`);
