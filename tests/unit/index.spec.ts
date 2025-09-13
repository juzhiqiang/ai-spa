import { formatWalletAddress } from '@/utils/index';

describe('index 工具函数测试', () => {
  describe('formatWalletAddress 函数测试', () => {
    const validAddress = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
    const validAddressWithoutPrefix = '742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
    const shortAddress = '0x123456';
    const veryShortAddress = '0x12';

    describe('基本功能测试', () => {
      test('应该正确格式化标准的以太坊地址（带0x前缀）', () => {
        const result = formatWalletAddress(validAddress);
        expect(result).toBe('0x742d35...8c5e');
      });

      test('应该正确格式化不带0x前缀的地址', () => {
        const result = formatWalletAddress(validAddressWithoutPrefix);
        expect(result).toBe('742d35...8c5e');
      });

      test('应该使用默认参数（startLength=6, endLength=4）', () => {
        const result = formatWalletAddress(validAddress);
        expect(result).toBe('0x742d35...8c5e');
      });
    });

    describe('自定义参数测试', () => {
      test('应该支持自定义起始长度', () => {
        const result = formatWalletAddress(validAddress, 4);
        expect(result).toBe('0x742d...8c5e');
      });

      test('应该支持自定义结尾长度', () => {
        const result = formatWalletAddress(validAddress, 6, 6);
        expect(result).toBe('0x742d35...9b8c5e');
      });

      test('应该支持同时自定义起始和结尾长度', () => {
        const result = formatWalletAddress(validAddress, 8, 6);
        expect(result).toBe('0x742d35Cc...9b8c5e');
      });

      test('应该支持较大的起始和结尾长度', () => {
        const result = formatWalletAddress(validAddress, 10, 8);
        expect(result).toBe('0x742d35Cc66...8b9b8c5e');
      });

      test('应该支持起始长度为0', () => {
        const result = formatWalletAddress(validAddress, 0, 4);
        expect(result).toBe('0x...8c5e');
      });

      test('应该支持结尾长度为0', () => {
        const result = formatWalletAddress(validAddress, 6, 0);
        expect(result).toBe('0x742d35...');
      });

      test('起始和结尾长度都为0时应该只显示前缀和省略号', () => {
        const result = formatWalletAddress(validAddress, 0, 0);
        expect(result).toBe('0x...');
      });
    });

    describe('边界情况测试', () => {
      test('空字符串应该返回空字符串', () => {
        const result = formatWalletAddress('');
        expect(result).toBe('');
      });

      test('null 应该返回空字符串', () => {
        const result = formatWalletAddress(null as any);
        expect(result).toBe('');
      });

      test('undefined 应该返回空字符串', () => {
        const result = formatWalletAddress(undefined as any);
        expect(result).toBe('');
      });

      test('地址长度小于等于 startLength + endLength 时应该返回原地址', () => {
        expect(formatWalletAddress(shortAddress)).toBe(shortAddress);
        expect(formatWalletAddress(veryShortAddress)).toBe(veryShortAddress);
        expect(formatWalletAddress('0x12345678')).toBe('0x12345678'); // 正好10位
      });

      test('刚好超过最小长度的地址应该被格式化', () => {
        const address = '0x12345678901'; // 11位，超过默认的10位
        const result = formatWalletAddress(address);
        expect(result).toBe('0x123456...8901');
      });

      test('地址长度正好等于 startLength + endLength 时返回原地址', () => {
        const address = '0x12345678';
        const result = formatWalletAddress(address, 6, 4);
        expect(result).toBe(address);
      });
    });

    describe('前缀处理测试', () => {
      test('应该保留原有的0x前缀', () => {
        const withPrefix = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
        const result = formatWalletAddress(withPrefix);
        expect(result).toContain('0x');
        expect(result.startsWith('0x')).toBe(true);
      });

      test('没有0x前缀的地址不应该添加前缀', () => {
        const withoutPrefix = '742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
        const result = formatWalletAddress(withoutPrefix);
        expect(result).not.toContain('0x');
        expect(result.startsWith('742d35')).toBe(true);
      });

      test('0x前缀应该在格式化后保持在开头', () => {
        const result = formatWalletAddress(validAddress, 8, 6);
        expect(result.indexOf('0x')).toBe(0);
      });
    });

    describe('特殊字符和格式测试', () => {
      test('应该正确处理大小写混合的地址', () => {
        const mixedCaseAddress = '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12';
        const result = formatWalletAddress(mixedCaseAddress);
        expect(result).toBe('0xAbCdEf...Ef12');
      });

      test('应该正确处理全大写地址', () => {
        const upperCaseAddress = '0X742D35CC6634C0532925A3B8D45C7C8F8B9B8C5E';
        const result = formatWalletAddress(upperCaseAddress);
        expect(result).toBe('0X742D...8C5E');
      });

      test('应该正确处理全小写地址', () => {
        const lowerCaseAddress = '0x742d35cc6634c0532925a3b8d45c7c8f8b9b8c5e';
        const result = formatWalletAddress(lowerCaseAddress);
        expect(result).toBe('0x742d35...8c5e');
      });

      test('应该处理包含特殊字符的字符串', () => {
        const specialChars = '0x742d35@#$%^&*(){}[]|\\:";\'<>?,./';
        const result = formatWalletAddress(specialChars);
        expect(result).toBe('0x742d35...?,./');
      });
    });

    describe('参数验证测试', () => {
      test('负数起始长度应该被处理', () => {
        const result = formatWalletAddress(validAddress, -1, 4);
        expect(result).toBe('0x...8c5e');
      });

      test('负数结尾长度应该被处理', () => {
        const result = formatWalletAddress(validAddress, 6, -1);
        expect(result).toBe('0x742d35...');
      });

      test('起始和结尾长度都为负数时应该被处理', () => {
        const result = formatWalletAddress(validAddress, -1, -1);
        expect(result).toBe('0x...');
      });

      test('非常大的起始长度应该正常工作', () => {
        const result = formatWalletAddress(validAddress, 100, 4);
        expect(result).toBe(validAddress);
      });

      test('非常大的结尾长度应该正常工作', () => {
        const result = formatWalletAddress(validAddress, 6, 100);
        expect(result).toBe(validAddress);
      });

      test('起始和结尾长度之和超过地址长度时应该返回原地址', () => {
        const shortAddr = '0x123456789';
        const result = formatWalletAddress(shortAddr, 10, 10);
        expect(result).toBe(shortAddr);
      });
    });

    describe('性能和压力测试', () => {
      test('应该能处理非常长的地址字符串', () => {
        const longString = '0x' + 'a'.repeat(1000);
        const result = formatWalletAddress(longString);
        expect(result).toBe('0xaaaaaa...aaaa');
        expect(result.length).toBeLessThan(longString.length);
      });

      test('应该能批量处理多个地址', () => {
        const addresses = [
          '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e',
          '0x1234567890123456789012345678901234567890',
          '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        ];

        const results = addresses.map(addr => formatWalletAddress(addr));

        expect(results).toEqual([
          '0x742d35...8c5e',
          '0x123456...7890',
          '0xabcdef...abcd'
        ]);
      });

      test('大量调用时应该保持性能', () => {
        const startTime = Date.now();
        
        for (let i = 0; i < 1000; i++) {
          formatWalletAddress(validAddress);
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // 1000次调用应该在合理时间内完成（例如小于100ms）
        expect(duration).toBeLessThan(100);
      });
    });

    describe('边界值精确测试', () => {
      test('测试各种精确的长度边界', () => {
        // 测试长度为10的地址（默认参数下的边界）
        const addr10 = '0x12345678'; // 长度10
        expect(formatWalletAddress(addr10)).toBe(addr10);
        
        // 测试长度为11的地址（刚好需要格式化）
        const addr11 = '0x123456789'; // 长度11
        expect(formatWalletAddress(addr11)).toBe('0x123456...6789');
      });

      test('测试自定义参数下的边界值', () => {
        const address = '0x1234567890abcdef';
        
        // startLength=4, endLength=4, 总需要长度8
        expect(formatWalletAddress(address, 4, 4)).toBe('0x1234...cdef');
        
        // startLength=5, endLength=5, 总需要长度10
        expect(formatWalletAddress(address, 5, 5)).toBe('0x12345...bcdef');
      });
    });

    describe('实际使用场景测试', () => {
      test('以太坊主网地址格式化', () => {
        const ethAddress = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
        const result = formatWalletAddress(ethAddress);
        expect(result).toMatch(/^0x[0-9a-fA-F]{6}\.\.\.[0-9a-fA-F]{4}$/);
      });

      test('BSC地址格式化', () => {
        const bscAddress = '0x55d398326f99059ff775485246999027b3197955';
        const result = formatWalletAddress(bscAddress);
        expect(result).toBe('0x55d398...7955');
      });

      test('Polygon地址格式化', () => {
        const polygonAddress = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';
        const result = formatWalletAddress(polygonAddress);
        expect(result).toBe('0x2791bc...4174');
      });

      test('自定义显示长度的钱包地址', () => {
        const address = '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e';
        
        // 移动端显示 - 更短
        const mobileResult = formatWalletAddress(address, 4, 3);
        expect(mobileResult).toBe('0x742d...c5e');
        
        // 桌面端显示 - 更长
        const desktopResult = formatWalletAddress(address, 8, 6);
        expect(desktopResult).toBe('0x742d35Cc...9b8c5e');
      });
    });
  });
});