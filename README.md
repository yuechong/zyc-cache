# Install
`
npm install cache
`

# 缓存lib
支持内存缓存，浏览器本地缓存
## 模块导出
`
export { memoryCache, localCache, sessionCache };
`
## Usage
-set(moduleName, key, value, ttl = 0) 添加缓存数据，0代表不加过期限制
-get(moduleName, key) 获取未过期的缓存数据
-has(moduleName, key)  判断模块下的key的缓存数据是否存在是否过期
-delete(moduleName, key) 删除模块下某个key的缓存数据
-clearModule(moduleName) 清空模块名下的全部缓存数据
-clearAll 清空全部缓存数据
-clearExpired 清空过期缓存数据
