/**
 * Logo管理器
 * 对外提供 getBrandLogo 等核心工具函数
 */

import { getBrandLogoConfig } from './brand-logos';
import { logoCacheManager } from './logo-cache';
import { fetchBrandLogo, getDefaultLogoUrl } from './logo-fetcher';
import { SmartLogoManager } from './logo-agent';

export interface LogoResponse {
  success: boolean;
  url?: string;
  error?: string;
  version?: string;
}

/**
 * getBrandLogo 工具函数
 * 获取品牌Logo，自动处理缓存、抓取、降级
 *
 * @param brandName - 品牌名称（如 mcdonalds、starbucks、luckin）
 * @param forceRefresh - 是否强制刷新缓存（默认false）
 * @returns Logo响应对象
 */
export async function getBrandLogo(
  brandName: string,
  forceRefresh: boolean = false
): Promise<LogoResponse> {
  try {
    // 1. 获取品牌配置
    const config = getBrandLogoConfig(brandName);

    if (!config) {
      return {
        success: true,
        url: `/placeholder-logo.png`,
        version: '1.0.0',
      };
    }

    // 2. 尝试返回品牌的第一个源URL（使用远程URL）
    if (config.sources && config.sources.length > 0) {
      return {
        success: true,
        url: config.sources[0],
        version: config.version,
      };
    }

    // 3. 降级：使用备用URL
    if (config.fallback) {
      return {
        success: true,
        url: config.fallback,
        version: config.version,
      };
    }

    // 4. 最终降级：使用本地路径
    return {
      success: true,
      url: `/logos/${config.localFile}`,
      version: config.version,
    };
  } catch (error) {
    // 出错时返回默认路径
    return {
      success: true,
      url: `/placeholder-logo.png`,
      version: '1.0.0',
    };
  }
}

/**
 * 批量获取品牌Logo
 */
export async function getMultipleBrandLogos(
  brandNames: string[],
  forceRefresh: boolean = false
): Promise<Map<string, LogoResponse>> {
  const results = new Map<string, LogoResponse>();

  const promises = brandNames.map(async (brandName) => {
    const result = await getBrandLogo(brandName, forceRefresh);
    results.set(brandName, result);
  });

  await Promise.all(promises);

  return results;
}

/**
 * 预加载所有品牌Logo
 */
export async function preloadAllBrandLogos(): Promise<Map<string, LogoResponse>> {
  // 获取所有支持的品牌
  const brandNames = ['mcdonalds', 'starbucks', 'luckin', 'kfc'];
  
  // 使用智能Logo管理器预加载
  await SmartLogoManager.preloadBrands(brandNames);
  
  return await getMultipleBrandLogos(brandNames);
}

/**
 * 清除Logo缓存
 */
export function clearBrandLogoCache(brandName: string): void {
  logoCacheManager.clearCache(brandName);
}

/**
 * 清除所有Logo缓存
 */
export function clearAllLogoCache(): void {
  logoCacheManager.clearAllCache();
}

/**
 * 获取Logo缓存统计信息
 */
export function getLogoCacheStats() {
  return logoCacheManager.getCacheStats();
}

/**
 * 刷新指定品牌Logo
 */
export async function refreshBrandLogo(brandName: string): Promise<LogoResponse> {
  return await getBrandLogo(brandName, true);
}

/**
 * 上传自定义Logo（用户自定义）
 */
export async function uploadCustomLogo(
  brandName: string,
  file: File
): Promise<LogoResponse> {
  try {
    const config = getBrandLogoConfig(brandName);

    if (!config) {
      return {
        success: false,
        error: `Brand not supported: ${brandName}`,
      };
    }

    // 转换文件为Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 缓存自定义Logo
    const cachedPath = await logoCacheManager.cacheLogo(
      `${brandName}-custom`,
      'custom',
      'upload',
      buffer
    );

    return {
      success: true,
      url: cachedPath,
      version: 'custom',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
