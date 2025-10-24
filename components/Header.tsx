import React from 'react';
import { MagicWandIcon, DiamondIcon } from './icons';
import { useAuth } from './AuthContext';

interface HeaderProps {
  diamondBalance: number;
  onPurchaseClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ diamondBalance, onPurchaseClick }) => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-primary/80 backdrop-blur-sm sticky top-0 z-10 shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <MagicWandIcon className="h-8 w-8 text-accent" />
            <h1 className="ml-3 text-2xl font-bold text-text-primary tracking-wider">Estilo Gemini</h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {currentUser ? (
              <>
                <div className="flex items-center">
                    <DiamondIcon className="w-5 h-5 text-accent"/>
                    <span className="ml-1 sm:ml-2 font-semibold text-text-primary">{diamondBalance}</span>
                </div>
                <button 
                  onClick={onPurchaseClick} 
                  className="bg-accent text-white px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-bold hover:bg-accent-hover transition-colors"
                >
                    Comprar Diamantes
                </button>
                 <button 
                  onClick={logout} 
                  className="bg-gray-200 text-text-secondary px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-bold hover:bg-gray-300 transition-colors"
                >
                    Sair
                </button>
              </>
            ) : (
               <button 
                  onClick={onPurchaseClick} 
                  className="bg-accent text-white px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-bold hover:bg-accent-hover transition-colors"
                >
                    Comprar Diamantes / Login
                </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;