'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* 导航栏 */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="font-bold text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            AI 小票生成器
          </div>
          <Link href="/receipt">
            <Button>
              开始生成
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero 区域 */}
      <div className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                AI 智能生成
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              定制你的专属
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                品牌祝福小票
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              输入姓名、生日和送给谁，AI 自动生成品牌风格小票，
              包含专属祝福语和价格文案，一键下载 PNG
            </p>

            <Link href="/receipt">
              <Button size="lg" className="text-lg px-8 py-6 gap-2">
                <Sparkles className="h-5 w-5" />
                立即体验
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* 功能特色 */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100 mb-12">
              核心功能
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-purple-500 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                    <Receipt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>多品牌模板</CardTitle>
                  <CardDescription>
                    麦当劳、星巴克、瑞幸三种品牌风格，满足不同需求
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>AI 智能生成</CardTitle>
                  <CardDescription>
                    AI 自动生成品牌风格祝福语和价格文案，每次都有惊喜
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-green-500 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                    <ArrowRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>一键下载</CardTitle>
                  <CardDescription>
                    点击即可下载高清 PNG 格式小票，方便分享和保存
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 品牌展示 */}
      <div className="py-16 px-4 bg-white/50 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100 mb-12">
              支持的品牌
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-6xl mb-4">🍟</div>
                  <h3 className="text-xl font-bold mb-2">麦当劳</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    红黄暖色调，温馨热情
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-6xl mb-4">☕</div>
                  <h3 className="text-xl font-bold mb-2">星巴克</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    绿色系，咖啡文化
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-6xl mb-4">🫖</div>
                  <h3 className="text-xl font-bold mb-2">瑞幸</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    蓝色系，现代简约
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-2 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
              <CardHeader>
                <CardTitle className="text-3xl">准备好开始了吗？</CardTitle>
                <CardDescription className="text-lg">
                  只需要三步：填写信息 → AI 生成 → 下载小票
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/receipt">
                  <Button size="lg" className="w-full max-w-xs gap-2">
                    <Sparkles className="h-5 w-5" />
                    开始创建你的小票
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
            © 2024 AI 小票生成器. Powered by AI.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/logos">
              <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400">
                Logo 管理
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
