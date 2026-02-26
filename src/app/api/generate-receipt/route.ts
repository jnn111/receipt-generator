import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      recipient,
      brand,
      loveMessage,
      backgroundImage,
      leftImage,
      rightImage,
    } = body;

    // 提取日期数字（月+日）
    const dateObj = new Date(date);
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    const dateNumber = `${month}${day}`;

    // 生成订单号和时间（使用用户填写的日期）
    const orderNumber = Math.floor(Date.now() / 1000).toString();
    const orderTime = `${dateObj.getFullYear()}.${(dateObj.getMonth() + 1).toString().padStart(2, "0")}.${dateObj.getDate().toString().padStart(2, "0")} ${dateObj.getHours().toString().padStart(2, "0")}:${dateObj.getMinutes().toString().padStart(2, "0")}`;

    // 使用 LLM 生成小票内容
    const llmPrompt = `
你是一个专业的文案创作者。请根据以下信息，生成一个品牌风格的小票内容：

信息：
- 日期：${date}（日期数字：${dateNumber}）
- 送给谁：${recipient}
- 品牌：${brand === "mcdonalds" ? "麦当劳" : brand === "starbucks" ? "星巴克" : "瑞幸"}
${loveMessage ? `- 爱意文案：${loveMessage}` : ""}

请生成以下内容（全部为中文）：
1. title: 标题，格式：#${recipient}的[日期]限定套餐，其中日期使用当前日期（YYYY.MM.DD），并根据爱意文案的主题和情感添加适当的描述，必须包含"限定套餐"四个字
2. remark: 备注，内容温馨有趣，体现品牌特色，基于爱意文案创造幸福的祝福语
3. products: 商品列表，包含3-4个创意商品，每个商品有name和quantity，商品名称要基于爱意文案的关键词创造
4. payment: 实付金额（创意文案，如"无价"），结合爱意文案的情感
5. discounts: 优惠列表，2-3条优惠信息，优惠内容要基于爱意文案的主题创造温馨的祝福语

8. userNote: 用户备注，内容要温暖，基于爱意文案创造幸福的祝福语

重要要求：
- 请仔细分析爱意文案，提取其中的所有重要关键词和信息（如"十周年"、"结婚"、"纪念日"等具体时间或事件信息）
- 不要生硬地重复爱意文案，而是基于提取的关键词和情感创造新的、温馨的祝福语
- 确保这些关键词和信息在小票的多个部分中都有自然体现，而不仅仅是在一个地方
- 使整个小票都充满爱意和个性化，完全体现爱意文案的主题和情感
- 不要忽略任何重要信息，特别是像"十周年"这样的具体时间或事件
- 所有生成的内容都要自然、温馨、有创意，符合品牌风格

商品列表示例：
- name: "${recipient}的限定套餐", quantity: "1"
- name: "对你的爱", quantity: "加倍"
- name: "你的财富", quantity: "无限加倍"

请以JSON格式返回：
{
  "title": "...",
  "remark": "...",
  "products": [
    {"name": "...", "quantity": "..."}
  ],
  "payment": "...",
  "discounts": ["...", "..."],

  "userNote": "..."
}

只返回JSON，不要有其他内容。
`;

    // 生成当前日期字符串 (YYYY.MM.DD)
    const currentDate = `${dateObj.getFullYear()}.${(dateObj.getMonth() + 1).toString().padStart(2, "0")}.${dateObj.getDate().toString().padStart(2, "0")}`;
    const recipientName = recipient || "亲爱的";

    // 基于用户输入和品牌生成AI爱意文案
    const generateAIContent = (brand: string, loveMessage: string) => {
      const brandName =
        brand === "mcdonalds"
          ? "麦当劳"
          : brand === "starbucks"
            ? "星巴克"
            : "瑞幸";

      // 分析爱意文案，提取关键词
      let keywords = "";
      if (loveMessage.includes("十周年")) keywords = "十周年";
      else if (loveMessage.includes("结婚")) keywords = "结婚";
      else if (loveMessage.includes("纪念日")) keywords = "纪念日";
      else if (loveMessage.includes("生日")) keywords = "生日";
      else if (loveMessage.includes("爱")) keywords = "爱";

      // 根据品牌和关键词生成内容
      const brandSpecificContent = {
        mcdonalds: {
          title: keywords
            ? `#${recipientName}的${currentDate}${keywords}限定套餐`
            : `#${recipientName}的${currentDate}限定套餐`,
          remark: keywords
            ? `备注: ${recipientName}的${keywords}特别祝福，麦当当为你送上最甜蜜的爱`
            : `备注: 麦当当 快乐每一天`,
          products: [
            { name: `${recipientName}的限定套餐`, quantity: "1" },
            {
              name: keywords ? `${keywords}的爱` : "对你的爱",
              quantity: "加倍",
            },
            { name: "永恒的幸福", quantity: "无限加倍" },
            { name: "快乐时光", quantity: "永久" },
          ],
          payment: "无价",
          discounts: [
            keywords ? `折扣: ${keywords}专属优惠` : "折扣: 对你的爱不打折",
            "折扣: 真爱无价",
            "折扣: 爱加倍",
          ],
          userNote: keywords
            ? `${keywords}快乐！麦当当与你一起分享每一个美好时刻~`
            : "满意请给好评，记得五星哦~",
        },
        starbucks: {
          title: keywords
            ? `#${recipientName}的${currentDate}${keywords}限定套餐`
            : `#${recipientName}的${currentDate}限定套餐`,
          remark: keywords
            ? `备注: ${recipientName}的${keywords}特别祝福，星巴克为你送上温暖的爱`
            : `备注: 星巴克 一杯温暖一生`,
          products: [
            { name: `${recipientName}的限定套餐`, quantity: "1" },
            { name: "醇香咖啡", quantity: "无限续杯" },
            {
              name: keywords ? `${keywords}的甜蜜` : "甜蜜时光",
              quantity: "加倍",
            },
            { name: "幸福味道", quantity: "永久" },
          ],
          payment: "无价",
          discounts: [
            keywords ? `折扣: ${keywords}专属优惠` : "折扣: 爱意不打折",
            "折扣: 温暖无限",
            "折扣: 真爱无价",
            "折扣: 甜蜜永久",
            "折扣: 温馨时光",
            "折扣: 幸福满杯",
          ],
          userNote: keywords
            ? `${keywords}快乐！星巴克与你共享温馨时光~`
            : "享受美好时光，记得给好评哦~",
        },
        luckin: {
          title: keywords
            ? `#${recipientName}的${currentDate}${keywords}限定套餐`
            : `#${recipientName}的${currentDate}限定套餐`,
          remark: keywords
            ? `备注: ${recipientName}的${keywords}特别祝福，瑞幸为你送上活力的爱`
            : `备注: 瑞幸 快乐每一天`,
          products: [
            { name: `${recipientName}的限定套餐`, quantity: "1" },
            { name: "冰爽咖啡", quantity: "无限续杯" },
            {
              name: keywords ? `${keywords}的激情` : "激情活力",
              quantity: "加倍",
            },
            { name: "美好时光", quantity: "永久" },
          ],
          payment: "无价",
          discounts: [
            keywords ? `折扣: ${keywords}专属优惠` : "折扣: 热情不打折",
            "折扣: 活力无限",
            "折扣: 真爱无价",
            "折扣: 激情永久",
            "折扣: 快乐无限",
            "折扣: 活力满杯",
          ],
          userNote: keywords
            ? `${keywords}快乐！瑞幸与你共创美好回忆~`
            : "享受美好时光，记得给好评哦~",
        },
      };

      const content =
        brandSpecificContent[brand as keyof typeof brandSpecificContent] ||
        brandSpecificContent.mcdonalds;
      return {
        ...content,
        backgroundImage,
        leftImage,
        rightImage,
      };
    };

    // 生成内容
    let generatedContent = generateAIContent(brand, loveMessage || "");

    // 确保标题包含限定套餐
    if (!generatedContent.title.includes("限定套餐")) {
      generatedContent.title = `#${recipientName}的${currentDate}限定套餐`;
    }

    const receiptData = {
      date,
      recipient,
      dateNumber,
      title: generatedContent.title,
      remark: generatedContent.remark,
      orderTime,
      orderNumber,
      products: generatedContent.products,
      payment: generatedContent.payment,
      discounts: generatedContent.discounts,
      userNote: generatedContent.userNote,
      loveMessage,
      backgroundImage,
      leftImage,
      rightImage,
    };

    return NextResponse.json(receiptData);
  } catch (error) {
    console.error("生成小票失败:", error);
    return NextResponse.json({ error: "生成小票失败" }, { status: 500 });
  }
}
