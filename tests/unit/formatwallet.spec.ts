import { formatWalletAddress } from '@utils/index';
describe('formatWalletAddress 函数测试', () => {
  // 测试数据
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
    test('应该支持同时自定义起始和结尾长度', () => {
      const result = formatWalletAddress(validAddress, 8, 6);
      expect(result).toBe('0x742d35Cc...b8c5e');
    });

    test('应该支持较大的起始和结尾长度', () => {
      const result = formatWalletAddress(validAddress, 10, 8);
      expect(result).toBe('0x742d35Cc66...8b9b8c5e');
    });
  });

  describe('边界情况测试', () => {
    test('空字符串应该返回空字符串', () => {
      const result = formatWalletAddress('');
      expect(result).toBe('');
    });

    test('null 或 undefined 应该返回空字符串', () => {
      expect(formatWalletAddress(null as any)).toBe('');
      expect(formatWalletAddress(undefined as any)).toBe('');
    });

    test('地址长度小于等于 startLength + endLength 时应该返回原地址', () => {
      // 默认参数下，长度 <= 10 的地址应该原样返回
      expect(formatWalletAddress(shortAddress)).toBe(shortAddress);
      expect(formatWalletAddress(veryShortAddress)).toBe(veryShortAddress);
      expect(formatWalletAddress('0x1234567890')).toBe('0x1234567890'); // 正好10位
    });

    test('刚好超过最小长度的地址应该被格式化', () => {
      const address = '0x12345678901'; // 11位，超过默认的10位
      const result = formatWalletAddress(address);
      expect(result).toBe('0x123456...8901');
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
      expect(result).toBe('0X742D35...8C5E');
    });

    test('应该正确处理全小写地址', () => {
      const lowerCaseAddress = '0x742d35cc6634c0532925a3b8d45c7c8f8b9b8c5e';
      const result = formatWalletAddress(lowerCaseAddress);
      expect(result).toBe('0x742d35...8c5e');
    });
  });

  describe('参数验证测试', () => {
    test('起始长度为0时应该正常工作', () => {
      const result = formatWalletAddress(validAddress, 0, 4);
      expect(result).toBe('0x...8c5e');
    });

    test('结尾长度为0时应该正常工作', () => {
      const result = formatWalletAddress(validAddress, 6, 0);
      expect(result).toBe('0x742d35...');
    });

    test('起始和结尾长度都为0时应该只显示前缀和省略号', () => {
      const result = formatWalletAddress(validAddress, 0, 0);
      expect(result).toBe('0x...');
    });

    test('负数参数应该被处理为0', () => {
      const result1 = formatWalletAddress(validAddress, -1, 4);
      const result2 = formatWalletAddress(validAddress, 6, -1);
      // 注意：slice(-1) 会从末尾开始，所以这里测试实际行为
      expect(result1).toBe('0x...8c5e');
      expect(result2).toBe('0x742d35...');
    });
  });

  describe('性能和压力测试', () => {
    test('应该能处理非常长的地址字符串', () => {
      const longString = '0x' + 'a'.repeat(1000);
      const result = formatWalletAddress(longString);
      expect(result).toBe('0xaaaaaa...aaaa');
    });

    test('应该能批量处理多个地址', () => {
      const addresses = [
        '0x742d35Cc6634C0532925a3b8D45c7c8f8b9b8c5e',
        '0x1234567890123456789012345678901234567890',
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      ];

      const results = addresses.map(addr => formatWalletAddress(addr));

      expect(results).toEqual(['0x742d35...8c5e', '0x123456...7890', '0xabcdef...abcd']);
    });
  });
});
