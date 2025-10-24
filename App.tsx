import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VirtualTryOn from './components/VirtualTryOn';
import BuyDiamondsModal from './components/BuyDiamondsModal';
import axios from 'axios';

const App: React.FC = () => {
  const [diamondBalance, setDiamondBalance] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Simulating a logged-in user. In a real app, this would come from an auth context.
  const [currentUserId] = useState('user_123');

  // Fetch initial and updated balance from the server
  const fetchUserBalance = async () => {
    try {
      const response = await axios.get(`/api/users/${currentUserId}`);
      setDiamondBalance(response.data.diamonds);
    } catch (error) {
      console.error("Failed to fetch user balance:", error);
      // Fallback for when server is not running
      setDiamondBalance(20);
    }
  };

  useEffect(() => {
    fetchUserBalance();
    // Poll for updates every 10 seconds to reflect admin approvals
    const interval = setInterval(fetchUserBalance, 10000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const handleSpendDiamonds = (cost: number) => {
    // This is now an optimistic update. The server is the source of truth.
    setDiamondBalance(prev => Math.max(0, prev - cost));
  };

  const handlePurchaseComplete = () => {
    // No longer adds diamonds directly.
    // The modal now shows a "pending" message.
    // We can refetch the balance or just rely on the polling.
    setIsModalOpen(false);
  };
  
  const commonProps = {
      diamondBalance,
      onSpendDiamonds: handleSpendDiamonds,
      onPurchaseDiamonds: () => setIsModalOpen(true),
  };

  return (
    <div className="min-h-screen bg-primary font-sans text-text-primary">
      <Header 
        diamondBalance={diamondBalance}
        onPurchaseClick={() => setIsModalOpen(true)}
      />
      <main className="p-4 sm:p-6 md:p-8">
        <VirtualTryOn {...commonProps} />
      </main>
      <footer className="text-center p-4 text-xs text-text-secondary">
        <p>Criado com Google Gemini. UI desenhada para exploração criativa.</p>
      </footer>
      <BuyDiamondsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPurchaseComplete={handlePurchaseComplete}
        userId={currentUserId}
      />
    </div>
  );
};

export default App;