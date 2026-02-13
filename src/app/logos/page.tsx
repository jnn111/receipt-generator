'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Trash2, Upload, Image as ImageIcon, HardDrive, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LogoCacheEntry {
  brandName: string;
  version: string;
  url: string;
  localPath: string;
  size: number;
  cachedAt: string;
  expiresAt: string;
}

interface CacheStats {
  totalSize: number;
  totalCount: number;
  entries: LogoCacheEntry[];
}

export default function LogoManagePage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshingBrand, setRefreshingBrand] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/logos?stats=true');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('获取缓存统计失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshLogo = async (brandName: string) => {
    setRefreshingBrand(brandName);
    try {
      const response = await fetch(`/api/logos?brand=${brandName}&refresh=true`);
      const data = await response.json();
      if (data.success) {
        await fetchStats();
      } else {
        alert('刷新失败：' + (data.data?.error || '未知错误'));
      }
    } catch (error) {
      console.error('刷新Logo失败:', error);
      alert('刷新失败，请重试');
    } finally {
      setRefreshingBrand(null);
    }
  };

  const clearLogoCache = async (brandName: string) => {
    if (!confirm(`确定要清除 ${brandName} 的Logo缓存吗？`)) return;

    try {
      const response = await fetch(`/api/logos?brand=${brandName}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        await fetchStats();
      }
    } catch (error) {
      console.error('清除缓存失败:', error);
      alert('清除缓存失败，请重试');
    }
  };

  const clearAllCache = async () => {
    if (!confirm('确定要清除所有Logo缓存吗？')) return;

    try {
      const response = await fetch('/api/logos', {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        await fetchStats();
      }
    } catch (error) {
      console.error('清除缓存失败:', error);
      alert('清除缓存失败，请重试');
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <ImageIcon className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            <Badge variant="secondary" className="text-base px-4 py-1">
              Logo 管理系统
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            品牌 Logo 管理
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            查看和管理品牌Logo缓存，支持自动抓取、刷新和自定义上传
          </p>
        </motion.div>

        {/* 统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总缓存数量</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCount || 0}</div>
              <p className="text-xs text-muted-foreground">个Logo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总缓存大小</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats ? formatSize(stats.totalSize) : '0 B'}</div>
              <p className="text-xs text-muted-foreground">磁盘占用</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">最后更新</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.entries[0] ? formatDate(stats.entries[0].cachedAt).split(' ')[0] : '-'}
              </div>
              <p className="text-xs text-muted-foreground">最近一次更新</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mb-8"
        >
          <Button onClick={fetchStats} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新统计
          </Button>
          <Button
            variant="destructive"
            onClick={clearAllCache}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            清除所有缓存
          </Button>
        </motion.div>

        {/* Logo列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Logo 缓存列表</CardTitle>
              <CardDescription>
                查看所有缓存的品牌Logo及其详细信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">
                  加载中...
                </div>
              ) : stats?.entries && stats.entries.length > 0 ? (
                <div className="space-y-4">
                  {stats.entries.map((entry, index) => (
                    <div key={entry.brandName} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Logo预览 */}
                          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center">
                            <Image
                              src={`/logos/${entry.localPath.split('/').pop()}`}
                              alt={`${entry.brandName} Logo`}
                              width={60}
                              height={60}
                              className="object-contain"
                            />
                          </div>

                          {/* 信息 */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg capitalize">
                                {entry.brandName}
                              </h3>
                              <Badge variant="outline">{entry.version}</Badge>
                            </div>
                            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-center gap-2">
                                <HardDrive className="h-3.5 w-3.5" />
                                <span>大小: {formatSize(entry.size)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" />
                                <span>缓存时间: {formatDate(entry.cachedAt)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" />
                                <span>过期时间: {formatDate(entry.expiresAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refreshLogo(entry.brandName)}
                            disabled={refreshingBrand === entry.brandName}
                            className="gap-1"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${refreshingBrand === entry.brandName ? 'animate-spin' : ''}`} />
                            刷新
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => clearLogoCache(entry.brandName)}
                            className="gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            清除
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>暂无Logo缓存</p>
                  <p className="text-sm mt-2">使用小票生成器时会自动缓存Logo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 说明区域 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>功能说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>• <strong>自动抓取</strong>：系统会从品牌官网、CDN自动抓取最新Logo</p>
              <p>• <strong>智能缓存</strong>：抓取的Logo会被缓存，有效期30天</p>
              <p>• <strong>版本管理</strong>：支持Logo版本更新，确保使用最新版本</p>
              <p>• <strong>自定义上传</strong>：用户可以在小票生成器中上传自己的Logo</p>
              <p>• <strong>批量管理</strong>：支持批量刷新和清除所有Logo缓存</p>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="my-8" />

        {/* 链接 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button variant="link" asChild>
            <a href="/receipt">
              <Upload className="mr-2 h-4 w-4" />
              前往小票生成器上传自定义Logo
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
