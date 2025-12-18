import { walletClient, publicClient } from "./client.ts";
import abi from "../abi/RealEstateTokenization.json" with { type: "json" };
const CONTRACT = "0x374dd5303AeE5BC034D16509C50adc74f5768C18";
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
//# sourceMappingURL=approveKYC.js.map