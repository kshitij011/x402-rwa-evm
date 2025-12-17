import express from "express";
import "dotenv/config";
import cors from "cors";
import { paymentMiddleware } from "x402-express";
import { approveKycUser } from "./blockchain/approveKYC.ts";
import { mintShares } from "./blockchain/mintShares.ts";


const app = express();

/* ✅ MUST come before routes */
app.use(express.json());

app.use(cors({
  // origin: "http://localhost:3000",
  origin: "https://x402-rwa-evm-011.vercel.app",
  credentials: true,
}));

/* ✅ KYC approve route */
app.post("/kyc/approve", async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).json({ ok: false, error: "Address required" });
  }

  try {
    const result = await approveKycUser(address);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "KYC approval failed" });
  }
});

app.use(
  paymentMiddleware(
    process.env.SELLER_WALLET! as `0x${string}`,
    {
      "POST /purchase": {
        price: "$0.1",
        network: "base-sepolia",
      },
    },
    {
      url: "https://x402.org/facilitator",
    }
  )
),

app.post("/purchase", async (req, res) => {
  const { propertyId, quantity, buyer, totalPrice } = req.body;

  const mintTxHash = await mintShares({
    receiver: buyer,
    propertyId: BigInt(propertyId),
    amount: BigInt(quantity),
    pricePaid: BigInt(Math.floor(Number(totalPrice) * 1e6)),
  });

  res.json({
    ok: true,
    mintTxHash: mintTxHash,
  });
});


app.listen(4000, () => {
  console.log("Server listening at http://localhost:4000");
});
