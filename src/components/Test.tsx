import { useImmer } from '@hooks/useImmer';
import { atom, useAtom } from 'jotai';
import { useEffect, useState } from 'react';
// const textAtom = atom('hello');
const Index = () => {
  //解决状态撕裂
  // const [text,setText] = useAtom(textAtom);
  // const [text, setText] = useState({ data: '123', info: '123' });

  const [text, setText] = useImmer({ data: '123', info: '123' });

  // immer 不可变对象
  useEffect(() => {
    //setText({ data: '123', info: '123' });

    setText(draft => {
      draft.data = '123';
    });
  }, [setText]);

  // 按钮点击处理函数
  const handleUpdate = () => {
    // 没有做到web3大学 种调用方式
    //contractInstance ==》类型
    // const contractInstance = new Contract(
    //   CONTRACT_ADDRESS,
    //   InfoContractABI.abi,
    //   signer,
    // ) as unknown as InfoContract;

    // contractInstance.setInfo();

    // const contractInstance = InfoContract__factory.connect(CONTRACT_ADDRESS, signer);
    // contractInstance.setInfo()
    setText(draft => {
      draft.data = Math.random().toString(36).substring(7); // 生成随机字符串
      draft.info = new Date().toLocaleTimeString(); // 更新时间
    });
  };

  //复杂的逻辑
  console.log('我是老袁🍊🍊🍊🍊🍊🍊');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{text.data} 测试数据</h1>
      <p className="text-gray-600 mb-4">更新时间: {text.info}</p>
      <button
        onClick={handleUpdate}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        更新数据
      </button>
    </div>
  );
};

Index.whyDidYouRender = true;
export default Index;
