import { createWalletClient, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import abi from "../abi/RealEstateTokenization.json" with { type: "json" };
const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.RPC_URL),
});
const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.RPC_URL),
});
export async function mintShares({ receiver, propertyId, amount, pricePaid, }) {
    const hash = await walletClient.writeContract({
        address: process.env.ERC1155_ADDRESS,
        abi: abi.abi,
        functionName: "buyShares",
        args: [propertyId, receiver, amount, pricePaid],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
}
//# sourceMappingURL=mintShares.js.map