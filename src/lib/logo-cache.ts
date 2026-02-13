/**
 * Logo缓存管理器
 * 管理Logo的本地缓存和版本控制
 */

import fs from 'fs';
import path from 'path';

export interface LogoCacheEntry {
  brandName: string;
  version: string;
  url: string;
  localPath: string;
  size: number;
  cachedAt: string;
  expiresAt: string;
}

export class LogoCacheManager {
  private cacheDir: string;
  private cacheFile: string;

  constructor() {
    this.cacheDir = path.join(process.cwd(), 'public', 'logos');
    this.cacheFile = path.join(process.cwd(), '.logo-cache.json');
    this.ensureCacheDir();
  }

  /**
   * 确保缓存目录存在
   */
  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * 加载缓存索引
   */
  private loadCacheIndex(): Map<string, LogoCacheEntry> {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf-8');
        const entries = JSON.parse(data) as LogoCacheEntry[];
        return new Map(entries.map(entry => [entry.brandName, entry]));
      }
    } catch (error) {
      console.error('加载Logo缓存索引失败:', error);
    }
    return new Map();
  }

  /**
   * 保存缓存索引
   */
  private saveCacheIndex(cache: Map<string, LogoCacheEntry>): void {
    try {
      const entries = Array.from(cache.values());
      fs.writeFileSync(this.cacheFile, JSON.stringify(entries, null, 2));
    } catch (error) {
      console.error('保存Logo缓存索引失败:', error);
    }
  }

  /**
   * 检查缓存是否存在且有效
   */
  isCacheValid(brandName: string, version: string): boolean {
    const cache = this.loadCacheIndex();
    const entry = cache.get(brandName);

    if (!entry) {
      return false;
    }

    // 检查版本是否匹配
    if (entry.version !== version) {
      return false;
    }

    // 检查文件是否存在
    if (!fs.existsSync(entry.localPath)) {
      return false;
    }

    // 检查是否过期（默认30天）
    const expiresAt = new Date(entry.expiresAt);
    if (new Date() > expiresAt) {
      return false;
    }

    return true;
  }

  /**
   * 获取缓存的Logo路径
   */
  getCachedLogoPath(brandName: string): string | null {
    const cache = this.loadCacheIndex();
    const entry = cache.get(brandName);

    if (entry && fs.existsSync(entry.localPath)) {
      return `/logos/${path.basename(entry.localPath)}`;
    }

    return null;
  }

  /**
   * 缓存Logo
   */
  async cacheLogo(
    brandName: string,
    version: string,
    url: string,
    data: Buffer
  ): Promise<string> {
    const fileName = `${brandName}-${version}-${Date.now()}.png`;
    const localPath = path.join(this.cacheDir, fileName);

    // 保存文件
    fs.writeFileSync(localPath, data);

    // 创建缓存条目
    const entry: LogoCacheEntry = {
      brandName,
      version,
      url,
      localPath,
      size: data.length,
      cachedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后过期
    };

    // 更新缓存索引
    const cache = this.loadCacheIndex();
    cache.set(brandName, entry);
    this.saveCacheIndex(cache);

    return `/logos/${fileName}`;
  }

  /**
   * 清除指定品牌的缓存
   */
  clearCache(brandName: string): void {
    const cache = this.loadCacheIndex();
    const entry = cache.get(brandName);

    if (entry && fs.existsSync(entry.localPath)) {
      fs.unlinkSync(entry.localPath);
    }

    cache.delete(brandName);
    this.saveCacheIndex(cache);
  }

  /**
   * 清除所有缓存
   */
  clearAllCache(): void {
    const cache = this.loadCacheIndex();

    // 删除所有缓存文件
    for (const entry of cache.values()) {
      if (fs.existsSync(entry.localPath)) {
        fs.unlinkSync(entry.localPath);
      }
    }

    // 清空缓存索引
    this.saveCacheIndex(new Map());
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): { totalSize: number; totalCount: number; entries: LogoCacheEntry[] } {
    const cache = this.loadCacheIndex();
    const entries = Array.from(cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);

    return {
      totalSize,
      totalCount: entries.length,
      entries,
    };
  }
}

// 单例
export const logoCacheManager = new LogoCacheManager();
