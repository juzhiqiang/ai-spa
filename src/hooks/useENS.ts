// src/hooks/useENS.ts
import { useState, useEffect } from "react";
import { BrowserProvider, ethers } from "ethers";

interface ENSData {
  name: string | null;
  avatar: string | null;
  isLoading: boolean;
  error: string | null;
}

const useENS = (address: string | null): ENSData => {
  const [ensData, setEnsData] = useState<ENSData>({
    name: null,
    avatar: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!address || !ethers.isAddress(address)) {
      setEnsData({
        name: null,
        avatar: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    const fetchENSData = async () => {
      const provider = new BrowserProvider(window.ethereum as any);

      setEnsData((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // 获取 ENS 名称
        const ensName = await provider.lookupAddress(address);
        let avatar = "";
        if (ensName) {
          const resolver = await provider.getResolver(ensName);
          avatar = await resolver?.getText("avatar") || '';
          console.log("ENS 名:", ensName, "头像:", avatar);
        }

        setEnsData({
          name: ensName,
          avatar,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Failed to fetch ENS data:", error);
        setEnsData({
          name: null,
          avatar: null,
          isLoading: false,
          error: "Failed to fetch ENS data",
        });
      }
    };

    fetchENSData();
  }, [address]);

  return ensData;
};

export default useENS;
