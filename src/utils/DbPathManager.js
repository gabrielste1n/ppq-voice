const path = require("path");
const { app } = require("electron");

class DbPathManager {
  static getDbFileName() {
    return process.env.NODE_ENV === "development"
      ? "transcriptions-dev.db"
      : "transcriptions.db";
  }

  static getDbPath() {
    return path.join(app.getPath("userData"), this.getDbFileName());
  }
}

module.exports = DbPathManager;
