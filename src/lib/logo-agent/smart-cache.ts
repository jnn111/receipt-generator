/**
 * 智能缓存管理器
 * 增强的Logo缓存管理，支持智能过期和预加载
 */

import fs from 'fs';
import path from 'path';
import { EnhancedCacheEntry, SmartCacheOptions } from './types';
import { generateCacheFileName } from './utils';

class SmartCacheManager {
  private cacheDir: string;
  private cacheFile: string;
  private options: Required<SmartCacheOptions>;

  constructor(options: SmartCacheOptions = {}) {
    this.cacheDir = path.join(process.cwd(), 'public', 'logos');
    this.cacheFile = path.join(process.cwd(), '.smart-logo-cache.json');
    this.options = {
      maxCacheSize: options.maxCacheSize || 50 * 1024 * 1024, // 50MB
      defaultExpiry: options.defaultExpiry || 30 * 24 * 60 * 60 * 1000, // 30天
      preloadBrands: options.preloadBrands || ['mcdonalds', 'starbucks', 'luckin'],
    };

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
  private loadCacheIndex(): Map<string, EnhancedCacheEntry> {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf-8');
        const entries = JSON.parse(data) as EnhancedCacheEntry[];
        return new Map(entries.map(entry => [entry.brandName, entry]));
      }
    } catch (error) {
      console.error('加载智能缓存索引失败:', error);
    }
    return new Map();
  }

  /**
   * 保存缓存索引
   */
  private saveCacheIndex(cache: Map<string, EnhancedCacheEntry>): void {
    try {
      const entries = Array.from(cache.values());
      fs.writeFileSync(this.cacheFile, JSON.stringify(entries, null, 2));
    } catch (error) {
      console.error('保存智能缓存索引失败:', error);
    }
  }

  /**
   * 检查缓存是否有效
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

    // 检查是否过期
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
      // 更新访问时间
      entry.lastAccessed = new Date().toISOString();
      entry.accessCount = (entry.accessCount || 0) + 1;
      const updatedCache = this.loadCacheIndex();
      updatedCache.set(brandName, entry);
      this.saveCacheIndex(updatedCache);

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
    data: Buffer,
    qualityScore: number = 0.8
  ): Promise<string> {
    try {
      const fileName = generateCacheFileName(brandName, version);
      const localPath = path.join(this.cacheDir, fileName);

      // 确保缓存目录存在
      this.ensureCacheDir();

      // 保存文件
      fs.writeFileSync(localPath, data);

      // 创建缓存条目
      const entry: EnhancedCacheEntry = {
        brandName,
        version,
        url,
        localPath,
        size: data.length,
        cachedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.options.defaultExpiry).toISOString(),
        accessCount: 0,
        lastAccessed: new Date().toISOString(),
        qualityScore,
      };

      // 更新缓存索引
      const cache = this.loadCacheIndex();
      cache.set(brandName, entry);

      // 优化缓存大小
      this.optimizeCache();

      this.saveCacheIndex(cache);

      return `/logos/${fileName}`;
    } catch (error) {
      console.error('缓存Logo失败:', error);
      throw new Error(`Failed to cache logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 优化缓存
   */
  async optimizeCache(): Promise<void> {
    const cache = this.loadCacheIndex();
    const entries = Array.from(cache.values());

    // 计算当前缓存大小
    const currentSize = entries.reduce((sum, entry) => sum + entry.size, 0);

    // 如果超过最大缓存大小，删除最不常用的条目
    if (currentSize > this.options.maxCacheSize) {
      // 按访问频率和时间排序
      entries.sort((a, b) => {
        const accessDiff = (b.accessCount || 0) - (a.accessCount || 0);
        if (accessDiff !== 0) {
          return accessDiff;
        }
        return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
      });

      // 删除直到缓存大小合适
      let remainingSize = currentSize;
      const newCache = new Map<string, EnhancedCacheEntry>();

      for (const entry of entries) {
        if (remainingSize <= this.options.maxCacheSize * 0.8) {
          newCache.set(entry.brandName, entry);
        } else {
          // 删除文件
          if (fs.existsSync(entry.localPath)) {
            try {
              fs.unlinkSync(entry.localPath);
            } catch (error) {
              console.warn('删除缓存文件失败:', error);
            }
          }
          remainingSize -= entry.size;
        }
      }

      this.saveCacheIndex(newCache);
    }
  }

  /**
   * 清除指定品牌的缓存
   */
  clearCache(brandName: string): void {
    const cache = this.loadCacheIndex();
    const entry = cache.get(brandName);

    if (entry && fs.existsSync(entry.localPath)) {
      try {
        fs.unlinkSync(entry.localPath);
      } catch (error) {
        console.warn('删除缓存文件失败:', error);
      }
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
        try {
          fs.unlinkSync(entry.localPath);
        } catch (error) {
          console.warn('删除缓存文件失败:', error);
        }
      }
    }

    // 清空缓存索引
    this.saveCacheIndex(new Map());
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    const cache = this.loadCacheIndex();
    const entries = Array.from(cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);

    return {
      totalSize,
      totalCount: entries.length,
      maxSize: this.options.maxCacheSize,
      entries,
    };
  }

  /**
   * 预加载品牌Logo
   */
  async preloadBrands(): Promise<void> {
    console.log('开始预加载品牌Logo...');
    
    // 这里可以集成智能抓取引擎
    // 暂时只是记录
    for (const brand of this.options.preloadBrands) {
      console.log(`预加载品牌: ${brand}`);
    }

    console.log('品牌Logo预加载完成');
  }
}

// 单例
export const smartCacheManager = new SmartCacheManager();
