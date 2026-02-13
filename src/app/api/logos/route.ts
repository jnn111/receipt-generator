/**
 * Logo管理API
 * 提供Logo查询、上传、缓存管理等接口
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getBrandLogo,
  getMultipleBrandLogos,
  refreshBrandLogo,
  uploadCustomLogo,
  getLogoCacheStats,
  clearBrandLogoCache,
  clearAllLogoCache,
} from '@/lib/logo-manager';

/**
 * GET /api/logos
 * 查询Logo信息
 * Query参数:
 * - brand: 单个品牌名称
 * - brands: 多个品牌名称（逗号分隔）
 * - refresh: 是否强制刷新（默认false）
 * - stats: 是否返回缓存统计信息（默认false）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const brands = searchParams.get('brands');
    const refresh = searchParams.get('refresh') === 'true';
    const stats = searchParams.get('stats') === 'true';

    // 返回缓存统计信息
    if (stats) {
      const cacheStats = getLogoCacheStats();
      return NextResponse.json({
        success: true,
        data: cacheStats,
      });
    }

    // 查询单个品牌
    if (brand) {
      const result = await getBrandLogo(brand, refresh);
      return NextResponse.json({
        success: result.success,
        data: result,
      });
    }

    // 查询多个品牌
    if (brands) {
      const brandList = brands.split(',').map(b => b.trim());
      const results = await getMultipleBrandLogos(brandList, refresh);

      return NextResponse.json({
        success: true,
        data: Object.fromEntries(results),
      });
    }

    // 参数错误
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required parameter: brand or brands',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Logo API GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/logos
 * 上传自定义Logo或刷新Logo
 *
 * Body参数:
 * - action: 'upload' 或 'refresh'
 * - brand: 品牌名称
 * - file: 文件数据（仅upload需要）
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    const brand = formData.get('brand') as string;

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: action',
        },
        { status: 400 }
      );
    }

    // 上传自定义Logo
    if (action === 'upload') {
      if (!brand) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required parameter: brand',
          },
          { status: 400 }
        );
      }

      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required parameter: file',
          },
          { status: 400 }
        );
      }

      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid file type. Only images are allowed.',
          },
          { status: 400 }
        );
      }

      // 验证文件大小（限制5MB）
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            error: 'File too large. Maximum size is 5MB.',
          },
          { status: 400 }
        );
      }

      const result = await uploadCustomLogo(brand, file);

      return NextResponse.json({
        success: result.success,
        data: result,
      });
    }

    // 刷新Logo
    if (action === 'refresh') {
      if (!brand) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required parameter: brand',
          },
          { status: 400 }
        );
      }

      const result = await refreshBrandLogo(brand);

      return NextResponse.json({
        success: result.success,
        data: result,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: `Invalid action: ${action}`,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Logo API POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/logos
 * 清除Logo缓存
 * Query参数:
 * - brand: 清除指定品牌缓存（不传则清除所有）
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');

    if (brand) {
      clearBrandLogoCache(brand);
      return NextResponse.json({
        success: true,
        message: `Cache cleared for brand: ${brand}`,
      });
    } else {
      clearAllLogoCache();
      return NextResponse.json({
        success: true,
        message: 'All cache cleared',
      });
    }
  } catch (error) {
    console.error('Logo API DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
