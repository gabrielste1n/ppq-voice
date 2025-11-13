class StorageManager {
  static getLocalStorageValue(key, defaultValue, parser = null) {
    if (typeof window === "undefined" || !window.localStorage) {
      return defaultValue;
    }

    const value = window.localStorage.getItem(key);
    if (!value) {
      return defaultValue;
    }

    if (parser) {
      try {
        return parser(value);
      } catch (error) {
        return defaultValue;
      }
    }

    return value;
  }

  static setLocalStorageValue(key, value) {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
    return false;
  }

  static removeLocalStorageValue(key) {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
      return true;
    }
    return false;
  }
}

export default StorageManager;
