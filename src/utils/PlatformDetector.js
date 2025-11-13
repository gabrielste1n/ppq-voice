const PlatformType = {
  MACOS: "darwin",
  WINDOWS: "win32",
  LINUX: "linux",
};

class PlatformDetector {
  static get current() {
    return process.platform;
  }

  static isMacOS() {
    return this.current === PlatformType.MACOS;
  }

  static isWindows() {
    return this.current === PlatformType.WINDOWS;
  }

  static isLinux() {
    return this.current === PlatformType.LINUX;
  }
}

module.exports = { PlatformDetector, PlatformType };
