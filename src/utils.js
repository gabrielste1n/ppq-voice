const fs = require("fs");
const path = require("path");
const os = require("os");
const { app } = require("electron");
const debugLogger = require("./helpers/debugLogger");

class AppUtils {
  static cleanup(mainWindow) {
    debugLogger.logEvent("cleanup", "process-start");

    try {
      const dbPath = path.join(
        app.getPath("userData"),
        process.env.NODE_ENV === "development"
          ? "transcriptions-dev.db"
          : "transcriptions.db"
      );
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
        debugLogger.logEvent("cleanup", "database-deleted", { path: dbPath });
      }
    } catch (error) {
      debugLogger.error("cleanup", "database-delete-error", {
        error: error.message,
        stack: error.stack
      });
    }

    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents
        .executeJavaScript("localStorage.clear()")
        .then(() => {
          debugLogger.logEvent("cleanup", "local-storage-cleared");
        })
        .catch((error) => {
          debugLogger.error("cleanup", "local-storage-error", {
            error: error.message
          });
        });
    }

    debugLogger.logEvent("cleanup", "permissions-reminder", {
      message: "Manually remove accessibility and microphone permissions if needed"
    });

    try {
      const envPath = path.join(app.getPath("userData"), ".env");
      if (fs.existsSync(envPath)) {
        fs.unlinkSync(envPath);
        debugLogger.logEvent("cleanup", "env-file-deleted", { path: envPath });
      }
    } catch (error) {
      debugLogger.error("cleanup", "env-file-delete-error", {
        error: error.message,
        stack: error.stack
      });
    }

    debugLogger.logEvent("cleanup", "process-completed");
  }
}

module.exports = AppUtils;
