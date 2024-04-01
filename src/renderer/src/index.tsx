import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { ethers, Wallet } from 'ethers';
import { useEffect, useState } from 'react';
import Home from './screens/Home';

export default function App() {
  const [wallet, setWallet] = useState<Wallet>();

  useEffect(() => {
    if (!window.localStorage.getItem('privateKey')) {
      const signer = ethers.Wallet.createRandom();

      if (!wallet) setWallet(signer);

      window.localStorage.setItem('privateKey', signer.privateKey);

      console.log('address:', signer.address);
      console.log('mnemonic:', signer.mnemonic.phrase);
      console.log('privateKey:', signer.privateKey);
    } else {
      const signer = new ethers.Wallet(
        window.localStorage.getItem('privateKey') ?? '',
      );

      if (!wallet) setWallet(signer);

      console.log('existing address:', signer.address);
      console.log('existing privateKey:', signer.privateKey);
    }
  }, [wallet]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home wallet={wallet} />} />
      </Routes>
    </Router>
  );
}
