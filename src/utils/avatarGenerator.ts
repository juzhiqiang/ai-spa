// src/utils/avatarGenerator.ts

/**
 * 生成基于地址的渐变色头像
 */
export const generateGradientAvatar = (address: string | null | undefined): string => {
  if (!address || typeof address !== 'string') return '';
  
  // 确保地址格式正确
  const cleanAddress = address.trim();
  if (cleanAddress.length < 6) return '';
  
  // 基于地址生成颜色
  const colors = getColorsFromAddress(cleanAddress);
  
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad-${cleanAddress.slice(2, 8)}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#grad-${cleanAddress.slice(2, 8)})" />
      <text x="20" y="26" font-family="Arial, sans-serif" font-size="16" font-weight="bold" 
            text-anchor="middle" fill="white">
        ${getInitials(cleanAddress)}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * 基于地址生成颜色
 */
const getColorsFromAddress = (address: string) => {
  if (!address || typeof address !== 'string') {
    return { primary: '#666666', secondary: '#999999' };
  }
  
  const hash = address.startsWith('0x') ? address.slice(2) : address; // 移除 0x
  
  // 确保有足够的字符
  if (hash.length < 12) {
    return { primary: '#666666', secondary: '#999999' };
  }
  
  // 使用地址的不同部分生成两个颜色
  const primaryHex = hash.slice(0, 6);
  const secondaryHex = hash.slice(6, 12);
  
  return {
    primary: `#${primaryHex}`,
    secondary: `#${secondaryHex}`
  };
};

/**
 * 从地址生成首字母
 */
const getInitials = (address: string | null | undefined): string => {
  if (!address || typeof address !== 'string') return '??';
  
  const cleanAddress = address.trim();
  
  // 确保地址长度足够
  if (cleanAddress.length < 4) return '??';
  
  // 取地址的前两个字符作为首字母（去掉0x）
  const startIndex = cleanAddress.startsWith('0x') ? 2 : 0;
  const endIndex = startIndex + 2;
  
  if (cleanAddress.length <= endIndex) return '??';
  
  return cleanAddress.slice(startIndex, endIndex).toUpperCase();
};

/**
 * 格式化地址显示
 */
export const formatAddress = (address: string | null | undefined): string => {
  if (!address || typeof address !== 'string') return '';
  
  const cleanAddress = address.trim();
  
  if (cleanAddress.length <= 10) return cleanAddress;
  
  return `${cleanAddress.slice(0, 6)}...${cleanAddress.slice(-4)}`;
};

/**
 * 验证图片URL是否有效
 */
export const isValidImageUrl = async (url: string): Promise<boolean> => {
  if (!url || typeof url !== 'string') return false;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // 5秒超时
    setTimeout(() => resolve(false), 5000);
  });
};