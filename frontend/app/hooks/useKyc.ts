import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { baseSepolia } from "viem/chains";
import { KYCStatus } from "@/app/lib/types";

const KYC_CONTRACT = "0x374dd5303AeE5BC034D16509C50adc74f5768C18";

const KYC_ABI = [
  {
    name: "isKycVerified",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bool" }],
  },
] as const;

export function useKyc() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: baseSepolia.id });

  const [kycStatus, setKycStatus] = useState<KYCStatus>("unverified");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address || !publicClient) {
      setKycStatus("unverified");
      setLoading(false);
      return;
    }

    const checkKyc = async () => {
      try {
        const isVerified = await publicClient.readContract({
          address: KYC_CONTRACT,
          abi: KYC_ABI,
          functionName: "isKycVerified",
          args: [address],
        });

        setKycStatus(isVerified ? "verified" : "unverified");

      } catch (err) {
        console.error("KYC check failed:", err);
        setKycStatus("unverified");
      } finally {
        setLoading(false);
      }
    };

    checkKyc();
  }, [address, publicClient]);

  const updateKycStatus = (newStatus: KYCStatus) => {
    setKycStatus(newStatus);
    localStorage.setItem("kycStatus", newStatus);
  };

  return {
    kycStatus,
    updateKycStatus,
    isVerified: kycStatus === "verified",
    loading,
  };
}