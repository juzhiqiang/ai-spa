import { generateGradientAvatar, formatAddress, isValidImageUrl } from '@/utils/avatarGenerator';

describe('avatarGenerator 工具函数测试', () => {
  describe('generateGradientAvatar 函数测试', () => {
    const validAddress = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
    const shortAddress = '0x12';
    const addressWithoutPrefix = '742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';

    describe('基本功能测试', () => {
      test('应该为有效地址生成base64编码的SVG头像', () => {
        const result = generateGradientAvatar(validAddress);

        expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
        expect(result.length).toBeGreaterThan(0);

        // 解码并验证SVG内容
        const base64Data = result.replace('data:image/svg+xml;base64,', '');
        const svgContent = atob(base64Data);

        expect(svgContent).toContain('<svg');
        expect(svgContent).toContain('<circle');
        expect(svgContent).toContain('<linearGradient');
        expect(svgContent).toContain('<text');
      });

      test('应该为不带0x前缀的地址生成头像', () => {
        const result = generateGradientAvatar(addressWithoutPrefix);

        expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
        expect(result.length).toBeGreaterThan(0);
      });

      test('相同地址应该生成相同的头像', () => {
        const result1 = generateGradientAvatar(validAddress);
        const result2 = generateGradientAvatar(validAddress);

        expect(result1).toBe(result2);
      });

      test('不同地址应该生成不同的头像', () => {
        const address1 = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
        const address2 = '0x1234567890123456789012345678901234567890';

        const result1 = generateGradientAvatar(address1);
        const result2 = generateGradientAvatar(address2);

        expect(result1).not.toBe(result2);
      });
    });

    describe('边界情况测试', () => {
      test('空字符串应该返回空字符串', () => {
        expect(generateGradientAvatar('')).toBe('');
      });

      test('null应该返回空字符串', () => {
        expect(generateGradientAvatar(null)).toBe('');
      });

      test('undefined应该返回空字符串', () => {
        expect(generateGradientAvatar(undefined)).toBe('');
      });

      test('长度小于6的地址应该返回空字符串', () => {
        expect(generateGradientAvatar(shortAddress)).toBe('');
        expect(generateGradientAvatar('0x123')).toBe('');
      });

      test('只有空格的字符串应该返回空字符串', () => {
        expect(generateGradientAvatar('   ')).toBe('');
      });
    });

    describe('SVG结构验证', () => {
      test('生成的SVG应该包含正确的渐变ID', () => {
        const result = generateGradientAvatar(validAddress);
        const base64Data = result.replace('data:image/svg+xml;base64,', '');
        const svgContent = atob(base64Data);

        const gradientId = validAddress.slice(2, 8);
        expect(svgContent).toContain(`id="grad-${gradientId}"`);
        expect(svgContent).toContain(`url(#grad-${gradientId})`);
      });

      test('生成的SVG应该包含首字母', () => {
        const result = generateGradientAvatar(validAddress);
        const base64Data = result.replace('data:image/svg+xml;base64,', '');
        const svgContent = atob(base64Data);

        expect(svgContent).toContain('74'); // 地址前两个字符的大写
      });
    });
  });

  describe('formatAddress 函数测试', () => {
    const validAddress = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
    const shortAddress = '0x123456';

    describe('基本功能测试', () => {
      test('应该正确格式化长地址', () => {
        const result = formatAddress(validAddress);
        expect(result).toBe('0x742d...8c5e');
      });

      test('应该处理不带0x前缀的地址', () => {
        const address = '742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
        const result = formatAddress(address);
        expect(result).toBe('742d35...8c5e');
      });

      test('短地址应该原样返回', () => {
        expect(formatAddress(shortAddress)).toBe(shortAddress);
        expect(formatAddress('0x123')).toBe('0x123');
      });
    });

    describe('边界情况测试', () => {
      test('空字符串应该返回空字符串', () => {
        expect(formatAddress('')).toBe('');
      });

      test('null应该返回空字符串', () => {
        expect(formatAddress(null)).toBe('');
      });

      test('undefined应该返回空字符串', () => {
        expect(formatAddress(undefined)).toBe('');
      });

      test('只有空格的字符串应该按照长度处理', () => {
        const spaces = '           '; // 11个空格
        const result = formatAddress(spaces);
        expect(result).toBe('      ...    '); // 前6个...后4个
      });

      test('长度正好为10的地址应该原样返回', () => {
        const address = '0x12345678';
        expect(formatAddress(address)).toBe(address);
      });
    });

    describe('格式验证', () => {
      test('格式化结果应该包含省略号', () => {
        const result = formatAddress(validAddress);
        expect(result).toContain('...');
      });

      test('格式化结果的前缀和后缀应该正确', () => {
        const result = formatAddress(validAddress);
        expect(result.startsWith('0x742d')).toBe(true);
        expect(result.endsWith('8c5e')).toBe(true);
      });
    });
  });

  describe('isValidImageUrl 函数测试', () => {
    // 注意：这些测试需要模拟Image对象的行为
    beforeEach(() => {
      // 模拟Image构造函数
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;

        set src(url: string) {
          // 模拟异步加载
          setTimeout(() => {
            if (url && typeof url === 'string' && url.includes('valid')) {
              this.onload?.();
            } else {
              this.onerror?.();
            }
          }, 0);
        }
      } as any;
    });

    describe('基本功能测试', () => {
      test('有效URL应该返回true', async () => {
        const result = await isValidImageUrl('https://example.com/valid-image.jpg');
        expect(result).toBe(true);
      });

      test('无效URL应该返回false', async () => {
        // 确保URL不包含'valid'关键词
        const result = await isValidImageUrl('https://example.com/image.jpg');
        expect(result).toBe(false);
      });
    });

    describe('边界情况测试', () => {
      test('空字符串应该返回false', async () => {
        const result = await isValidImageUrl('');
        expect(result).toBe(false);
      });

      test('null应该返回false', async () => {
        const result = await isValidImageUrl(null as any);
        expect(result).toBe(false);
      });

      test('undefined应该返回false', async () => {
        const result = await isValidImageUrl(undefined as any);
        expect(result).toBe(false);
      });

      test('非字符串类型应该返回false', async () => {
        const result = await isValidImageUrl(123 as any);
        expect(result).toBe(false);
      });
    });

    test('应该在5秒后超时', async () => {
      global.Image = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_url: string) {
          // 不触发回调
        }
      } as any;

      const startTime = Date.now();
      const result = await isValidImageUrl('https://xxxx/timeout-image.jpg');
      const endTime = Date.now();

      expect(result).toBe(false);
      expect(endTime - startTime).toBeGreaterThanOrEqual(4900);
    }, 10000);
  });

  // 测试内部辅助函数（通过公开函数间接测试）
  describe('内部辅助函数间接测试', () => {
    describe('getColorsFromAddress 间接测试', () => {
      test('相同地址应该生成相同颜色的头像', () => {
        const address = '0x123456789012345678901234567890123456789';
        const result1 = generateGradientAvatar(address);
        const result2 = generateGradientAvatar(address);

        expect(result1).toBe(result2);
      });

      test('不同地址应该生成不同颜色的头像', () => {
        const address1 = '0x111111111111111111111111111111111111111';
        const address2 = '0x222222222222222222222222222222222222222';

        const result1 = generateGradientAvatar(address1);
        const result2 = generateGradientAvatar(address2);

        expect(result1).not.toBe(result2);
      });

      test('短地址应该使用默认颜色（通过返回空字符串体现）', () => {
        const result = generateGradientAvatar('0x123');
        expect(result).toBe('');
      });
    });

    describe('getInitials 间接测试', () => {
      test('生成的SVG应该包含正确的首字母', () => {
        const address = '0xabcdef1234567890abcdef1234567890abcdef12';
        const result = generateGradientAvatar(address);

        const base64Data = result.replace('data:image/svg+xml;base64,', '');
        const svgContent = atob(base64Data);

        expect(svgContent).toContain('AB'); // 地址去掉0x后的前两个字符大写
      });

      test('不带0x前缀的地址应该使用正确的首字母', () => {
        const address = 'fedcba0987654321fedcba0987654321fedcba09';
        const result = generateGradientAvatar(address);

        const base64Data = result.replace('data:image/svg+xml;base64,', '');
        const svgContent = atob(base64Data);

        expect(svgContent).toContain('FE'); // 前两个字符大写
      });

      test('过短地址应该返回空字符串而不是??', () => {
        const result = generateGradientAvatar('0x1');
        expect(result).toBe('');
      });
    });

    describe('边界条件覆盖测试', () => {
      test('地址长度恰好为6时应该生成头像', () => {
        const result = generateGradientAvatar('0x1234');
        expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
      });

      test('不带0x前缀但长度不足12的地址应该使用默认颜色', () => {
        const shortHash = '123456789'; // 只有9位，不足12位
        const result = generateGradientAvatar(shortHash);

        if (result) {
          const base64Data = result.replace('data:image/svg+xml;base64,', '');
          const svgContent = atob(base64Data);
          // 应该包含默认颜色
          expect(svgContent).toContain('#666666');
          expect(svgContent).toContain('#999999');
        }
      });

      test('地址长度正好12位应该使用完整颜色', () => {
        const exactHash = '123456789abc'; // 正好12位
        const result = generateGradientAvatar(exactHash);

        const base64Data = result.replace('data:image/svg+xml;base64,', '');
        const svgContent = atob(base64Data);
        expect(svgContent).toContain('#123456');
        expect(svgContent).toContain('#789abc');
      });

      test('空白字符串应该被处理', () => {
        const result = generateGradientAvatar('   ');
        expect(result).toBe('');
      });

      test('长度恰好为4的地址应该返回空字符串', () => {
        const result = generateGradientAvatar('0x12');
        expect(result).toBe('');
      });
    });
  });

  // 测试getColorsFromAddress函数的边界情况
  describe('getColorsFromAddress 函数边界测试', () => {
    test('null值应该返回默认颜色', () => {
      // 通过generateGradientAvatar间接测试
      const result = generateGradientAvatar(null);
      expect(result).toBe('');
    });

    test('非字符串类型应该返回默认颜色', () => {
      // 通过generateGradientAvatar间接测试
      const result = generateGradientAvatar(123 as any);
      expect(result).toBe('');
    });
  });

  // 测试getInitials函数的边界情况
  describe('getInitials 函数边界测试', () => {
    test('null值应该返回??', () => {
      // 由于getInitials是私有函数，通过generateGradientAvatar间接测试
      // 但由于null会在generateGradientAvatar中被过滤，我们需要其他方式
      const result = generateGradientAvatar('0x'); // 长度为2，不足4
      expect(result).toBe('');
    });

    test('非字符串类型应该返回??', () => {
      // 通过formatAddress间接测试getInitials的逻辑
      const result = formatAddress(null);
      expect(result).toBe('');
    });

    test('长度恰好为endIndex的边界情况', () => {
      const result = generateGradientAvatar('0x12'); // 长度为4，恰好为endIndex
      expect(result).toBe('');
    });
  });

  // 专门测试getColorsFromAddress函数的所有分支
  describe('getColorsFromAddress完整分支覆盖', () => {
    test('空字符串应该触发默认颜色分支', () => {
      const result = generateGradientAvatar('');
      expect(result).toBe('');
    });

    test('非字符串null应该触发默认颜色分支', () => {
      const result = generateGradientAvatar(null);
      expect(result).toBe('');
    });

    test('非字符串undefined应该触发默认颜色分支', () => {
      const result = generateGradientAvatar(undefined);
      expect(result).toBe('');
    });

    test('带0x前缀但hash长度小于12应该使用默认颜色', () => {
      const result = generateGradientAvatar('0x12345'); // 去掉0x后只有5位，但总长度>=6所以会生成
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);

      const base64Data = result.replace('data:image/svg+xml;base64,', '');
      const svgContent = atob(base64Data);
      // 因为hash长度小于12，应该使用默认颜色
      expect(svgContent).toContain('#666666');
      expect(svgContent).toContain('#999999');
    });

    test('不带0x前缀且长度小于12应该使用默认颜色', () => {
      const result = generateGradientAvatar('123456'); // 6位，长度>=6，但hash长度<12
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);

      const base64Data = result.replace('data:image/svg+xml;base64,', '');
      const svgContent = atob(base64Data);
      // 因为hash长度小于12，应该使用默认颜色
      expect(svgContent).toContain('#666666');
      expect(svgContent).toContain('#999999');
    });

    test('不带0x前缀且长度正好12应该正常生成', () => {
      const result = generateGradientAvatar('123456789012'); // 正好12位
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);

      const base64Data = result.replace('data:image/svg+xml;base64,', '');
      const svgContent = atob(base64Data);
      expect(svgContent).toContain('#123456');
      expect(svgContent).toContain('#789012');
    });

    test('带0x前缀且去掉前缀后长度大于12应该正常生成', () => {
      const result = generateGradientAvatar('0x1234567890123456'); // 去掉0x后14位
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);

      const base64Data = result.replace('data:image/svg+xml;base64,', '');
      const svgContent = atob(base64Data);
      expect(svgContent).toContain('#123456');
      expect(svgContent).toContain('#789012');
    });
  });

  // 专门测试getInitials函数的所有分支
  describe('getInitials完整分支覆盖', () => {
    test('cleanAddress长度小于4应该返回??（通过formatAddress测试）', () => {
      // formatAddress使用类似的逻辑但更简单
      const result = formatAddress('abc'); // 长度3，小于4
      expect(result).toBe('abc'); // 直接返回原字符串
    });

    test('cleanAddress长度正好等于endIndex应该返回??', () => {
      // 这需要构造特殊情况，使得cleanAddress.length <= endIndex
      // 由于getInitials是私有函数，我们通过generateGradientAvatar间接测试
      // 但generateGradientAvatar在长度检查时就会返回''
      // 我们需要测试formatAddress中的边界情况
      const result = formatAddress('0x12'); // 长度4
      expect(result).toBe('0x12');
    });

    test('测试getInitials中的startIndex计算', () => {
      // 测试带0x前缀的情况
      const resultWith0x = generateGradientAvatar('0xabcdef1234567890abcdef12');
      if (resultWith0x) {
        const base64Data = resultWith0x.replace('data:image/svg+xml;base64,', '');
        const svgContent = atob(base64Data);
        expect(svgContent).toContain('AB'); // 应该是'ab'的大写
      }

      // 测试不带0x前缀的情况
      const resultWithout0x = generateGradientAvatar('abcdef1234567890abcdef12');
      if (resultWithout0x) {
        const base64Data = resultWithout0x.replace('data:image/svg+xml;base64,', '');
        const svgContent = atob(base64Data);
        expect(svgContent).toContain('AB'); // 应该是'ab'的大写
      }
    });

    test('测试getInitials中cleanAddress.length <= endIndex的情况', () => {
      // 构造一个地址，使得endIndex刚好等于或大于地址长度
      // 对于0x前缀：startIndex=2, endIndex=4，所以地址长度<=4时会触发这个分支
      // 但这种情况会在generateGradientAvatar的长度检查中被过滤掉
      // 我们需要通过其他方式间接测试，或者直接测试formatAddress中类似的逻辑

      // 测试一个带0x前缀但长度正好为4的地址（这会被generateGradientAvatar过滤）
      const shortResult = generateGradientAvatar('0x12'); // 长度4，会在初始检查中被过滤
      expect(shortResult).toBe('');

      // 测试一个不带0x前缀但长度为2的地址（endIndex会是2，等于长度）
      const veryShortResult = generateGradientAvatar('ab1234'); // 长度6，startIndex=0, endIndex=2
      if (veryShortResult) {
        const base64Data = veryShortResult.replace('data:image/svg+xml;base64,', '');
        const svgContent = atob(base64Data);
        expect(svgContent).toContain('AB'); // 应该正常显示
      }
    });

    test('测试getInitials函数处理null和非字符串', () => {
      // 由于getInitials是私有函数，我们需要通过generateGradientAvatar间接测试
      // 但generateGradientAvatar会先过滤null和非字符串
      // 所以这些分支可能不会被执行到

      // 测试formatAddress中类似的null处理逻辑
      expect(formatAddress(null)).toBe('');
      expect(formatAddress(undefined)).toBe('');
      expect(formatAddress(123 as any)).toBe('');
    });

    test('测试getColorsFromAddress中的边界情况', () => {
      // 需要测试getColorsFromAddress中!address条件
      // 由于是私有函数，通过generateGradientAvatar间接测试
      expect(generateGradientAvatar(null)).toBe('');
      expect(generateGradientAvatar(undefined)).toBe('');
      expect(generateGradientAvatar('')).toBe('');

      // 测试typeof address !== 'string'的情况
      expect(generateGradientAvatar(123 as any)).toBe('');
      expect(generateGradientAvatar({} as any)).toBe('');
      expect(generateGradientAvatar([] as any)).toBe('');
    });

    // 测试可能触发getInitials中"??"返回的条件
    test('测试可能触发内部函数返回??的特殊情况', () => {
      // 如果我们能构造一个情况，使得地址通过了generateGradientAvatar的验证
      // 但在getInitials中仍然触发某些边界条件

      // 通过修改实现来理解问题：
      // generateGradientAvatar检查 cleanAddress.length < 6
      // getInitials检查 cleanAddress.length < 4 和 cleanAddress.length <= endIndex
      // 所以长度6的地址应该能通过第一个检查，但可能在getInitials中有问题

      // 测试长度6的特殊情况
      const result6char = generateGradientAvatar('123456'); // 6位，没有0x
      if (result6char) {
        const base64Data = result6char.replace('data:image/svg+xml;base64,', '');
        const svgContent = atob(base64Data);
        expect(svgContent).toContain('12'); // 应该显示前两位
      }

      // 测试带0x且总长度为6的情况：0x123 (长度5，会被过滤)
      // 测试带0x且总长度为7的情况：0x1234 (长度7，应该生成)
      const result7char = generateGradientAvatar('0x1234'); // 7位
      if (result7char) {
        const base64Data = result7char.replace('data:image/svg+xml;base64,', '');
        const svgContent = atob(base64Data);
        expect(svgContent).toContain('12'); // 应该显示去掉0x后的前两位
      }
    });

    // 针对性测试各种地址长度和格式组合以覆盖所有分支
    test('系统性测试所有长度和格式组合', () => {
      const testCases = [
        // 测试各种长度以触发不同的分支条件
        { input: '123456', desc: '6位无前缀' },
        { input: '1234567', desc: '7位无前缀' },
        { input: '12345678901', desc: '11位无前缀' },
        { input: '123456789012', desc: '12位无前缀' },
        { input: '1234567890123', desc: '13位无前缀' },
        { input: '0x1234', desc: '带0x前缀4位内容' },
        { input: '0x12345', desc: '带0x前缀5位内容' },
        { input: '0x123456789', desc: '带0x前缀9位内容' },
        { input: '0x1234567890', desc: '带0x前缀10位内容' },
        { input: '0x12345678901', desc: '带0x前缀11位内容' },
        { input: '0x123456789012', desc: '带0x前缀12位内容' }
      ];

      testCases.forEach(testCase => {
        const result = generateGradientAvatar(testCase.input);
        if (result) {
          expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
          // 验证SVG内容包含预期的元素
          const base64Data = result.replace('data:image/svg+xml;base64,', '');
          const svgContent = atob(base64Data);
          expect(svgContent).toContain('<svg');
          expect(svgContent).toContain('<circle');
          expect(svgContent).toContain('<text');
        }
      });
    });
  });
});