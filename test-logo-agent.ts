/**
 * 智能Logo抓取代理测试脚本
 * 测试智能抓取、品牌识别、缓存等功能
 */

import { SmartLogoManager, recognizeBrand, smartFetchBrandLogo } from './src/lib/logo-agent';

async function testLogoAgent() {
  console.log('=== 智能Logo抓取代理测试 ===\n');

  try {
    // 测试1: 品牌识别
    console.log('1. 测试品牌识别');
    const testBrands = ['麦当劳', '星巴克', '瑞幸', '肯德基', 'mcdonalds', 'starbucks', 'luckin'];
    
    for (const brand of testBrands) {
      const result = recognizeBrand(brand);
      console.log(`  ${brand} → ${result ? result.name : '未识别'}`);
    }

    console.log('\n2. 测试智能抓取单个Logo');
    const testBrand = 'mcdonalds';
    const fetchResult = await smartFetchBrandLogo({ brandName: testBrand });
    console.log(`  品牌: ${testBrand}`);
    console.log(`  成功: ${fetchResult.success}`);
    console.log(`  来源: ${fetchResult.source}`);
    console.log(`  质量: ${fetchResult.quality}`);
    console.log(`  错误: ${fetchResult.error}`);

    console.log('\n3. 测试智能Logo管理器');
    const logoPath = await SmartLogoManager.getBrandLogo('starbucks');
    console.log(`  星巴克Logo路径: ${logoPath}`);

    console.log('\n4. 测试缓存功能');
    const cachedPath = await SmartLogoManager.getBrandLogo('starbucks');
    console.log(`  缓存命中: ${cachedPath === logoPath}`);

    console.log('\n5. 测试预加载');
    await SmartLogoManager.preloadBrands(['mcdonalds', 'starbucks', 'luckin']);
    console.log('  预加载完成');

    console.log('\n6. 测试缓存统计');
    const stats = SmartLogoManager.getCacheStats();
    console.log(`  缓存条目数: ${stats.totalCount}`);
    console.log(`  缓存大小: ${(stats.totalSize / 1024).toFixed(2)} KB`);
    console.log(`  最大缓存: ${(stats.maxSize / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n=== 测试完成 ===');
  } catch (error) {
    console.error('测试出错:', error);
  }
}

// 运行测试
testLogoAgent();
