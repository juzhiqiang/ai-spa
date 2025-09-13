import WalletConnection from '../components/WalletConnection';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';
import React, { useState, useEffect, useCallback } from 'react';

const Dapp = () => {
  const {
    account,
    provider,
    isConnecting,
    isDisconnecting,
    authorizedAccounts,
    connectWallet,
    disconnectWallet,
    setAccount
  } = useWallet();

  const {
    loading,
    createEnvelope,
    claimEnvelope,
    getRedPacketInfo,
    hasUserClaimed,
    getUserClaimedAmount,
    getContractOwner,
    getContractConstants,
    contractAddress
  } = useContract(provider);

  const [redPacketInfo, setRedPacketInfo] = useState<any>(null);
  const [userHasClaimed, setUserHasClaimed] = useState(false);
  const [userClaimedAmount, setUserClaimedAmount] = useState("0");
  const [contractOwner, setContractOwner] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [contractConstants, setContractConstants] = useState({ totalAmount: "0.05", maxRecipients: 6 });
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // 修复类型问题：确保返回类型明确
  const handleAccountChange = useCallback((newAccount: string): boolean => {
    console.log('🔄 App层处理账户切换:', newAccount);
    console.log('📝 当前已授权账户:', authorizedAccounts);

    // 检查是否为已授权账户
    const isAuthorized = authorizedAccounts.some(
      addr => addr.toLowerCase() === newAccount.toLowerCase()
    );

    if (isAuthorized) {
      console.log('✅ 验证通过，执行账户切换');
      // 调用useWallet的setAccount方法进行切换
      const success = setAccount(newAccount);
      if (success !== false) {
        // 立即触发数据重新加载
        console.log('📊 触发数据重新加载');
        setLastUpdateTime(Date.now());
        return true;
      }
      return false;
    } else {
      console.warn('⚠️ 账户未授权，拒绝切换:', newAccount);
      console.warn('已授权账户列表:', authorizedAccounts);
      return false;
    }
  }, [authorizedAccounts, setAccount]);

  const fetchRedPacketInfo = useCallback(async () => {
    if (provider) {
      try {

        const info = await getRedPacketInfo();
        setRedPacketInfo(info);

        const owner = await getContractOwner();
        setContractOwner(owner);

        const constants = await getContractConstants();
        setContractConstants(constants);

        if (account) {
          const accountLower = account.toLowerCase();
          const ownerLower = owner.toLowerCase();
          setIsOwner(accountLower === ownerLower);

          const claimed = await hasUserClaimed(account);
          setUserHasClaimed(claimed);

          if (claimed) {
            const amount = await getUserClaimedAmount(account);
            setUserClaimedAmount(amount);
          } else {
            // 重置已领取金额
            setUserClaimedAmount("0");
          }

        }
      } catch (error) {
        console.error('Failed to fetch red packet info:', error);
      }
    }
  }, [provider, getRedPacketInfo, hasUserClaimed, getUserClaimedAmount, getContractOwner, getContractConstants, account]);

  useEffect(() => {
    fetchRedPacketInfo();
  }, [fetchRedPacketInfo, lastUpdateTime]);

  const handleDeposit = async () => {
    try {
      const txHash = await createEnvelope();
      if (txHash) {
        alert('充值成功！交易哈希: ' + txHash);
        setLastUpdateTime(Date.now());
      }
    } catch (error: any) {
      console.error('Deposit failed:', error);
      let errorMessage = '充值失败，请重试';

      if (error.message && error.message.includes('insufficient funds')) {
        errorMessage = '余额不足';
      } else if (error.message && error.message.includes('user rejected')) {
        errorMessage = '用户取消了交易';
      } else if (error.message && error.message.includes('connect wallet')) {
        errorMessage = '请先连接钱包';
      } else if (error.message && error.message.includes('Only contract owner')) {
        errorMessage = '只有合约拥有者可以充值';
      }

      alert(errorMessage);
    }
  };

  const handleClaimRedPacket = async () => {
    try {
      const result = await claimEnvelope();
      if (result) {
        alert(`恭喜！您领取了 ${result.amount} ETH\n交易哈希: ${result.transactionHash}`);
        setLastUpdateTime(Date.now());
      }
    } catch (error: any) {
      console.error('Claim failed:', error);
      let errorMessage = '领取失败，请重试';

      if (error.message && error.message.includes('Already claimed')) {
        errorMessage = '您已经领取过了';
      } else if (error.message && error.message.includes('All red packets claimed')) {
        errorMessage = '红包已被抢完';
      } else if (error.message && error.message.includes('No remaining amount')) {
        errorMessage = '红包余额不足';
      } else if (error.message && error.message.includes('user rejected')) {
        errorMessage = '用户取消了交易';
      }

      alert(errorMessage);
    }
  };

  // 计算进度百分比
  const getProgressPercentage = () => {
    if (!redPacketInfo || !contractConstants.totalAmount) return 0;
    const distributed = parseFloat(redPacketInfo.distributedAmount || "0");
    const total = parseFloat(contractConstants.totalAmount);
    return total > 0 ? (distributed / total) * 100 : 0;
  };

    // 样式定义
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    backgroundPattern: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)
      `,
      pointerEvents: 'none' as const
    },
    header: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative' as const,
      zIndex: 10
    },
    headerContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    title: {
      color: 'white',
      margin: '20px 0',
      fontSize: '32px',
      fontWeight: 'bold',
      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      background: 'linear-gradient(45deg, #fff, #f0f0f0)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    mainContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      position: 'relative' as const,
      zIndex: 1
    },
    card: {
      background: 'rgba(255, 255, 255, 0.12)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '30px',
      margin: '20px 0',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    footer: {
      textAlign: 'center' as const,
      padding: '40px 20px',
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: '14px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)'
    }
  };

    return (
    <div style={styles.container}>
      <div style={styles.backgroundPattern} />
      
      <div style={styles.header}>
        <div style={styles.headerContainer}>
          <h1 style={styles.title}>
            🧧 智能合约红包系统
          </h1>
          <WalletConnection
            account={account}
            isConnecting={isConnecting}
            isDisconnecting={isDisconnecting}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
            onAccountChange={handleAccountChange}
          />
        </div>
      </div>

      <div style={styles.mainContainer}>
        {/* 优化的钱包状态提示 */}
        {account && authorizedAccounts.length > 1 && (
          <div style={{
            ...styles.card,
            background: 'rgba(52, 152, 219, 0.15)',
            border: '1px solid rgba(52, 152, 219, 0.3)',
            padding: '20px',
            margin: '10px 0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px'
            }}>
              <span>⚡</span>
              <span>
                检测到 {authorizedAccounts.length} 个已授权账户，可以通过钱包菜单快速切换，完全无需 MetaMask 确认
              </span>
            </div>
          </div>
        )}

        {account ? (
          <>
            {/* 合约信息卡片 */}
            <div style={styles.card}>
              <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>📋 合约信息</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <p style={{ marginBottom: '8px', opacity: 0.8 }}>📍 合约地址</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', wordBreak: 'break-all' }}>
                    {contractAddress}
                  </p>
                </div>
                <div>
                  <p style={{ marginBottom: '8px', opacity: 0.8 }}>👑 合约拥有者</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', wordBreak: 'break-all' }}>
                    {contractOwner}
                    {isOwner && <span style={{ color: '#2ed573', marginLeft: '8px' }}>（您）</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* 红包状态卡片 */}
            <div style={styles.card}>
              <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>🎁 红包状态</h2>
              
              {redPacketInfo && (
                <>
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '15px', 
                    padding: '20px', 
                    marginBottom: '20px' 
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>💰</div>
                        <div style={{ opacity: 0.8, fontSize: '14px', marginBottom: '4px' }}>总金额</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{contractConstants.totalAmount} ETH</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
                        <div style={{ opacity: 0.8, fontSize: '14px', marginBottom: '4px' }}>已分发</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{redPacketInfo.distributedAmount} ETH</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                        <div style={{ opacity: 0.8, fontSize: '14px', marginBottom: '4px' }}>已领取人数</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{redPacketInfo.claimedCount}/{contractConstants.maxRecipients}</div>
                      </div>
                    </div>
                    
                    {/* 进度条 */}
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', opacity: 0.8 }}>分发进度</span>
                        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{getProgressPercentage().toFixed(1)}%</span>
                      </div>
                      <div style={{ 
                        background: 'rgba(255, 255, 255, 0.2)', 
                        borderRadius: '10px', 
                        height: '8px', 
                        overflow: 'hidden' 
                      }}>
                        <div style={{ 
                          background: 'linear-gradient(90deg, #2ed573, #26d46c)',
                          height: '100%', 
                          width: `${getProgressPercentage()}%`,
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* 用户状态 */}
                  <div style={{
                    background: userHasClaimed 
                      ? 'rgba(46, 213, 115, 0.2)' 
                      : 'rgba(255, 193, 7, 0.2)',
                    border: userHasClaimed 
                      ? '1px solid rgba(46, 213, 115, 0.4)' 
                      : '1px solid rgba(255, 193, 7, 0.4)',
                    borderRadius: '15px',
                    padding: '20px',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                      {userHasClaimed ? '✅' : '🎁'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                      {userHasClaimed ? '您已领取红包' : '您可以领取红包'}
                    </div>
                    {userHasClaimed && (
                      <div style={{ fontSize: '16px', opacity: 0.9 }}>
                        获得金额: <strong>{userClaimedAmount} ETH</strong>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* 操作按钮 */}
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                {isOwner && (
                  <button
                    onClick={handleDeposit}
                    disabled={loading}
                    style={{
                      background: 'linear-gradient(135deg, #3742fa, #2f3542)',
                      color: 'white',
                      border: 'none',
                      padding: '15px 30px',
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 15px rgba(55, 66, 250, 0.3)',
                      opacity: loading ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading && (
                      <div className="loading-spinner" style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white'
                      }} />
                    )}
                    💰 充值红包 ({contractConstants.totalAmount} ETH)
                  </button>
                )}
                
                {!userHasClaimed && redPacketInfo && redPacketInfo.claimedCount < contractConstants.maxRecipients && (
                  <button
                    onClick={handleClaimRedPacket}
                    disabled={loading || userHasClaimed}
                    style={{
                      background: userHasClaimed 
                        ? 'rgba(149, 165, 166, 0.8)' 
                        : 'linear-gradient(135deg, #ff4757, #ff3838)',
                      color: 'white',
                      border: 'none',
                      padding: '15px 30px',
                      borderRadius: '25px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: (loading || userHasClaimed) ? 'not-allowed' : 'pointer',
                      boxShadow: userHasClaimed 
                        ? 'none' 
                        : '0 4px 15px rgba(255, 71, 87, 0.3)',
                      opacity: (loading || userHasClaimed) ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading && (
                      <div className="loading-spinner" style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white'
                      }} />
                    )}
                    🧧 {userHasClaimed ? '已领取' : '领取红包'}
                  </button>
                )}
              </div>

              {/* 提示信息 */}
              {redPacketInfo && redPacketInfo.claimedCount >= contractConstants.maxRecipients && !userHasClaimed && (
                <div style={{
                  background: 'rgba(255, 71, 87, 0.2)',
                  border: '1px solid rgba(255, 71, 87, 0.4)',
                  borderRadius: '15px',
                  padding: '15px',
                  textAlign: 'center',
                  marginTop: '15px'
                }}>
                  <span style={{ fontSize: '24px', marginRight: '8px' }}>😭</span>
                  红包已被抢完！下次要快一点哦~
                </div>
              )}
            </div>

            {/* 操作说明 */}
            <div style={styles.card}>
              <h3 style={{ marginBottom: '15px', fontSize: '20px' }}>📖 使用说明</h3>
              <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
                <p style={{ marginBottom: '12px' }}>
                  🎯 <strong>合约拥有者</strong>：可以向红包合约充值，设定总金额和最大领取人数
                </p>
                <p style={{ marginBottom: '12px' }}>
                  🧧 <strong>用户</strong>：连接钱包后可以领取红包，每个地址只能领取一次
                </p>
                <p style={{ marginBottom: '12px' }}>
                  🎲 <strong>随机分配</strong>：系统会根据算法随机分配每个红包的金额
                </p>
                <p style={{ marginBottom: '12px' }}>
                  ⚡ <strong>快速切换</strong>：已授权的多个账户间可以无缝切换，无需重新授权
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                  ⚠️ 本应用仅供学习测试使用，请在测试网络环境中使用
                </p>
              </div>
            </div>
          </>
        ) : (
          <div>
            <div style={styles.card}>
              <h2 style={{ fontSize: '64px', margin: '0 0 30px 0' }}>🧧</h2>
              <h2 style={{ marginBottom: '25px', fontSize: '32px' }}>
                欢迎使用智能合约红包系统
              </h2>
              <p style={{ 
                fontSize: '20px', 
                lineHeight: '1.6', 
                marginBottom: '35px',
                opacity: 0.9
              }}>
                基于以太坊智能合约的去中心化红包系统
                <br />
                支持随机分配金额、抢红包等功能
              </p>
              <div style={{ 
                fontSize: '18px', 
                color: 'rgba(255,255,255,0.9)', 
                marginBottom: '40px',
                lineHeight: '1.8'
              }}>
                🎯 支持最多 6 个用户领取
                <br />
                💰 初始总额度 0.05 ETH
                <br />
                🎲 完全随机分配，公平公正
                <br />
                🔒 智能合约保证安全性
                <br />
                ⚡ 支持多账户快速切换，无需重新授权
              </div>
              <p style={{ fontSize: '18px', color: '#f39c12', fontWeight: 'bold' }}>
                请先连接您的 MetaMask 钱包开始使用
              </p>
            </div>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <p>🚀 Red Packet DApp - 基于区块链的智能红包系统</p>
        <p>⚠️ 仅供学习和测试使用，请在测试网络中使用</p>
        <p style={{marginTop: '10px', color: 'rgba(255, 255, 255, 0.6)'}}>
          ⚡ v2.1 - 修复账户切换授权问题，支持真正的无缝切换
        </p>
      </div>
    </div>
  );
};

export default Dapp;
