# Logo 管理系统说明

## 概述

Logo管理系统是一个完整的品牌Logo管理解决方案，支持自动抓取、智能缓存、版本管理和自定义上传。系统高度集成到AI品牌祝福小票生成器中，提供专业、高效的Logo管理能力。

## 核心功能

### 1. 自动抓取 ✨

系统支持从品牌官网、CDN或可信图片库自动抓取最新的品牌Logo：

- **多源支持**：配置多个Logo源URL，按优先级尝试
- **智能重试**：自动尝试所有源，直到成功或使用默认Logo
- **超时控制**：10秒超时保护，避免长时间等待
- **类型验证**：验证返回的文件类型（必须是图片）
- **大小限制**：限制Logo大小不超过10MB

### 2. 本地缓存 💾

抓取后的Logo会被存储在本地，避免重复请求：

- **缓存目录**：`public/logos/`
- **缓存索引**：`.logo-cache.json`
- **有效期**：30天自动过期
- **智能管理**：自动清理过期缓存

### 3. 版本管理 🔄

支持Logo版本更新，确保使用最新、最规范的品牌视觉：

- **版本标识**：每个Logo都有版本号（如 1.0.0）
- **自动更新**：更新Logo配置后自动重新抓取
- **版本比较**：缓存时验证版本匹配
- **过期策略**：30天后自动过期，重新获取

### 4. Logo 查询与返回 🔍

提供简洁的API接口，返回Logo URL或Base64编码：

```typescript
// 获取单个品牌Logo
const result = await getBrandLogo('mcdonalds');
// 返回: { success: true, url: '/logos/mcdonalds-1.0.0-xxx.png', version: '1.0.0' }

// 批量获取Logo
const results = await getMultipleBrandLogos(['mcdonalds', 'starbucks', 'luckin']);
```

### 5. 兜底策略 🛡️

如果未找到指定品牌或抓取失败，返回默认占位图：

- **降级处理**：自动使用本地默认Logo
- **错误提示**：记录详细的错误日志
- **零影响**：确保用户体验不受影响

### 6. 用户自定义上传 📤

允许用户上传自己的Logo，替换默认品牌Logo：

- **文件验证**：验证图片类型（image/*）
- **大小限制**：最大5MB
- **自动缓存**：上传后立即缓存
- **品牌绑定**：自定义Logo绑定到指定品牌

## API 接口

### GET /api/logos

查询Logo信息或缓存统计

**参数：**
- `brand`: 单个品牌名称（如 mcdonalds）
- `brands`: 多个品牌名称（逗号分隔，如 mcdonalds,starbucks,luckin）
- `refresh`: 是否强制刷新（true/false，默认false）
- `stats`: 是否返回缓存统计信息（true/false，默认false）

**示例：**
```bash
# 查询单个品牌
curl "http://localhost:5000/api/logos?brand=mcdonalds"

# 批量查询
curl "http://localhost:5000/api/logos?brands=mcdonalds,starbucks,luckin"

# 强制刷新
curl "http://localhost:5000/api/logos?brand=mcdonalds&refresh=true"

# 查看缓存统计
curl "http://localhost:5000/api/logos?stats=true"
```

**响应：**
```json
{
  "success": true,
  "data": {
    "success": true,
    "url": "/logos/mcdonalds-1.0.0-1704067200000.png",
    "version": "1.0.0"
  }
}
```

### POST /api/logos

上传自定义Logo或刷新Logo

**参数（FormData）：**
- `action`: 操作类型（upload 或 refresh）
- `brand`: 品牌名称
- `file`: 文件数据（仅upload需要）

**示例：**
```bash
# 上传自定义Logo
curl -X POST http://localhost:5000/api/logos \
  -F "action=upload" \
  -F "brand=mcdonalds" \
  -F "file=@my-logo.png"

# 刷新Logo
curl -X POST http://localhost:5000/api/logos \
  -F "action=refresh" \
  -F "brand=mcdonalds"
```

### DELETE /api/logos

清除Logo缓存

**参数：**
- `brand`: 清除指定品牌缓存（不传则清除所有）

**示例：**
```bash
# 清除指定品牌缓存
curl -X DELETE "http://localhost:5000/api/logos?brand=mcdonalds"

# 清除所有缓存
curl -X DELETE "http://localhost:5000/api/logos"
```

## 配置说明

### 品牌Logo配置（`src/lib/brand-logos.ts`）

```typescript
export const brandLogoConfigs: Record<string, BrandLogoConfig> = {
  mcdonalds: {
    name: 'mcdonalds',
    displayName: '麦当劳',
    sources: [
      'https://example.com/mcdonalds-logo-1.png',
      'https://example.com/mcdonalds-logo-2.png',
    ],
    fallback: 'https://example.com/mcdonalds-logo-backup.png',
    localFile: 'mcdonalds-logo.png',
    colors: {
      primary: '#FFC72C',
      secondary: '#DA291C',
    },
    version: '1.0.0',
    lastUpdated: '2024-01-01',
  },
  // ...
};
```

**添加新品牌：**

1. 在 `brand-logo.ts` 中添加配置
2. 在 `src/app/receipt/page.tsx` 中添加品牌类型和配置
3. 在UI中添加品牌选项卡

## 使用示例

### 在组件中使用

```typescript
import { getBrandLogo } from '@/lib/logo-manager';

async function handleGetLogo() {
  const result = await getBrandLogo('mcdonalds');

  if (result.success && result.url) {
    console.log('Logo URL:', result.url);
    console.log('Logo Version:', result.version);
  }
}
```

### 在API中使用

```typescript
import { getBrandLogo } from '@/lib/logo-manager';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get('brand');

  if (brand) {
    const result = await getBrandLogo(brand);
    return Response.json(result);
  }

  return Response.json({ error: 'Missing brand parameter' });
}
```

## 工具函数

### getBrandLogo(brandName, forceRefresh?)

获取品牌Logo，自动处理缓存、抓取、降级

**参数：**
- `brandName`: 品牌名称
- `forceRefresh`: 是否强制刷新缓存（默认false）

**返回：** Promise<LogoResponse>

### getMultipleBrandLogos(brandNames, forceRefresh?)

批量获取品牌Logo

### refreshBrandLogo(brandName)

刷新指定品牌Logo

### clearBrandLogoCache(brandName)

清除指定品牌Logo缓存

### clearAllLogoCache()

清除所有Logo缓存

### getLogoCacheStats()

获取Logo缓存统计信息

## 缓存管理

### 缓存结构

```
public/logos/
  ├── mcdonalds-1.0.0-1704067200000.png
  ├── starbucks-1.0.0-1704067200000.png
  └── luckin-1.0.0-1704067200000.png

.logo-cache.json (缓存索引)
```

### 缓存条目格式

```json
{
  "brandName": "mcdonalds",
  "version": "1.0.0",
  "url": "https://example.com/logo.png",
  "localPath": "/workspace/projects/public/logos/mcdonalds-1.0.0-1704067200000.png",
  "size": 12345,
  "cachedAt": "2024-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-31T00:00:00.000Z"
}
```

## 性能优化

1. **并发请求**：批量获取Logo时使用 Promise.all 并发请求
2. **缓存优先**：优先使用缓存，减少网络请求
3. **超时控制**：10秒超时，避免长时间等待
4. **文件大小限制**：限制Logo大小，减少存储和传输开销
5. **自动过期**：30天自动过期，清理旧缓存

## 错误处理

系统提供多层错误保护：

1. **网络错误**：超时、连接失败等
2. **文件验证**：类型、大小验证
3. **降级策略**：使用默认Logo
4. **错误日志**：记录详细错误信息
5. **用户提示**：友好的错误提示

## 管理界面

访问 `/logos` 页面可以：

- 查看所有Logo缓存
- 查看缓存统计信息（数量、大小、更新时间）
- 刷新指定Logo
- 清除指定Logo缓存
- 清除所有缓存

## 最佳实践

1. **配置多个源**：为每个品牌配置多个Logo源，提高可用性
2. **定期更新版本**：更新Logo时，更新版本号
3. **监控缓存**：定期检查缓存统计信息
4. **清理过期**：系统自动清理，也可手动清理
5. **自定义Logo**：支持用户上传，提供更多个性化选项

## 扩展性

系统设计支持轻松扩展：

- 添加新品牌：只需在配置文件中添加
- 支持更多格式：扩展文件类型验证
- 集成CDN：修改源URL配置
- 自定义缓存策略：修改缓存管理器
- 多语言支持：扩展配置字段

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5
- **缓存**: 本地文件系统 + JSON索引
- **图片处理**: Buffer操作
- **HTTP**: Fetch API

## 注意事项

1. Logo源URL必须公开可访问
2. 避免使用需要认证的URL
3. 大Logo文件会影响性能
4. 定期检查缓存目录大小
5. 备份重要Logo文件

## 故障排查

### Logo显示不出来？

1. 检查 `public/logos/` 目录是否存在
2. 检查 `.logo-cache.json` 文件是否正确
3. 查看浏览器控制台错误信息
4. 检查服务器日志
5. 尝试刷新Logo缓存

### 上传自定义Logo失败？

1. 检查文件类型（必须是图片）
2. 检查文件大小（不超过5MB）
3. 检查网络连接
4. 查看服务器日志

### 缓存统计不准确？

1. 清除所有缓存
2. 重启服务
3. 检查文件系统权限

## 未来计划

- [ ] 支持CDN集成
- [ ] 支持Logo格式转换
- [ ] 支持Logo批量导入
- [ ] 支持Logo质量优化
- [ ] 支持Logo历史版本
- [ ] 支持Logo审核流程
