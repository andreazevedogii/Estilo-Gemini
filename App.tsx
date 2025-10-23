import React, { useState } from 'react';
import Header from './components/Header';
import VirtualTryOn from './components/VirtualTryOn';
import ImageStudio from './components/ImageStudio';
import VideoLab from './components/VideoLab';
import AIAssistant from './components/AIAssistant';
import { Page } from './types';
import BuyDiamondsModal from './components/BuyDiamondsModal';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>(Page.TryOn);
  const [diamondBalance, setDiamondBalance] = useState<number>(20); // Start with 20 free diamonds
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSpendDiamonds = (cost: number) => {
    setDiamondBalance(prev => Math.max(0, prev - cost));
  };
  
  const renderPage = () => {
    const commonProps = {
        diamondBalance,
        onSpendDiamonds: handleSpendDiamonds,
        onPurchaseDiamonds: () => setIsModalOpen(true),
    };
    switch (activePage) {
      case Page.TryOn:
        return <VirtualTryOn {...commonProps} />;
      case Page.ImageStudio:
        return <ImageStudio {...commonProps} />;
      case Page.VideoLab:
        return <VideoLab {...commonProps} />;
      case Page.AIAssistant:
        return <AIAssistant />;
      default:
        return <VirtualTryOn {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-primary font-sans text-text-primary">
      <Header 
        activePage={activePage} 
        setActivePage={setActivePage} 
        diamondBalance={diamondBalance}
        onPurchaseClick={() => setIsModalOpen(true)}
      />
      <main className="p-4 sm:p-6 md:p-8">
        {renderPage()}
      </main>
      <footer className="text-center p-4 text-xs text-text-secondary">
        <p>Criado com Google Gemini. UI desenhada para exploração criativa.</p>
      </footer>
      <BuyDiamondsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default App;