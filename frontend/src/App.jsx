import { WalletProvider } from './context/WalletContext';
import AppLayout from './AppLayout';
import './App.css';

function App() {
  return (
    <WalletProvider>
      <AppLayout />
    </WalletProvider>
  );
}

export default App;
