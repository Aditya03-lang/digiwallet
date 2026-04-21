import { createContext, useContext, useState, useCallback } from 'react';

const API_URL = `${import.meta.env.VITE_API_URL ?? ''}/api/wallets`;
const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const request = async (url, method = 'GET', body = null) => {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'An unexpected error occurred');
    return data;
  };

  const loadTransactions = useCallback(async (walletId) => {
    try {
      // Backend already returns newest-first (ORDER BY createdAt DESC)
      const txs = await request(`${API_URL}/${walletId}/transactions`);
      setTransactions(txs);
    } catch (err) {
      // Silently handled — wallet load already shows errors
    }
  }, []);

  const createWallet = async (ownerName) => {
    setLoading(true);
    try {
      const res = await request(API_URL, 'POST', { ownerName });
      setWallet(res);
      showToast(`Wallet created! Your ID is #${res.walletId}`, 'success');
      await loadTransactions(res.walletId);
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async (walletId) => {
    setLoading(true);
    try {
      const res = await request(`${API_URL}/${walletId}`);
      setWallet(res);
      showToast(`Wallet #${walletId} loaded successfully!`, 'success');
      await loadTransactions(walletId);
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addMoney = async (amount, note) => {
    if (!wallet) return false;
    setLoading(true);
    try {
      const res = await request(`${API_URL}/${wallet.walletId}/add-money`, 'POST', { amount, note });
      setWallet(res);
      showToast(`$${Number(amount).toFixed(2)} added to your wallet!`, 'success');
      await loadTransactions(wallet.walletId);
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const pay = async (toWalletId, amount, note) => {
    if (!wallet) return false;
    setLoading(true);
    try {
      await request(`${API_URL}/pay`, 'POST', {
        fromWalletId: wallet.walletId,
        toWalletId,
        amount,
        note,
      });
      showToast(`$${Number(amount).toFixed(2)} sent to wallet #${toWalletId}!`, 'success');
      // Refresh wallet balance and transactions
      const updatedWallet = await request(`${API_URL}/${wallet.walletId}`);
      setWallet(updatedWallet);
      await loadTransactions(wallet.walletId);
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        transactions,
        toasts,
        loading,
        loadTransactions,
        createWallet,
        loadWallet,
        addMoney,
        pay,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
