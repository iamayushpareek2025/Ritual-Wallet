export class StorageService {
  /**
   * Retrieves data from chrome.storage.local or fallback localStorage.
   */
  public static async get<T>(keys: string[] | string | { [key: string]: any } | null): Promise<T> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get(keys, (result) => {
          resolve(result as T);
        });
      });
    }
    // Fallback
    const result: any = {};
    if (Array.isArray(keys)) {
      keys.forEach(k => {
        const val = localStorage.getItem(k);
        if (val) {
          try { result[k] = JSON.parse(val); } catch (e) { result[k] = val; }
        }
      });
    }
    return result as T;
  }

  /**
   * Sets data in chrome.storage.local.
   */
  public static async set(items: { [key: string]: any }): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set(items, () => {
          resolve();
        });
      });
    }
    // Fallback
    Object.keys(items).forEach(k => {
      localStorage.setItem(k, typeof items[k] === 'string' ? items[k] : JSON.stringify(items[k]));
    });
  }

  /**
   * Removes data from chrome.storage.local.
   */
  public static async remove(keys: string | string[]): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.remove(keys, () => {
          resolve();
        });
      });
    }
    // Fallback
    if (Array.isArray(keys)) {
      keys.forEach(k => localStorage.removeItem(k));
    } else {
      localStorage.removeItem(keys);
    }
  }

  /**
   * Clears all data.
   */
  public static async clear(): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.clear(() => {
          resolve();
        });
      });
    }
    localStorage.clear();
  }

  /**
   * Listen to storage changes. Returns a cleanup function.
   */
  public static onChange(callback: (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => void): () => void {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(callback);
      return () => chrome.storage.onChanged.removeListener(callback);
    }
    return () => {};
  }
}
