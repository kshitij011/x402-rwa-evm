import "dotenv/config";
import { createWalletClient, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
const pk = process.env.DEPLOYER_PRIVATE_KEY;
if (!pk || !pk.startsWith("0x") || pk.length !== 66) {
    throw new Error("Invalid DEPLOYER_PRIVATE_KEY in .env");
}
const account = privateKeyToAccount(pk);
export const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
});
export const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
});
//# sourceMappingURL=client.js.map