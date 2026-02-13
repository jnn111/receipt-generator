/**
 * 品牌识别器
 * 智能识别品牌信息，处理别名和标准化
 */

import { BrandInfo } from './types';
import { normalizeBrandName } from './utils';
import { getBrandLogoConfig } from '../brand-logos';

// 品牌数据库
const BRAND_DATABASE: Record<string, BrandInfo> = {
  mcdonalds: {
    name: 'mcdonalds',
    displayName: '麦当劳',
    aliases: ['mc', '麦当劳', '金拱门', 'mcdonald', 'macdonalds'],
    categories: ['fast food', 'restaurant', 'food'],
  },
  starbucks: {
    name: 'starbucks',
    displayName: '星巴克',
    aliases: ['sbux', '星巴克咖啡', 'starbuck', 'sb'],
    categories: ['coffee', 'cafe', 'restaurant'],
  },
  luckin: {
    name: 'luckin',
    displayName: '瑞幸咖啡',
    aliases: ['瑞幸', 'luckin coffee', 'lk'],
    categories: ['coffee', 'cafe', 'restaurant'],
  },
  kfc: {
    name: 'kfc',
    displayName: '肯德基',
    aliases: ['肯德基', 'kentucky fried chicken', 'kentucky'],
    categories: ['fast food', 'restaurant', 'food'],
  },
};

/**
 * 智能识别品牌
 * @param brandName 品牌名称
 * @returns 品牌信息或null
 */
export function recognizeBrand(brandName: string): BrandInfo | null {
  if (!brandName) {
    return null;
  }

  // 标准化品牌名称
  const normalizedName = normalizeBrandName(brandName);

  // 直接匹配品牌名称
  if (BRAND_DATABASE[normalizedName]) {
    return BRAND_DATABASE[normalizedName];
  }

  // 匹配别名
  for (const [brand, info] of Object.entries(BRAND_DATABASE)) {
    if (info.aliases.some(alias => 
      normalizeBrandName(alias) === normalizedName
    )) {
      return info;
    }
  }

  // 匹配现有配置
  const config = getBrandLogoConfig(brandName);
  if (config) {
    return {
      name: config.name,
      displayName: config.displayName,
      aliases: [],
      categories: ['unknown'],
    };
  }

  return null;
}

/**
 * 增强的品牌识别
 * 支持更多模糊匹配
 * @param brandName 品牌名称
 * @returns 品牌信息或null
 */
export function enhancedBrandRecognizer(brandName: string): BrandInfo | null {
  if (!brandName) {
    return null;
  }

  const normalizedName = normalizeBrandName(brandName);

  // 精确匹配
  const directMatch = recognizeBrand(normalizedName);
  if (directMatch) {
    return directMatch;
  }

  // 模糊匹配（包含关系）
  for (const [brand, info] of Object.entries(BRAND_DATABASE)) {
    const brandNormalized = normalizeBrandName(brand);
    const displayNormalized = normalizeBrandName(info.displayName);
    
    if (
      normalizedName.includes(brandNormalized) ||
      brandNormalized.includes(normalizedName) ||
      normalizedName.includes(displayNormalized) ||
      displayNormalized.includes(normalizedName)
    ) {
      return info;
    }
  }

  return null;
}

/**
 * 获取品牌的所有可能名称
 * @param brandName 品牌名称
 * @returns 所有可能的名称数组
 */
export function getBrandVariants(brandName: string): string[] {
  const brandInfo = recognizeBrand(brandName);
  if (!brandInfo) {
    return [brandName];
  }

  const variants = new Set<string>();
  variants.add(brandInfo.name);
  variants.add(brandInfo.displayName);
  brandInfo.aliases.forEach(alias => variants.add(alias));

  return Array.from(variants);
}

/**
 * 检查品牌是否支持
 * @param brandName 品牌名称
 * @returns 是否支持
 */
export function isBrandSupported(brandName: string): boolean {
  return recognizeBrand(brandName) !== null;
}

/**
 * 获取所有支持的品牌
 * @returns 品牌信息数组
 */
export function getAllSupportedBrands(): BrandInfo[] {
  return Object.values(BRAND_DATABASE);
}
