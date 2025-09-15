import { BrowserProvider } from 'ethers';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TEXT } from '../config/text';

export const useWallet = () => {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [authorizedAccounts, setAuthorizedAccounts] = useState<string[]>([]);

    // 使用 ref 来防止重复切换
    const switchingRef = useRef(false);
    const lastSwitchTimeRef = useRef(0);

    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            alert(TEXT.INSTALL_METAMASK);
            return;
        }

        setIsConnecting(true);
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });
            console.log('🔗 请求连接账户:', accounts);

            if (accounts.length > 0) {
                const browserProvider = new BrowserProvider(window.ethereum);

                setProvider(browserProvider);
                setAccount(accounts[0]); // Set the first account as the selected account
                setAuthorizedAccounts(accounts); // 记录已授权的账户
                console.log(TEXT.WALLET_CONNECTED, accounts[0]);
            }
        } catch (error: any) {
            console.error('Connect wallet failed:', error);
            if (error.code === 4001) {
                alert(TEXT.USER_REJECTED);
            } else {
                alert(TEXT.CONNECT_FAILED);
            }
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnectWallet = useCallback(async () => {
        setIsDisconnecting(true);

        try {
            // 方法1: 尝试撤销权限（如果支持的话）
            if (window.ethereum && window.ethereum.request) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_revokePermissions',
                        params: [{ eth_accounts: {} }],
                    });
                } catch (revokeError) {
                    // 如果不支持撤销权限，继续执行其他清理操作
                    console.log('Revoke permissions not supported:', revokeError);
                }
            }

            // 方法2: 清理本地状态
            setAccount(null);
            setProvider(null);
            setAuthorizedAccounts([]);

            // 方法3: 清理本地存储（如果有的话）
            if (typeof Storage !== 'undefined') {
                localStorage.removeItem('walletconnect');
                localStorage.removeItem('WALLETCONNECT_DEEPLINK_CHOICE');
                // 清理可能的其他钱包相关存储
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (
                        key &&
                        (key.includes('wallet') ||
                            key.includes('metamask') ||
                            key.includes('ethereum'))
                    ) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
            }

            console.log(TEXT.WALLET_DISCONNECTED);
        } catch (error) {
            console.error('Disconnect wallet error:', error);
            // 即使出错，也要清理本地状态
            setAccount(null);
            setProvider(null);
            setAuthorizedAccounts([]);
        } finally {
            setIsDisconnecting(false);
        }
    }, []);

    const checkConnection = useCallback(async () => {
        if (window.ethereum) {
            try {
                // 使用 eth_accounts 而不是 eth_requestAccounts，避免触发弹窗
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts',
                });

                if (accounts.length > 0) {
                    const browserProvider = new BrowserProvider(window.ethereum);
                    setProvider(browserProvider);

                    // 如果当前没有账户或者当前账户不在授权列表中，设置第一个账户
                    if (!account || !accounts.includes(account)) {
                        setAccount(accounts[0]);
                    }

                    setAuthorizedAccounts(accounts); // 记录已授权的账户
                } else {
                    // 如果没有账户，确保清理状态
                    setAccount(null);
                    setProvider(null);
                    setAuthorizedAccounts([]);
                }
            } catch (error) {
                console.error('Check connection failed:', error);
                // 检查连接失败时也清理状态
                setAccount(null);
                setProvider(null);
                setAuthorizedAccounts([]);
            }
        }
    }, [account]);

    // 优化的纯应用层账户切换（完全避免 MetaMask API 调用）
    const switchToAccount = useCallback(
        (newAccount: string) => {
            console.log('尝试切换账户:', newAccount);
            console.log('已授权账户:', authorizedAccounts);
            console.log('当前账户:', account);

            // 防止重复快速切换
            const now = Date.now();
            if (switchingRef.current || now - lastSwitchTimeRef.current < 100) {
                console.log('切换操作过于频繁，忽略');
                return false;
            }

            // 检查新账户是否在已授权的账户列表中
            const isAuthorized = authorizedAccounts.some(
                addr => addr.toLowerCase() === newAccount.toLowerCase(),
            );

            if (!isAuthorized) {
                console.warn('尝试切换到未授权的账户:', newAccount);
                console.warn('已授权账户列表:', authorizedAccounts);
                return false;
            }

            // 如果是同一个账户，不需要切换
            if (account?.toLowerCase() === newAccount.toLowerCase()) {
                console.log('账户相同，无需切换');
                return true;
            }

            switchingRef.current = true;
            lastSwitchTimeRef.current = now;

            try {
                // 只更新应用层状态，完全不调用任何 MetaMask API
                setAccount(newAccount);

                // 重用现有的 provider 实例，避免重新创建
                if (provider) {
                    // provider 对象可以复用，因为它连接的是同一个 MetaMask 实例
                    console.log('复用现有 provider 实例');
                } else if (window.ethereum) {
                    // 只有在没有 provider 时才创建新的
                    const newProvider = new BrowserProvider(window.ethereum);
                    setProvider(newProvider);
                    console.log('创建新的 provider 实例');
                }

                console.log('✅ 账户切换成功 (纯应用层):', newAccount);
                return true;
            } catch (error) {
                console.error('账户切换失败:', error);
                return false;
            } finally {
                // 使用 setTimeout 确保状态更新完成后再重置标志
                setTimeout(() => {
                    switchingRef.current = false;
                }, 200);
            }
        },
        [authorizedAccounts, account, provider],
    );

    // 强制断开连接（清理所有状态）
    const forceDisconnect = useCallback(() => {
        setAccount(null);
        setProvider(null);
        setIsConnecting(false);
        setIsDisconnecting(false);
        setAuthorizedAccounts([]);
        switchingRef.current = false;
        lastSwitchTimeRef.current = 0;

        // 清理本地存储
        if (typeof Storage !== 'undefined') {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (
                    key &&
                    (key.includes('wallet') || key.includes('metamask') || key.includes('ethereum'))
                ) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }

        console.log('强制断开连接完成');
    }, []);

    // 检查账户是否已授权
    const isAccountAuthorized = useCallback(
        (address: string) => {
            return authorizedAccounts.some(addr => addr.toLowerCase() === address.toLowerCase());
        },
        [authorizedAccounts],
    );

    // 获取已授权账户列表
    const getAuthorizedAccounts = useCallback(() => {
        return authorizedAccounts;
    }, [authorizedAccounts]);

    useEffect(() => {
        checkConnection();

        if (window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                console.log('🔄 MetaMask 账户变化事件:', accounts);

                // 防止在切换过程中触发事件处理
                if (switchingRef.current) {
                    console.log('正在切换账户，忽略 MetaMask 事件');
                    return;
                }

                // 更新授权账户列表
                setAuthorizedAccounts(accounts);

                if (accounts.length === 0) {
                    // 如果没有账户了，执行断开连接
                    console.log('所有账户都被撤销，执行断开连接');
                    setAccount(null);
                    setProvider(null);
                } else {
                    // 检查当前账户是否还在授权列表中
                    const currentAccountStillAuthorized =
                        account &&
                        accounts.some(addr => addr.toLowerCase() === account.toLowerCase());

                    if (!currentAccountStillAuthorized) {
                        // 当前账户不再可用，切换到第一个可用账户
                        console.log('当前账户不再可用，自动切换到:', accounts[0]);
                        setAccount(accounts[0]);
                    } else if (!account && accounts.length > 0) {
                        // 如果当前没有选中账户，设置为第一个
                        console.log('设置默认账户:', accounts[0]);
                        setAccount(accounts[0]);
                    }

                    // 确保 provider 是最新的
                    if (window.ethereum && !provider) {
                        const newProvider = new BrowserProvider(window.ethereum);
                        setProvider(newProvider);
                    }
                }
            };

            const handleChainChanged = (chainId: string) => {
                console.log('🔗 链变化:', chainId);
                // 链变化时重新检查连接，但不影响账户切换状态
                if (!switchingRef.current) {
                    checkConnection();
                }
            };

            const handleDisconnect = (error: any) => {
                console.log('🔌 MetaMask 断开连接事件:', error);
                if (!switchingRef.current) {
                    setAccount(null);
                    setProvider(null);
                    setAuthorizedAccounts([]);
                }
            };

            // 添加事件监听器
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            window.ethereum.on('disconnect', handleDisconnect);

            return () => {
                if (window.ethereum && window.ethereum.removeListener) {
                    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                    window.ethereum.removeListener('chainChanged', handleChainChanged);
                    window.ethereum.removeListener('disconnect', handleDisconnect);
                }
            };
        }
    }, [checkConnection, account, provider]);

    return {
        account,
        provider,
        isConnecting,
        isDisconnecting,
        authorizedAccounts,
        connectWallet,
        disconnectWallet,
        forceDisconnect,
        checkConnection,
        setAccount: switchToAccount, // 使用优化的纯应用层切换方法
        isAccountAuthorized,
        getAuthorizedAccounts,
    };
};
