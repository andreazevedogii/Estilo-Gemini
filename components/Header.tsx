import React from 'react';
import { Page } from '../types';
import { MagicWandIcon, DiamondIcon } from './icons';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  diamondBalance: number;
  onPurchaseClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, diamondBalance, onPurchaseClick }) => {
  const pages = Object.values(Page);

  return (
    <header className="bg-primary/80 backdrop-blur-sm sticky top-0 z-10 shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <MagicWandIcon className="h-8 w-8 text-accent" />
            <h1 className="ml-3 text-2xl font-bold text-text-primary tracking-wider">Estilo Gemini</h1>
          </div>
          <div className="hidden md:flex items-center space-x-4">
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                    activePage === page
                      ? 'bg-accent text-white shadow-lg'
                      : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
                  }`}
                >
                  {page}
                </button>
              ))}
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-300">
                <div className="flex items-center">
                    <DiamondIcon className="w-5 h-5 text-accent"/>
                    <span className="ml-2 font-semibold text-text-primary">{diamondBalance}</span>
                </div>
                <button onClick={onPurchaseClick} className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors">
                    Comprar Diamantes
                </button>
              </div>
          </div>
           <div className="md:hidden flex items-center">
                <div className="flex items-center mr-4">
                    <DiamondIcon className="w-5 h-5 text-accent"/>
                    <span className="ml-1 font-semibold text-sm text-text-primary">{diamondBalance}</span>
                </div>
                <button onClick={onPurchaseClick} className="bg-accent text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-accent-hover transition-colors">
                    Comprar
                </button>
           </div>
        </div>
         <div className="md:hidden border-t border-gray-200">
            <div className="flex items-center justify-around py-2">
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors duration-300 ${
                    activePage === page
                      ? 'bg-accent text-white shadow-lg'
                      : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
      </nav>
    </header>
  );
};

export default Header;
