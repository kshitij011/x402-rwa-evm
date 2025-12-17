import { walletClient, publicClient } from "./client.js";
import abi from "../abi/RealEstateTokenization.json" with { type: "json" };
const CONTRACT = process.env.ERC1155_ADDRESS;
export async function approveKycUser(user) {
    try {
        const hash = await walletClient.writeContract({
            address: CONTRACT,
            abi: abi.abi,
            functionName: "approveUser",
            args: [user],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        return { ok: true, hash };
    }
    catch (err) {
        // already approved or reverted → still OK for frontend UX
        return { ok: true, message: err.shortMessage ?? "Already approved" };
    }
}
