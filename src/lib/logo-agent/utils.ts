/**
 * 智能Logo抓取代理工具函数
 */

import { getBrandLogoConfig } from '../brand-logos';

/**
 * 标准化品牌名称
 * @param brandName 品牌名称
 * @returns 标准化后的品牌名称
 */
export function normalizeBrandName(brandName: string): string {
  if (!brandName) {
    return '';
  }

  // 移除特殊字符，转为小写
  const normalized = brandName
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')
    .trim();

  // 常见品牌名称映射
  const brandMap: Record<string, string> = {
    'm': 'mcdonalds',
    'mc': 'mcdonalds',
    '麦当劳': 'mcdonalds',
    '金拱门': 'mcdonalds',
    's': 'starbucks',
    '星巴克': 'starbucks',
    'luckin': 'luckin',
    '瑞幸': 'luckin',
    '瑞幸咖啡': 'luckin',
    'kfc': 'kfc',
    '肯德基': 'kfc',
  };

  return brandMap[normalized] || normalized;
}

/**
 * 构建Logo搜索URL
 * @param brandName 品牌名称
 * @param type 搜索类型
 * @returns 搜索URL
 */
export function buildLogoSearchUrl(brandName: string, type: 'wikipedia' | 'google' | 'cdn' = 'wikipedia'): string {
  const encodedBrand = encodeURIComponent(brandName);

  switch (type) {
    case 'wikipedia':
      return `https://upload.wikimedia.org/wikipedia/commons/thumb/${brandName.charAt(0)}/${brandName.slice(0, 2)}/${encodedBrand}_logo.svg/1200px-${encodedBrand}_logo.svg.png`;
    case 'google':
      return `https://www.google.com/search?tbm=isch&q=${encodedBrand}+logo+official`;
    case 'cdn':
      return `https://cdn.jsdelivr.net/gh/brandlogos/logos/${brandName.toLowerCase()}.svg`;
    default:
      return `https://upload.wikimedia.org/wikipedia/commons/thumb/${brandName.charAt(0)}/${brandName.slice(0, 2)}/${encodedBrand}_logo.svg/1200px-${encodedBrand}_logo.svg.png`;
  }
}

/**
 * 验证Logo缓冲区
 * @param buffer 图片缓冲区
 * @returns 是否有效
 */
export function validateLogoBuffer(buffer: Buffer): boolean {
  if (!buffer || buffer.length === 0) {
    return false;
  }

  // 检查文件大小（1KB - 10MB）
  if (buffer.length < 1024 || buffer.length > 10 * 1024 * 1024) {
    return false;
  }

  // 检查文件头
  const header = buffer.slice(0, 8).toString('hex');
  const validHeaders = [
    '89504e47', // PNG
    '47494638', // GIF
    'ffd8ffe0', // JPEG
    'ffd8ffe1', // JPEG
    'ffd8ffe2', // JPEG
    '25504446', // PDF (不支持，但识别)
  ];

  return validHeaders.some(header.startsWith.bind(header));
}

/**
 * 生成缓存文件名
 * @param brandName 品牌名称
 * @param version 版本
 * @returns 缓存文件名
 */
export function generateCacheFileName(brandName: string, version: string): string {
  const timestamp = Date.now();
  const hash = Math.random().toString(36).substr(2, 8);
  return `${brandName}-${version}-${timestamp}-${hash}.png`;
}

/**
 * 获取品牌的默认搜索源
 * @param brandName 品牌名称
 * @returns 搜索源数组
 */
export function getBrandSearchSources(brandName: string): string[] {
  const config = getBrandLogoConfig(brandName);
  if (config && config.sources.length > 0) {
    return config.sources;
  }

  // 默认搜索源
  const sources = [
    buildLogoSearchUrl(brandName, 'wikipedia'),
    buildLogoSearchUrl(brandName, 'cdn'),
  ];

  return sources;
}

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 并行执行带超时的Promise
 * @param promises Promise数组
 * @param timeout 超时时间
 * @returns 第一个成功的结果
 */
export async function raceWithTimeout<T>(promises: Promise<T>[], timeout: number): Promise<T | null> {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), timeout);
  });

  try {
    return await Promise.race([...promises, timeoutPromise]);
  } catch {
    return null;
  }
}
