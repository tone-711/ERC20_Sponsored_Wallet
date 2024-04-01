/* eslint-disable no-else-return */
import { ethers } from 'ethers';
import { PaymasterMode } from '@biconomy/account';
import ERC20_ABI from './token_abi';

/* @ts-ignore */
const sendTokens = async (sa, t, amt, pm = true) => {
  try {
    // Your configuration with private key and Biconomy API key
    const config = {
      biconomyPaymasterApiKey: process.env.BC_API,
      bundlerUrl: process.env.BC_BUNDLER, // <-- Read about this at https://docs.biconomy.io/dashboard#bundler-url
      rpcUrl: process.env.RPC_URL,
    };

    // Generate EOA from private key using ethers.js
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);

    // Create Biconomy Smart Account instance
    /* @ts-ignore */
    const smartAccount = sa;

    /* @ts-ignore */
    const token = ethers.getAddress(process.env.SE_COIN);
    const to = ethers.getAddress(t);
    const erc20 = new ethers.Contract(token, ERC20_ABI, provider);

    const [symbol, decimals] = await Promise.all([
      erc20.symbol(),
      erc20.decimals(),
    ]);
    const amount = ethers.parseUnits(amt, decimals);

    const dt = erc20.interface.encodeFunctionData('transfer', [to, amount]);

    console.log(`Transferring ${amt} ${symbol}...`);

    const transferTx = {
      to: token,
      data: dt,
    };

    const saAddress = await smartAccount.getAccountAddress();
    console.log('SA Address', saAddress);

    if (pm) {
      // ------ 4. Send user operation and get tx hash
      const tx = await smartAccount.sendTransaction(transferTx, {
        paymasterServiceData: {
          mode: PaymasterMode.SPONSORED,
        },
      });

      const { transactionHash } = await tx.waitForTxHash();
      console.log('transactionHash', transactionHash);
      alert(`Transaction Successful: ${transactionHash}`);

      return transactionHash;
    } else {
      // ------ 4. Send user operation and get tx hash
      const tx = await smartAccount.sendTransaction(transferTx);

      const { transactionHash } = await tx.waitForTxHash();
      console.log('transactionHash', transactionHash);
      alert(`Transaction Successful: ${transactionHash}`);

      return transactionHash;
    }
  } catch (err) {
    alert(`Transaction Error: ${err}`);
  }
};

export default sendTokens;
