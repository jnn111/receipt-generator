/**
 * Logo自动抓取工具
 * 从品牌官网、CDN自动抓取Logo
 */

import { brandLogoConfigs, getBrandLogoConfig } from './brand-logos';

export interface FetchLogoResult {
  success: boolean;
  data?: Buffer;
  source?: string;
  error?: string;
}

/**
 * 从URL抓取Logo图片
 */
async function fetchLogoFromUrl(url: string): Promise<FetchLogoResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      return {
        success: false,
        error: `Invalid content type: ${contentType}`,
      };
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // 检查文件大小（限制10MB）
    if (buffer.length > 10 * 1024 * 1024) {
      return {
        success: false,
        error: 'Image too large (max 10MB)',
      };
    }

    return {
      success: true,
      data: buffer,
      source: url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 自动抓取品牌Logo
 * 按优先级尝试多个源，直到成功
 */
export async function fetchBrandLogo(brandName: string): Promise<FetchLogoResult> {
  const config = getBrandLogoConfig(brandName);

  if (!config) {
    return {
      success: false,
      error: `Brand not found: ${brandName}`,
    };
  }

  // 尝试所有源
  for (const source of config.sources) {
    const result = await fetchLogoFromUrl(source);
    if (result.success) {
      return result;
    }
    console.warn(`Failed to fetch from ${source}: ${result.error}`);
  }

  // 尝试备用URL
  if (config.fallback) {
    const result = await fetchLogoFromUrl(config.fallback);
    if (result.success) {
      return result;
    }
  }

  return {
    success: false,
    error: `Failed to fetch logo from all sources for brand: ${brandName}`,
  };
}

/**
 * 批量抓取Logo
 */
export async function fetchMultipleLogos(brandNames: string[]): Promise<Map<string, FetchLogoResult>> {
  const results = new Map<string, FetchLogoResult>();

  const promises = brandNames.map(async (brandName) => {
    const result = await fetchBrandLogo(brandName);
    results.set(brandName, result);
  });

  await Promise.all(promises);

  return results;
}

/**
 * 获取默认Logo（降级方案）
 */
export function getDefaultLogoUrl(brandName: string): string {
  const config = getBrandLogoConfig(brandName);
  return config?.localFile ? `/logos/${config.localFile}` : '/placeholder-logo.png';
}
