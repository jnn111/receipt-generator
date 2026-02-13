/**
 * Logo评估器
 * 智能评估Logo质量，选择最佳Logo
 */

import { LogoQuality, LogoEvaluationInput } from './types';
import { validateLogoBuffer } from './utils';

/**
 * 评估Logo质量
 * @param input Logo评估输入
 * @returns 质量评估结果
 */
export function evaluateLogoQuality(input: LogoEvaluationInput): LogoQuality {
  const { buffer } = input;

  if (!validateLogoBuffer(buffer)) {
    return {
      size: 0,
      resolution: 0,
      aspectRatio: 0,
      colorScore: 0,
      overall: 0,
    };
  }

  // 基础评估
  const size = buffer.length;
  const resolution = estimateResolution(buffer);
  const aspectRatio = estimateAspectRatio(buffer);
  const colorScore = evaluateColorQuality(buffer);

  // 计算综合评分
  const overall = calculateOverallScore(size, resolution, aspectRatio, colorScore);

  return {
    size,
    resolution,
    aspectRatio,
    colorScore,
    overall,
  };
}

/**
 * 估算图片分辨率
 * @param buffer 图片缓冲区
 * @returns 估算的分辨率
 */
function estimateResolution(buffer: Buffer): number {
  // 简单估算：基于文件大小和格式
  // 实际项目中可以使用图像处理库获取准确分辨率
  const sizeKB = buffer.length / 1024;

  // 基于文件大小的简单估算
  if (sizeKB < 10) {
    return 0.2; // 低分辨率
  } else if (sizeKB < 100) {
    return 0.5; // 中等分辨率
  } else if (sizeKB < 500) {
    return 0.8; // 高分辨率
  } else {
    return 1.0; // 超高分辨率
  }
}

/**
 * 估算图片宽高比
 * @param buffer 图片缓冲区
 * @returns 宽高比评分
 */
function estimateAspectRatio(buffer: Buffer): number {
  // 理想的Logo宽高比通常在1:1到2:1之间
  // 这里使用简单的启发式方法
  // 实际项目中可以使用图像处理库获取准确宽高比
  const sizeKB = buffer.length / 1024;

  // 基于文件大小和格式的启发式估算
  // 假设大多数Logo是正方形或接近正方形
  return 0.8; // 默认评分，实际项目中应改进
}

/**
 * 评估颜色质量
 * @param buffer 图片缓冲区
 * @returns 颜色评分
 */
function evaluateColorQuality(buffer: Buffer): number {
  // 简单评估：基于文件大小和假设
  // 实际项目中可以分析颜色分布、饱和度等
  const sizeKB = buffer.length / 1024;

  // 颜色丰富度与文件大小相关
  if (sizeKB < 20) {
    return 0.3; // 颜色较少
  } else if (sizeKB < 100) {
    return 0.6; // 颜色适中
  } else {
    return 0.9; // 颜色丰富
  }
}

/**
 * 计算综合评分
 * @param size 文件大小
 * @param resolution 分辨率
 * @param aspectRatio 宽高比
 * @param colorScore 颜色评分
 * @returns 综合评分
 */
function calculateOverallScore(
  size: number,
  resolution: number,
  aspectRatio: number,
  colorScore: number
): number {
  // 权重分配
  const weights = {
    size: 0.3,
    resolution: 0.4,
    aspectRatio: 0.15,
    colorScore: 0.15,
  };

  // 计算加权平均分
  const weightedScore = 
    (size / 1024000) * weights.size + // 归一化到1MB
    resolution * weights.resolution +
    aspectRatio * weights.aspectRatio +
    colorScore * weights.colorScore;

  // 限制在0-1之间
  return Math.max(0, Math.min(1, weightedScore));
}

/**
 * 选择最佳Logo
 * @param logos Logo数组
 * @returns 最佳Logo
 */
export function selectBestLogo(logos: LogoEvaluationInput[]): LogoEvaluationInput & { quality: LogoQuality } {
  if (logos.length === 0) {
    throw new Error('No logos to evaluate');
  }

  // 评估所有Logo
  const evaluatedLogos = logos.map(logo => ({
    ...logo,
    quality: evaluateLogoQuality(logo),
  }));

  // 按综合评分排序
  evaluatedLogos.sort((a, b) => b.quality.overall - a.quality.overall);

  // 返回评分最高的Logo
  return evaluatedLogos[0];
}

/**
 * 批量评估Logo
 * @param logos Logo数组
 * @returns 评估结果数组
 */
export function evaluateMultipleLogos(logos: LogoEvaluationInput[]): Array<LogoEvaluationInput & { quality: LogoQuality }> {
  return logos.map(logo => ({
    ...logo,
    quality: evaluateLogoQuality(logo),
  })).sort((a, b) => b.quality.overall - a.quality.overall);
}

/**
 * 过滤低质量Logo
 * @param logos Logo数组
 * @param threshold 质量阈值
 * @returns 过滤后的Logo数组
 */
export function filterLowQualityLogos(
  logos: LogoEvaluationInput[],
  threshold: number = 0.3
): LogoEvaluationInput[] {
  return logos.filter(logo => {
    const quality = evaluateLogoQuality(logo);
    return quality.overall >= threshold;
  });
}
