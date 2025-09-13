import React, { useState, useEffect, useCallback } from 'react';
import { TEXT } from '../config/text';
import useENS from '../hooks/useENS';
import { generateGradientAvatar, formatAddress } from '../utils/avatarGenerator';
import './WalletConnection.css';

interface WalletConnectionProps {
  account: string | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onAccountChange?: (account: string) => boolean;
  isDisconnecting?: boolean;
}

// 独立的账户项组件，支持 ENS
interface AccountItemProps {
  address: string;
  onClick: () => void;
  isLast: boolean;
  isSwitching: boolean;
  onAvatarError: () => void;
  hasAvatarError: boolean;
}

const AccountItem: React.FC<AccountItemProps> = ({
  address,
  onClick,
  isLast,
  isSwitching,
  onAvatarError,
  hasAvatarError
}) => {
  const { name: ensName, avatar: ensAvatar, isLoading: ensLoading } = useENS(address);
  const renderAccountAvatar = () => {
    if (ensLoading) {
      return (
        <div 
          style={{ 
            width: 32, 
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      );
    }

    if (ensAvatar && !hasAvatarError) {
      return (
        <img
          src={ensAvatar}
          alt={ensName || 'ENS Avatar'}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
          onError={onAvatarError}
        />
      );
    }

    return (
      <img
        src={generateGradientAvatar(address)}
        alt="Generated Avatar"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}
      />
    );
  };

  const getAccountDisplayName = () => {
    if (ensLoading) {
      return (
        <div 
          style={{
            width: '60px',
            height: '14px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
            backgroundSize: '200% 100%',
            borderRadius: '4px',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      );
    }

    return (
      <span style={{
        color: ensName ? '#00d4ff' : 'white',
        fontSize: '14px',
        fontWeight: ensName ? '600' : 'normal'
      }}>
        {ensName || formatAddress(address)}
      </span>
    );
  };

  return (
    <div
      className="account-item"
      onClick={onClick}
      style={{
        borderBottom: isLast ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        position: 'relative',
        cursor: isSwitching ? 'not-allowed' : 'pointer',
        opacity: isSwitching ? 0.6 : 1,
        pointerEvents: isSwitching ? 'none' : 'auto'
      }}
    >
      {renderAccountAvatar()}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {getAccountDisplayName()}
        {ensName && (
          <span style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '12px',
            fontFamily: 'Courier New, monospace'
          }}>
            {formatAddress(address)}
          </span>
        )}
      </div>
      <div style={{
        color: 'rgba(46, 213, 115, 0.8)',
        fontSize: '14px',
        marginLeft: '8px',
        fontWeight: 'bold'
      }}>
        ⚡
      </div>
    </div>
  );
};

const WalletConnection: React.FC<WalletConnectionProps> = ({
  account,
  isConnecting,
  onConnect,
  onDisconnect,
  onAccountChange,
  isDisconnecting = false
}) => {
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState<string[]>([]);
  const [isSwitching, setIsSwitching] = useState(false);
  const [avatarErrors, setAvatarErrors] = useState<Set<string>>(new Set());
  
  // 为主账户使用 ENS
  const { name: mainEnsName, avatar: mainEnsAvatar, isLoading: mainEnsLoading } = useENS(account);
  const fetchAvailableAccounts = useCallback(async () => {
    if (!window.ethereum) return;
    
    try {
      const accounts: string[] = await window.ethereum.request({
        method: 'eth_accounts'
      });
      setAvailableAccounts(accounts);
      
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAvailableAccounts([]);
    }
  }, []);

  const switchAccount = useCallback((selectedAccount: string) => {
    if (selectedAccount === account || isSwitching) {
      setShowWalletMenu(false);
      return;
    }

    console.log('🔄 开始切换账户:', selectedAccount);
    
    setIsSwitching(true);
    
    try {
      setShowWalletMenu(false);
      
      const isAuthorized = availableAccounts.some(
        addr => addr.toLowerCase() === selectedAccount.toLowerCase()
      );
      
      if (!isAuthorized) {
        console.warn('⚠️ 尝试切换到未授权的账户:', selectedAccount);
        return;
      }

      if (onAccountChange) {
        try {
          const result = onAccountChange(selectedAccount);
          if (result === false) {
            console.warn('父组件拒绝了账户切换');
            return;
          }
        } catch (error) {
          console.error('账户切换回调执行失败:', error);
          return;
        }
      }
      
      console.log('✅ 账户切换完成:', selectedAccount);
      
    } catch (error) {
      console.error('❌ 账户切换失败:', error);
    } finally {
      setTimeout(() => {
        setIsSwitching(false);
      }, 300);
    }
  }, [account, isSwitching, availableAccounts, onAccountChange]);

  useEffect(() => {
    if (account) {
      fetchAvailableAccounts();
    } else {
      setAvailableAccounts([]);
    }
  }, [account, fetchAvailableAccounts]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showWalletMenu && !target.closest('.wallet-menu-container')) {
        setShowWalletMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showWalletMenu]);

  // 处理头像错误
  const handleAvatarError = (address: string) => {
    setAvatarErrors(prev => new Set(prev).add(address));
  };

  // 渲染头像 - 集成 ENS 支持
  const renderAvatar = (address: string, size: number = 32, ensData?: { name: string | null; avatar: string | null; isLoading: boolean }) => {
    if (isSwitching && address === account) {
      return (
        <div className="loading-avatar" style={{ width: size, height: size }}>
          <div className="loading-spinner" />
        </div>
      );
    }
    // 如果有 ENS 数据且正在加载
    if (ensData?.isLoading) {
      return (
        <div 
          className="avatar-skeleton" 
          style={{ 
            width: size, 
            height: size,
            borderRadius: '50%',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      );
    }

    // 如果有 ENS 头像且没有错误
    if (ensData?.avatar && !avatarErrors.has(address)) {
      return (
        <img
          src={ensData.avatar}
          alt={ensData.name || 'ENS Avatar'}
          className="ens-avatar"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
          onError={() => handleAvatarError(address)}
        />
      );
    }

    // 使用生成的渐变头像
    return (
      <img
        src={generateGradientAvatar(address)}
        alt="Generated Avatar"
        className="generated-avatar"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
      />
    );
  };

  // 获取显示名称 - 集成 ENS 支持
  const getDisplayName = (address: string, ensData?: { name: string | null; isLoading: boolean }) => {
    if (ensData?.isLoading) {
      return (
        <div 
          style={{
            width: '80px',
            height: '14px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
            backgroundSize: '200% 100%',
            borderRadius: '4px',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      );
    }

    const displayName = ensData?.name || formatAddress(address);
    const isENS = Boolean(ensData?.name);

    return (
      <span 
        style={{ 
          color: isENS ? '#00d4ff' : 'white',
          fontWeight: isENS ? '600' : '500',
          fontSize: '14px'
        }}
        title={address}
      >
        {displayName}
      </span>
    );
  };

  const handleDisconnect = async () => {
    setShowWalletMenu(false);
    await onDisconnect();
  };

  return (
    <div className="wallet-connection-container" style={{
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '20px',
      gap: '10px',
      position: 'relative'
    }}>
      {account ? (
        <div className="wallet-menu-container" style={{ position: 'relative' }}>
          <div
            className="wallet-menu-hover"
            onClick={() => !isDisconnecting && !isSwitching && setShowWalletMenu(!showWalletMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '8px 16px',
              borderRadius: '25px',
              cursor: (isDisconnecting || isSwitching) ? 'not-allowed' : 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              opacity: (isDisconnecting || isSwitching) ? 0.7 : 1,
              pointerEvents: (isDisconnecting || isSwitching) ? 'none' : 'auto'
            }}
          >
            <div style={{ width: '32px', height: '32px', position: 'relative' }}>
              {renderAvatar(account, 32, { name: mainEnsName, avatar: mainEnsAvatar, isLoading: mainEnsLoading })}
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}>
              {getDisplayName(account, { name: mainEnsName, isLoading: mainEnsLoading })}
            </div>

            {isDisconnecting ? (
              <div style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div className="loading-spinner" style={{
                  width: '12px',
                  height: '12px'
                }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                  断开中...
                </span>
              </div>
            ) : isSwitching ? (
              <div style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div className="loading-spinner" style={{
                  width: '12px',
                  height: '12px'
                }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                  切换中...
                </span>
              </div>
            ) : (
              <>
                {availableAccounts.length > 1 && (
                  <div style={{
                    marginLeft: '4px',
                    background: 'rgba(46, 213, 115, 0.8)',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}>
                    {availableAccounts.length}
                  </div>
                )}
                <div style={{
                  marginLeft: '8px',
                  transform: showWalletMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '12px'
                }}>
                  ▼
                </div>
              </>
            )}
          </div>

          {showWalletMenu && !isDisconnecting && !isSwitching && (
            <div className="wallet-dropdown">
              <div style={{
                padding: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  {renderAvatar(account, 40, { name: mainEnsName, avatar: mainEnsAvatar, isLoading: mainEnsLoading })}
                  <div>
                    <div style={{
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}>
                      {getDisplayName(account, { name: mainEnsName, isLoading: mainEnsLoading })}
                    </div>
                    {mainEnsName && (
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '12px',
                        fontFamily: 'Courier New, monospace'
                      }}>
                        {formatAddress(account)}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '12px'
                }}>
                  🟢 当前账户{mainEnsName ? ' (ENS)' : ''}
                </div>
              </div>

              {availableAccounts.length > 1 && (
                <div>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>⚡ 快速切换</span>
                    <span style={{ 
                      background: 'rgba(46, 213, 115, 0.8)',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}>
                      无需确认
                    </span>
                  </div>
                  {availableAccounts
                    .filter(acc => acc.toLowerCase() !== account?.toLowerCase())
                    .slice(0, 4)
                    .map((acc, index, filteredArray) => (
                      <AccountItem
                        key={acc}
                        address={acc}
                        onClick={() => !isSwitching && switchAccount(acc)}
                        isLast={index === filteredArray.length - 1}
                        isSwitching={isSwitching}
                        onAvatarError={() => handleAvatarError(acc)}
                        hasAvatarError={avatarErrors.has(acc)}
                      />
                    ))}
                </div>
              )}

              <div style={{
                padding: '8px 16px',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <span>💡</span>
                <span>已授权账户间可以直接切换，完全无需 MetaMask 确认</span>
              </div>

              <div
                className="disconnect-hover"
                onClick={handleDisconnect}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  color: '#ff4757',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <span>🔌</span>
                {TEXT?.DISCONNECT || '断开连接'}
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          className="connect-button"
          onClick={onConnect}
          disabled={isConnecting}
          style={{
            background: isConnecting 
              ? 'rgba(46, 213, 115, 0.6)' 
              : 'linear-gradient(135deg, #2ed573, #26d46c)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '25px',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(46, 213, 115, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isConnecting && (
            <div className="loading-spinner" style={{
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white'
            }} />
          )}
          {isConnecting ? (TEXT?.CONNECTING || '连接中...') : (TEXT?.CONNECT_WALLET || '连接 MetaMask')}
        </button>
      )}
    </div>
  );
};

export default WalletConnection;