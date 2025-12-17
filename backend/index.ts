import 'dotenv/config';
import express, {type Request, type Response} from 'express';
import axios from 'axios';
const app = express();
app.use(express.json());

import cors from "cors";

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "X-PAYMENT", "X402-Version"],
}));


// Configuration
const FACILITATOR_URL = 'https://facilitator.cronoslabs.org/v2/x402';
const SELLER_WALLET: string = process.env.SELLER_WALLET ? process.env.SELLER_WALLET : "";
const USDX_CONTRACT = '0x149a72BCdFF5513F2866e9b6394edba2884dbA07'; // Cronos testnet - see Network Constants
const USDX_CUSTOM = "0x7cB7377CfcB4Eb649A4A84f21C9407c7a8bf5934";
const PORT = 4000;

// Protected API endpoint
app.get('/api/premium-data', async (req: Request, res: Response) => {
  const paymentHeader = req.headers['x-payment'] || req.body?.paymentHeader;

  // Step 1: Check if payment is provided
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment Required',
      x402Version: 1,
      paymentRequirements: {
        scheme: 'exact',
        network: 'cronos-testnet', // Switch to 'cronos' for Cronos mainnet
        payTo: SELLER_WALLET,
        asset: "native",
        description: 'Premium API data access',
        mimeType: 'application/json',
        maxAmountRequired: '10000000000000000', // 1 USDX (6 decimals)
        maxTimeoutSeconds: 300
      }
    });
  }

  try {
    const requestBody = {
      x402Version: 1,
      paymentHeader: paymentHeader,
      paymentRequirements: {
        scheme: 'exact',
        network: 'cronos-testnet', // Same network as in 402 response
        payTo: SELLER_WALLET,
        asset: USDX_CUSTOM,
        description: 'Premium API data access',
        mimeType: 'application/json',
        maxAmountRequired: '1000000',
        maxTimeoutSeconds: 300
      }
    };

    // Step 2: Verify payment
    const verifyRes = await axios.post(`${FACILITATOR_URL}/verify`, requestBody, {
      headers: { 'Content-Type': 'application/json', 'X402-Version': '1' }
    });

    if (!verifyRes.data.isValid) {
      return res.status(402).json({
        error: 'Invalid payment',
        reason: verifyRes.data.invalidReason
      });
    }

    // Step 3: Settle payment
    const settleRes = await axios.post(`${FACILITATOR_URL}/settle`, requestBody, {
      headers: { 'Content-Type': 'application/json', 'X402-Version': '1' }
    });

    // Step 4: Check settlement and return content
    if (settleRes.data.event === 'payment.settled') {
      return res.status(200).json({
        data: {
          premiumContent: 'This is your premium data',
        },
        payment: {
          txHash: settleRes.data.txHash,
          from: settleRes.data.from,
          to: settleRes.data.to,
          value: settleRes.data.value,
          blockNumber: settleRes.data.blockNumber,
          timestamp: settleRes.data.timestamp
        }
      });
    } else {
      return res.status(402).json({
        error: 'Payment settlement failed',

        reason: settleRes.data.error
      });
    }
  } catch (error: unknown) {

    console.log("FACILITATOR ERROR:", error.response?.data);

    if (axios.isAxiosError(error)){
      return res.status(500).json({
        error: 'Server error processing payment',
        details: error.response?.data || error.message
      });
    }

    return res.status(500).json({
      error: 'Server error processing payments',
      details: (error as Error).message || 'An unknown error occured'
    })
  }
});

app.listen(PORT, () => {
  console.log("Backend running on port ", PORT);
});