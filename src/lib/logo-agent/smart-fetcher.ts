/**
 * 智能抓取引擎
 * 智能抓取品牌Logo，并行处理多个源，质量评估
 */

import { SmartFetchOptions, SmartFetchResult, LogoEvaluationInput } from './types';
import { getBrandSearchSources, validateLogoBuffer, raceWithTimeout, delay } from './utils';
import { recognizeBrand } from './brand-recognizer';
import { evaluateLogoQuality, selectBestLogo } from './logo-evaluator';
import { smartCacheManager } from './smart-cache';

/**
 * 从单个URL抓取Logo
 * @param url URL地址
 * @param timeout 超时时间
 * @returns 抓取结果
 */
async function fetchFromUrl(url: string, timeout: number = 10000): Promise<{ success: boolean; data?: Buffer; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/*',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      return { success: false, error: `Invalid content type: ${contentType}` };
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    if (!validateLogoBuffer(buffer)) {
      return { success: false, error: 'Invalid logo buffer' };
    }

    return { success: true, data: buffer };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * 智能抓取品牌Logo
 * @param options 抓取选项
 * @returns 抓取结果
 */
export async function smartFetchBrandLogo(options: SmartFetchOptions): Promise<SmartFetchResult> {
  const {
    brandName,
    forceRefresh = false,
    timeout = 15000,
  } = options;

  // 识别品牌
  const brandInfo = recognizeBrand(brandName);
  if (!brandInfo) {
    return { success: false, error: `Brand not recognized: ${brandName}` };
  }

  // 检查缓存
  if (!forceRefresh) {
    const cachedPath = smartCacheManager.getCachedLogoPath(brandInfo.name);
    if (cachedPath) {
      return { success: true, source: 'cache', data: Buffer.from([]) }; // 缓存命中，返回路径
    }
  }

  // 获取搜索源
  const sources = getBrandSearchSources(brandInfo.name);
  if (sources.length === 0) {
    return { success: false, error: `No search sources for brand: ${brandInfo.name}` };
  }

  // 并行抓取所有源
  const fetchPromises = sources.map(async (source) => {
    try {
      const result = await fetchFromUrl(source, timeout / 2);
      if (result.success && result.data) {
        return {
          buffer: result.data,
          source,
          url: source,
        } as LogoEvaluationInput;
      }
    } catch (error) {
      console.warn(`抓取 ${source} 失败:`, error);
    }
    return null;
  });

  // 等待所有抓取完成
  const fetchResults = await Promise.all(fetchPromises);
  const validResults = fetchResults.filter((result): result is LogoEvaluationInput => result !== null);

  if (validResults.length === 0) {
    return { success: false, error: `Failed to fetch logo from all sources` };
  }

  // 评估和选择最佳Logo
  const bestLogo = selectBestLogo(validResults);

  // 缓存最佳Logo
  const cachedPath = await smartCacheManager.cacheLogo(
    brandInfo.name,
    'smart',
    bestLogo.source,
    bestLogo.buffer,
    bestLogo.quality.overall
  );

  return {
    success: true,
    data: bestLogo.buffer,
    source: bestLogo.source,
    quality: bestLogo.quality.overall,
  };
}

/**
 * 批量智能抓取Logo
 * @param brandNames 品牌名称数组
 * @returns 抓取结果映射
 */
export async function smartFetchMultipleLogos(brandNames: string[]): Promise<Map<string, SmartFetchResult>> {
  const results = new Map<string, SmartFetchResult>();

  const promises = brandNames.map(async (brandName) => {
    const result = await smartFetchBrandLogo({ brandName });
    results.set(brandName, result);
  });

  await Promise.all(promises);

  return results;
}

/**
 * 带重试的智能抓取
 * @param options 抓取选项
 * @param maxRetries 最大重试次数
 * @returns 抓取结果
 */
export async function smartFetchWithRetry(
  options: SmartFetchOptions,
  maxRetries: number = 2
): Promise<SmartFetchResult> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await smartFetchBrandLogo({
        ...options,
        timeout: options.timeout || 15000,
      });

      if (result.success) {
        return result;
      }

      lastError = result.error;

      if (attempt < maxRetries) {
        await delay(1000 * (attempt + 1)); // 指数退避
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';

      if (attempt < maxRetries) {
        await delay(1000 * (attempt + 1));
      }
    }
  }

  return {
    success: false,
    error: lastError || 'Failed after multiple attempts',
  };
}
