import { StyleSheet, Platform } from 'react-native';

// 全局颜色配置
export const colors = {
  // 主背景色
  background: '#F0F2F5',
  
  // 卡片渐变色组
  gradients: {
    chat: ['#FF9A9E', '#FECFEF'],
    calendar: ['#A8EDEA', '#FED6E3'],
    todos: ['#FFECD2', '#FCB69F'],
    settings: ['#C7A2FF', '#E6E6FA'],
    primary: ['#FF6B9D', '#FF8FB3'],
    secondary: ['#4ECDC4', '#44A08D'],
  },
  
  // 文字颜色
  text: {
    primary: '#2D3748',
    secondary: '#4A5568',
    accent: '#FF6B9D',
    light: 'rgba(45,55,72,0.95)',
  },
  
  // 玻璃效果颜色
  glass: {
    background: 'rgba(255,255,255,0.35)',
    border: 'rgba(255,255,255,0.5)',
    overlay: 'rgba(255,255,255,0.2)',
    shadow: 'rgba(0,0,0,0.15)',
  }
};

// 全局样式组件
export const globalStyles = StyleSheet.create({
  // 容器样式
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // 背景液态效果
  backgroundLiquid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'linear-gradient(135deg, rgba(255,154,158,0.08), rgba(168,237,234,0.08), rgba(199,162,255,0.08))',
    opacity: 0.7,
  },
  
  // 玻璃卡片容器
  glassCard: {
    backgroundColor: colors.glass.background,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.glass.border,
    shadowColor: colors.glass.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // 小玻璃卡片
  glassCardSmall: {
    backgroundColor: colors.glass.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glass.border,
    shadowColor: colors.glass.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // 标题文字
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-condensed',
  },
  
  // 副标题文字
  subtitleText: {
    fontSize: 18,
    color: colors.text.accent,
    fontFamily: Platform.OS === 'ios' ? 'Avenir-Medium' : 'sans-serif',
  },
  
  // 普通文字
  bodyText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
  },
  
  // 卡片内容
  cardContent: {
    padding: 18,
  },
  
  // 按钮样式
  glassButton: {
    backgroundColor: colors.glass.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: colors.glass.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});

// 创建渐变背景的辅助函数
export const createGradientStyle = (gradientColors, additionalStyles = {}) => ({
  ...additionalStyles,
  background: `linear-gradient(135deg, ${gradientColors.join(', ')})`,
});