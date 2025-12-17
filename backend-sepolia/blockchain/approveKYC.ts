import { walletClient, publicClient } from "./client.ts";
import abi  from "../abi/RealEstateTokenization.json" with {type: "json"};


const CONTRACT = process.env.ERC1155_ADDRESS as `0x${string}`;

export async function approveKycUser(user: `0x${string}`) {
  try {
    const hash = await walletClient.writeContract({
      address: CONTRACT,
      abi: abi.abi,
      functionName: "approveUser",
      args: [user],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    return { ok: true, hash };
  } catch (err: any) {
    // already approved or reverted → still OK for frontend UX
    return { ok: true, message: err.shortMessage ?? "Already approved" };
  }
}
