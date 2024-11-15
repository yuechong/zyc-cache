class Cache {
  constructor(storageType = "memory") {
    this.cache = {}; // 主缓存对象
    this.storageType = storageType; // 缓存类型：memory、local、session
    this.storage = null;

    // 根据 storageType 决定使用的缓存存储位置
    if (storageType === "local") {
      this.storage = window.localStorage;
    } else if (storageType === "session") {
      this.storage = window.sessionStorage;
    }
    // 冻结实例，防止外部修改
    Object.freeze(this);
  }

  // 设置缓存项，加入浏览器缓存写入限制判断
  set(moduleName, key, value, ttl = 0) {
    const now = Date.now();
    const expiration = ttl > 0 ? now + ttl : null;
    const item = { value, expiration };
    const fullKey = `${moduleName}:${key}`;

    try {
      if (this.storage) {
        // 将数据保存到 localStorage 或 sessionStorage
        this.storage.setItem(fullKey, JSON.stringify(item));
      } else {
        // 内存缓存
        if (!this.cache[moduleName]) {
          this.cache[moduleName] = {};
        }
        this.cache[moduleName][key] = item;
      }
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn(`Cache write limit exceeded in ${this.storageType} storage.`);
        // 处理方案：清理过期项或其他优雅的方案
        this.clearExpired();
        try {
          // 再次尝试写入
          this.storage.setItem(fullKey, JSON.stringify(item));
        } catch (e) {
          console.warn(`Cache write limit still exceeded after clearing expired items.`);
        }
      } else {
        console.error("An error occurred while setting cache:", error);
      }
    }
  }

  // 获取缓存项
  get(moduleName, key) {
    const fullKey = `${moduleName}:${key}`;
    let item = null;

    if (this.storage) {
      // 从 localStorage 或 sessionStorage 获取数据
      const storedItem = this.storage.getItem(fullKey);
      if (storedItem) {
        item = JSON.parse(storedItem);
      }
    } else {
      // 从内存缓存获取数据
      const moduleCache = this.cache[moduleName];
      item = moduleCache ? moduleCache[key] : null;
    }

    if (!item) return null;

    const { value, expiration } = item;
    if (expiration && Date.now() > expiration) {
      this.delete(moduleName, key); // 过期删除
      return null;
    }
    return value;
  }

  // 删除缓存项
  delete(moduleName, key) {
    const fullKey = `${moduleName}:${key}`;
    if (this.storage) {
      this.storage.removeItem(fullKey); // 从 localStorage 或 sessionStorage 删除
    } else if (this.cache[moduleName] && this.cache[moduleName][key]) {
      delete this.cache[moduleName][key];
    }
  }

  // 清空模块缓存
  clearModule(moduleName) {
    if (this.storage) {
      for (const fullKey in this.storage) {
        if (fullKey.startsWith(`${moduleName}:`)) {
          this.storage.removeItem(fullKey);
        }
      }
    } else if (this.cache[moduleName]) {
      delete this.cache[moduleName];
    }
  }

  // 清空所有缓存
  clearAll() {
    if (this.storage) {
      this.storage.clear();
    } else {
      this.cache = {};
    }
  }

  // 清除过期缓存项
  clearExpired() {
    if (this.storage) {
      for (const key in this.storage) {
        const item = JSON.parse(this.storage.getItem(key));
        if (item && item.expiration && Date.now() > item.expiration) {
          this.storage.removeItem(key);
        }
      }
    } else {
      for (const moduleName in this.cache) {
        for (const key in this.cache[moduleName]) {
          const item = this.cache[moduleName][key];
          if (item.expiration && Date.now() > item.expiration) {
            delete this.cache[moduleName][key];
          }
        }
      }
    }
  }

  // 检查缓存项是否存在且有效
  has(moduleName, key) {
    return this.get(moduleName, key) !== null;
  }
}

const memoryCache = new Cache("memory");
const localCache = new Cache("local");
const sessionCache = new Cache("session");

export { memoryCache, localCache, sessionCache };