/**
 * 智能Logo抓取代理类型定义
 */

// 智能抓取选项
export interface SmartFetchOptions {
  brandName: string;
  forceRefresh?: boolean;
  preferredSize?: number;
  timeout?: number;
}

// 智能抓取结果
export interface SmartFetchResult {
  success: boolean;
  data?: Buffer;
  source?: string;
  quality?: number;
  error?: string;
}

// 品牌信息
export interface BrandInfo {
  name: string;
  displayName: string;
  aliases: string[];
  categories: string[];
}

// Logo质量评估结果
export interface LogoQuality {
  size: number;
  resolution: number;
  aspectRatio: number;
  colorScore: number;
  overall: number;
}

// Logo评估输入
export interface LogoEvaluationInput {
  buffer: Buffer;
  source: string;
  url: string;
}

// 智能缓存选项
export interface SmartCacheOptions {
  maxCacheSize?: number;
  defaultExpiry?: number;
  preloadBrands?: string[];
}

// 缓存条目扩展
export interface EnhancedCacheEntry {
  brandName: string;
  version: string;
  url: string;
  localPath: string;
  size: number;
  cachedAt: string;
  expiresAt: string;
  accessCount: number;
  lastAccessed: string;
  qualityScore: number;
}

// 代理配置
export interface LogoAgentConfig {
  timeout: number;
  maxRetries: number;
  preferredSize: number;
  cacheOptions: SmartCacheOptions;
}
