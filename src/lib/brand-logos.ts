/**
 * 品牌Logo配置
 * 定义各品牌的Logo抓取规则和元数据
 */

export interface BrandLogoConfig {
  name: string;
  displayName: string;
  // Logo抓取URL（优先级从高到低）
  sources: string[];
  // 备用URL
  fallback?: string;
  // 本地缓存文件名
  localFile: string;
  // Logo颜色主题
  colors: {
    primary: string;
    secondary: string;
  };
  // Logo版本（用于版本管理）
  version: string;
  // 最后更新时间
  lastUpdated: string;
}

export const brandLogoConfigs: Record<string, BrandLogoConfig> = {
  mcdonalds: {
    name: 'mcdonalds',
    displayName: '麦当劳',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png',
      'https://www.mcdonalds.com/content/dam/growth/companies/us/mcdonalds-corporation/mc-logo.svg',
    ],
    localFile: 'mcdonalds-logo-v2.png',
    colors: {
      primary: '#FFC72C',
      secondary: '#DA291C',
    },
    version: '2.0.0',
    lastUpdated: '2024-02-14',
  },
  starbucks: {
    name: 'starbucks',
    displayName: '星巴克',
    sources: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/3/39/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png',
      'https://www.starbucks.com/content/dam/starbucks/us/en/logos/starbucks-logo.svg',
    ],
    localFile: 'starbucks-logo-v2.png',
    colors: {
      primary: '#00704A',
      secondary: '#FFFFFF',
    },
    version: '2.0.0',
    lastUpdated: '2024-02-14',
  },
  luckin: {
    name: 'luckin',
    displayName: '瑞幸咖啡',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Luckin_Coffee_Logo.svg/1200px-Luckin_Coffee_Logo.svg.png',
    ],
    localFile: 'luckin-logo-v2.png',
    colors: {
      primary: '#0066CC',
      secondary: '#FFFFFF',
    },
    version: '2.0.0',
    lastUpdated: '2024-02-14',
  },
  // 可扩展：添加更多品牌
  kfc: {
    name: 'kfc',
    displayName: '肯德基',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/KFC_Logo.svg/1200px-KFC_Logo.svg.png',
    ],
    localFile: 'kfc-logo.png',
    colors: {
      primary: '#E4002B',
      secondary: '#FFFFFF',
    },
    version: '1.0.0',
    lastUpdated: '2024-01-01',
  },
};

/**
 * 获取品牌Logo配置
 */
export function getBrandLogoConfig(brandName: string): BrandLogoConfig | undefined {
  return brandLogoConfigs[brandName.toLowerCase()];
}

/**
 * 获取所有支持的品牌
 */
export function getAllBrands(): BrandLogoConfig[] {
  return Object.values(brandLogoConfigs);
}

/**
 * 检查品牌是否支持
 */
export function isBrandSupported(brandName: string): boolean {
  return brandName.toLowerCase() in brandLogoConfigs;
}
