import { ethers } from 'ethers';
import { createSmartAccountClient } from '@biconomy/account';

/* @ts-ignore */
const makeSmartAccount = async (pk) => {
  // Your configuration with private key and Biconomy API key
  const config = {
    privateKey: pk,
    biconomyPaymasterApiKey: process.env.BC_API,
    bundlerUrl: process.env.BC_BUNDLER, // <-- Read about this at https://docs.biconomy.io/dashboard#bundler-url
    rpcUrl: process.env.RPC_URL,
  };

  // Generate EOA from private key using ethers.js
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const sgn = new ethers.Wallet(config.privateKey, provider);

  // Create Biconomy Smart Account instance
  /* @ts-ignore */
  const smartAccount = await createSmartAccountClient({
    signer: sgn,
    biconomyPaymasterApiKey: config.biconomyPaymasterApiKey,
    bundlerUrl: config.bundlerUrl,
  });

  const saAddress = await smartAccount.getAccountAddress();
  console.log('SA Address', saAddress);
  return smartAccount;
};

export default makeSmartAccount;
