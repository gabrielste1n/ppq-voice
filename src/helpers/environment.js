const path = require("path");
const fs = require("fs");
const { app } = require("electron");

class EnvironmentManager {
  constructor() {
    this.loadEnvironmentVariables();
  }

  loadEnvironmentVariables() {
    // In production, try multiple locations for .env file
    const possibleEnvPaths = [
      // Development path
      path.join(__dirname, "..", ".env"),
      // Production packaged app paths
      path.join(process.resourcesPath, ".env"),
      path.join(process.resourcesPath, "app.asar.unpacked", ".env"),
      path.join(app.getPath("userData"), ".env"), // User data directory
      // Legacy paths
      path.join(process.resourcesPath, "app", ".env"),
    ];

    let envLoaded = false;

    for (const envPath of possibleEnvPaths) {
      try {
        if (fs.existsSync(envPath)) {
          const result = require("dotenv").config({ path: envPath });
          if (!result.error) {
            envLoaded = true;
            break;
          }
        }
      } catch (error) {
        // Continue to next path
      }
    }
  }

  getPPQApiKey() {
    const apiKey = process.env.PPQ_API_KEY || process.env.OPENAI_API_KEY;
    return apiKey || "";
  }

  savePPQApiKey(key) {
    try {
      // Update the environment variable in memory for immediate use
      process.env.PPQ_API_KEY = key;
      // Persist all keys to file
      this.saveAllKeysToEnvFile();
      return { success: true };
    } catch (error) {
      // Silent error - already throwing
      throw error;
    }
  }

  createProductionEnvFile(apiKey) {
    try {
      const envPath = path.join(app.getPath("userData"), ".env");

      const envContent = `# PPQ Voice Environment Variables
# This file was created automatically for production use
PPQ_API_KEY=${apiKey}
`;

      fs.writeFileSync(envPath, envContent, "utf8");

      require("dotenv").config({ path: envPath });

      return { success: true, path: envPath };
    } catch (error) {
      // Silent error - already throwing
      throw error;
    }
  }

  saveAllKeysToEnvFile() {
    try {
      const envPath = path.join(app.getPath("userData"), ".env");
      
      // Build env content with all current keys
      let envContent = `# PPQ Voice Environment Variables
# This file was created automatically for production use
`;
      
      if (process.env.PPQ_API_KEY) {
        envContent += `PPQ_API_KEY=${process.env.PPQ_API_KEY}\n`;
      } else if (process.env.OPENAI_API_KEY) {
        // Legacy fallback so existing environments continue to work
        envContent += `PPQ_API_KEY=${process.env.OPENAI_API_KEY}\n`;
      }

      fs.writeFileSync(envPath, envContent, "utf8");
      
      // Reload the env file
      require("dotenv").config({ path: envPath });

      return { success: true, path: envPath };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EnvironmentManager;
