/**
 * 智能Logo抓取代理
 * 主入口文件，导出所有核心功能
 */

// 核心功能
export * from './smart-fetcher';
export * from './brand-recognizer';
export * from './logo-evaluator';
export * from './smart-cache';

// 工具函数
export * from './utils';

// 类型定义
export * from './types';

// 单例实例
export { smartCacheManager } from './smart-cache';

// 智能Logo管理主函数
import { smartFetchBrandLogo } from './smart-fetcher';
import { smartCacheManager } from './smart-cache';
import { recognizeBrand } from './brand-recognizer';

/**
 * 智能Logo管理器
 * 统一的Logo管理接口
 */
export class SmartLogoManager {
  /**
   * 获取品牌Logo
   * @param brandName 品牌名称
   * @param forceRefresh 是否强制刷新
   * @returns Logo路径
   */
  static async getBrandLogo(brandName: string, forceRefresh: boolean = false): Promise<string | null> {
    // 检查缓存
    if (!forceRefresh) {
      const cachedPath = smartCacheManager.getCachedLogoPath(brandName);
      if (cachedPath) {
        return cachedPath;
      }
    }

    // 智能抓取
    const result = await smartFetchBrandLogo({ brandName, forceRefresh });
    if (result.success) {
      return smartCacheManager.getCachedLogoPath(brandName);
    }

    return null;
  }

  /**
   * 预加载品牌Logo
   * @param brandNames 品牌名称数组
   */
  static async preloadBrands(brandNames: string[] = ['mcdonalds', 'starbucks', 'luckin']): Promise<void> {
    await smartCacheManager.preloadBrands();

    // 批量抓取
    const promises = brandNames.map(async (brandName) => {
      await this.getBrandLogo(brandName);
    });

    await Promise.all(promises);
  }

  /**
   * 清除品牌Logo缓存
   * @param brandName 品牌名称
   */
  static clearBrandCache(brandName: string): void {
    smartCacheManager.clearCache(brandName);
  }

  /**
   * 清除所有缓存
   */
  static clearAllCache(): void {
    smartCacheManager.clearAllCache();
  }

  /**
   * 获取缓存统计信息
   */
  static getCacheStats() {
    return smartCacheManager.getCacheStats();
  }

  /**
   * 识别品牌
   * @param brandName 品牌名称
   */
  static recognizeBrand(brandName: string) {
    return recognizeBrand(brandName);
  }
}

// 默认导出
export default SmartLogoManager;
