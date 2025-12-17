// app/hooks/usePaywallAccess.ts
"use client";

import axios from "axios";
import { withPaymentInterceptor } from "x402-axios";
import { useWalletClient } from "wagmi";
import { createWalletClient, custom } from "viem";

export function usePaywallAccess() {
  const { data: walletClient } = useWalletClient();

  // const evmClient = walletClient
  //   ? createWalletClient({
  //       account: walletClient.account,
  //       chain: walletClient.chain,
  //       transport: custom(walletClient.transport)
  //     })
  //   : null;

  const api = walletClient
    ? withPaymentInterceptor(
        axios.create({
          baseURL: "http://localhost:4000",
        }),
        walletClient
      )
    : null;

  const requestPremiumData = async () => {
    if (!api) throw new Error("Wallet not connected");

    await walletClient?.switchChain({ id: 84532 });

    try {
      const res = await api.get("/payment");
      return res.data;

    } catch (err: any) {
      console.error(err?.response?.data || err);
      throw err;
    }
  };

  return { requestPremiumData };
}
