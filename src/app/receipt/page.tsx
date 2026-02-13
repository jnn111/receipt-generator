"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  Sparkles,
  Loader2,
  Receipt,
  RefreshCw,
  Upload,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Brand = "mcdonalds" | "starbucks" | "luckin";

interface ReceiptData {
  // 基础信息
  date: string;
  recipient: string;

  // 编号区
  dateNumber: string; // 如 "0816"

  // 标题区
  title: string; // 如 "#赵先生的2026.02.14限定套餐"

  // 备注区
  remark: string; // 如 "备注: 麦当当 快乐每一天"

  // 时间区
  orderTime: string; // 下单时间
  orderNumber: string; // 订单编号

  // 商品区
  products: Array<{
    name: string;
    quantity: string;
  }>;

  // 支付区
  payment: string; // 如 "无价"
  discounts: string[]; // 如 ["折扣: 对你的爱不打折"]

  // 配送区
  deliveryPerson: string; // 如 "张女士送货上门服务"
  deliveryAddress: string; // 如 "我们爱的小屋"
  userNote: string; // 如 "满意请给好评"
}

const brandConfigs = {
  mcdonalds: {
    name: "麦当劳",
    theme: "from-red-50 to-yellow-50 dark:from-red-950 dark:to-yellow-950",
    accent: "border-red-500",
    textColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-600",
    icon: "🍟",
    logoPath: "/mcdonalds-logo-v2.png",
  },
  starbucks: {
    name: "星巴克",
    theme:
      "from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950",
    accent: "border-green-500",
    textColor: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-600",
    icon: "☕",
    logoPath: "/starbucks-logo-v2.png",
  },
  luckin: {
    name: "瑞幸",
    theme: "from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950",
    accent: "border-blue-500",
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-600",
    icon: "🫖",
    logoPath: "/luckin-logo-v2.png",
  },
};

export default function ReceiptPage() {
  const [selectedBrand, setSelectedBrand] = useState<Brand>("mcdonalds");
  const [formData, setFormData] = useState({
    date: "",
    recipient: "",
    loveMessage: "",
  });
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [logoUrls, setLogoUrls] = useState<Record<Brand, string>>({
    mcdonalds: "/logos/mcdonalds-2.0.0-1771010910053.png",
    starbucks: "/logos/starbucks-smart-logo.webp",
    luckin: "/logos/luckin-smart-logo.webp",
  });
  const [isRefreshingLogo, setIsRefreshingLogo] = useState(false);

  // 上传自定义Logo
  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      alert("请上传图片文件");
      return;
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert("文件大小不能超过5MB");
      return;
    }

    const formData = new FormData();
    formData.append("action", "upload");
    formData.append("brand", selectedBrand);
    formData.append("file", file);

    try {
      const response = await fetch("/api/logos", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        setLogoUrls((prev) => ({
          ...prev,
          [selectedBrand]: data.data.url,
        }));
        alert("Logo上传成功！");
      } else {
        alert("上传失败：" + (data.data?.error || "未知错误"));
      }
    } catch (error) {
      console.error("上传Logo失败:", error);
      alert("上传失败，请重试");
    }
  };

  // 移除外部URL依赖，直接使用本地路径
  // 初始化时设置本地路径
  useEffect(() => {
    // 确保logoUrls始终使用本地路径
    setLogoUrls({
      mcdonalds: "/logos/mcdonalds-2.0.0-1771010910053.png",
      starbucks: "/logos/starbucks-smart-logo.webp",
      luckin: "/logos/luckin-smart-logo.webp",
    });
  }, []);

  const generateReceipt = async () => {
    if (!formData.date || !formData.recipient) {
      alert("请填写完整信息");
      return;
    }

    setIsGenerating(true);

    try {
      // 调用后端API生成小票内容
      const response = await fetch("/api/generate-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formData.date,
          recipient: formData.recipient,
          loveMessage: formData.loveMessage,
          brand: selectedBrand,
        }),
      });

      if (!response.ok) {
        throw new Error("生成失败");
      }

      const data = await response.json();
      setReceiptData(data);
    } catch (error) {
      console.error("生成小票失败:", error);
      alert("生成小票失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReceipt = async () => {
    if (!receiptData || !receiptRef.current) return;

    setIsDownloading(true);

    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${formData.recipient}_${selectedBrand}_小票.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("下载失败:", error);
      alert("下载失败，请重试");
    } finally {
      setIsDownloading(false);
    }
  };

  const receiptRef = useRef<HTMLDivElement>(null);

  const renderReceipt = () => {
    if (!receiptData) return null;

    const config = brandConfigs[selectedBrand];
    const logoUrl = logoUrls[selectedBrand];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex justify-center"
      >
        <div
          ref={receiptRef}
          id="receipt-preview"
          className="bg-white shadow-2xl relative overflow-hidden flex flex-col"
          style={{
            fontFamily: "Arial, sans-serif",
            width: "640px",
            height: "1798px",
            padding: "30px",
            boxSizing: "border-box",
          }}
        >
          {/* 顶部区域 - 品牌 Logo 和标语 */}
          <div className="text-center mb-6 relative">
            {/* 品牌 Logo */}
            <div className="mt-10 mb-3 flex justify-center relative">
              {/* 直接使用img标签处理所有图片 */}
              <img
                src={logoUrl}
                alt={`${config.name} Logo`}
                width={200}
                height={200}
                className="object-contain"
              />
            </div>

            {/* 品牌标语 */}
            <div className="text-2xl font-bold text-slate-800 mb-3 tracking-wide">
              {selectedBrand === "mcdonalds"
                ? "i'm lovin' it"
                : selectedBrand === "starbucks"
                  ? "To inspire and nurture"
                  : "Make every moment count"}
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-4 tracking-wider">
              {selectedBrand === "mcdonalds"
                ? "我 就 喜 欢"
                : selectedBrand === "starbucks"
                  ? "激发灵感"
                  : "让每个时刻都有咖啡"}
            </div>
          </div>

          {/* 编号区 - 生日数字 */}
          <div className="text-center mb-6">
            <div
              className="text-6xl font-black tracking-wider"
              style={{
                color:
                  selectedBrand === "mcdonalds"
                    ? "#DA291C"
                    : selectedBrand === "starbucks"
                      ? "#00704A"
                      : "#0061AF",
              }}
            >
              {receiptData.dateNumber}
            </div>
          </div>

          {/* 分隔线 */}
          <div className="border-t-2 border-dashed border-slate-300 my-4"></div>

          {/* 标题区 */}
          <div className="mb-6">
            <div className="text-3xl font-bold text-slate-800 mb-3">
              {receiptData.title}
            </div>
          </div>

          {/* 备注区 */}
          <div className="mb-5">
            <div className="text-xl text-slate-600">{receiptData.remark}</div>
          </div>

          {/* 时间区 */}
          <div className="mb-5 space-y-2">
            <div className="text-xl text-slate-600 flex">
              <span className="w-24">下单时间:</span>
              <span>{receiptData.orderTime}</span>
            </div>
            <div className="text-xl text-slate-600 flex">
              <span className="w-24">订单编号:</span>
              <span>{receiptData.orderNumber}</span>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="border-t-2 border-dashed border-slate-300 my-4"></div>

          {/* 商品区 */}
          <div className="mb-7">
            {/* 表头 */}
            <div className="flex justify-between items-center text-xl font-bold text-slate-800 mb-4 border-b border-slate-300 pb-3">
              <div>名称</div>
              <div>数量</div>
            </div>

            {/* 商品列表 */}
            <div className="space-y-4">
              {receiptData.products.map((product, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-xl"
                >
                  <div className="text-slate-800">{product.name}</div>
                  <div className="text-slate-600 whitespace-nowrap">
                    {product.quantity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 分隔线 */}
          <div className="border-t-2 border-dashed border-slate-300 my-4"></div>

          {/* 支付区 */}
          <div className="mb-7">
            <div className="flex justify-between items-center mb-5">
              <span className="text-xl text-slate-600">实付:</span>
              <span className="text-4xl font-bold text-slate-800">
                {receiptData.payment}
              </span>
            </div>

            {receiptData.discounts.length > 0 && (
              <div className="mb-5">
                <div className="text-xl font-semibold text-slate-500 mb-4">
                  优惠:
                </div>
                {receiptData.discounts.map((discount, index) => (
                  <div key={index} className="text-xl text-slate-600 mb-3">
                    -{discount.replace("折扣:", "")}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 分隔线 */}
          <div className="border-t-2 border-dashed border-slate-300 my-4"></div>

          {/* 配送区 */}
          <div className="mb-7 space-y-4">
            <div className="text-xl text-slate-600 flex">
              <span className="w-24">配送:</span>
              <span>{receiptData.deliveryPerson}</span>
            </div>
            <div className="text-xl text-slate-600 flex">
              <span className="w-24">配送地址:</span>
              <span>{receiptData.deliveryAddress}</span>
            </div>
            <div className="text-xl text-slate-600 flex">
              <span className="w-24">用户备注:</span>
              <span>{receiptData.userNote}</span>
            </div>
          </div>

          {/* 底部彩蛋 - 自动生成 */}
          <div className="mt-auto pt-8">
            {/* 生日派对装饰 */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-slate-800 mb-4">
                🎉 HAPPY BIRTHDAY 🎉
              </div>
              <div className="text-3xl font-bold text-slate-700">生日快乐</div>
            </div>

            {/* 生日蛋糕插画 */}
            <div className="flex justify-center items-center mb-8">
              <div className="text-center">
                {/* 派对元素 */}
                <div className="flex justify-center gap-4 mb-6">
                  <div className="text-3xl">🎈</div>
                  <div className="text-3xl">🎁</div>
                  <div className="text-3xl">🎊</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Receipt className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            <Badge variant="secondary" className="text-base px-4 py-1">
              AI 智能生成
            </Badge>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            定制你的专属祝福小票
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            输入姓名、生日和送给谁，AI
            自动生成品牌风格小票，包含祝福语和价格文案
          </p>
        </div>

        {/* 输入表单区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                填写信息
              </CardTitle>
              <CardDescription>
                输入基本信息，AI 将自动生成小票内容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 品牌选择 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">
                    选择品牌风格
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isRefreshingLogo}
                    className="gap-1 h-8"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isRefreshingLogo ? "animate-spin" : ""}`}
                    />
                    刷新Logo
                  </Button>
                </div>
                <Tabs
                  value={selectedBrand}
                  onValueChange={(v) => setSelectedBrand(v as Brand)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="mcdonalds">
                      <span className="mr-1">🍟</span>
                      麦当劳
                    </TabsTrigger>
                    <TabsTrigger value="starbucks">
                      <span className="mr-1">☕</span>
                      星巴克
                    </TabsTrigger>
                    <TabsTrigger value="luckin">
                      <span className="mr-1">🫖</span>
                      瑞幸
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Logo预览 */}
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg flex flex-col items-center justify-center gap-2">
                  {/* 直接使用img标签处理所有图片 */}
                  <img
                    src={logoUrls[selectedBrand]}
                    alt={`${brandConfigs[selectedBrand].name} Logo`}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                  <label className="cursor-pointer">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 w-full"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      上传自定义Logo
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <Separator />

              {/* 输入字段 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="date" className="text-base">
                    日期 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="mt-1.5 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="recipient" className="text-base">
                    送给谁 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="recipient"
                    placeholder="例如：自己、朋友、家人"
                    value={formData.recipient}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipient: e.target.value,
                      })
                    }
                    className="mt-1.5 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="loveMessage" className="text-base">
                    爱意文案
                  </Label>
                  <textarea
                    id="loveMessage"
                    placeholder="输入你想要表达的爱意文案，AI 会自动识别并填充到小票中"
                    value={formData.loveMessage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        loveMessage: e.target.value,
                      })
                    }
                    className="mt-1.5 w-full p-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                    rows={4}
                  />
                </div>
              </div>

              {/* 生成按钮 */}
              <Button
                onClick={generateReceipt}
                disabled={isGenerating}
                size="lg"
                className="w-full h-12 text-base gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    AI 正在生成...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    一键生成小票
                  </>
                )}
              </Button>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                ✨ AI 将自动生成品牌风格祝福语和价格文案
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 小票预览区域 */}
      {receiptData && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>小票预览</CardTitle>
                <CardDescription>小票尺寸：640 × 1798</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center overflow-auto">
                <div className="scale-[0.4] md:scale-50 lg:scale-60 origin-top">
                  {renderReceipt()}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 下载按钮区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-12"
          >
            <Button
              onClick={downloadReceipt}
              disabled={isDownloading}
              size="lg"
              className="gap-2 w-full max-w-md"
            >
              {isDownloading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              {isDownloading ? "生成中..." : "下载小票"}
            </Button>
          </motion.div>
        </>
      )}

      {/* 底部说明 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 text-center"
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          💡 提示：生成的祝福语和价格文案由 AI 智能创作，每次生成可能不同
        </p>
      </motion.div>
    </div>
  );
}
