import React, { useState } from 'react';
import { DiamondIcon, LoaderIcon } from './icons';

interface BuyDiamondsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const packages = [
    { diamonds: 100, price: 5.00, id: 'pkg_100', title: '100 Diamantes' },
    { diamonds: 500, price: 20.00, id: 'pkg_500', title: '500 Diamantes' },
    { diamonds: 1000, price: 35.00, id: 'pkg_1000', title: '1000 Diamantes' },
    { diamonds: 2500, price: 75.00, id: 'pkg_2500', title: '2500 Diamantes' },
];

interface PixData {
    qrCode: string;
    copyPaste: string;
}

const BuyDiamondsModal: React.FC<BuyDiamondsModalProps> = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pixData, setPixData] = useState<PixData | null>(null);
    const [copied, setCopied] = useState(false);

    const handleClose = () => {
        if (isLoading) return;
        onClose();
        // Reset state on close
        setTimeout(() => {
            setError(null);
            setPixData(null);
        }, 300);
    };

    const handleSelectPackage = async (pkg: typeof packages[0]) => {
        setIsLoading(true);
        setError(null);
        setPixData(null);

        try {
            const response = await fetch('http://localhost:3001/api/abacatepay/create-payment-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: pkg.id,
                    title: pkg.title,
                    unit_price: pkg.price,
                    userId: 'user_123', // Hardcoded for demonstration. In a real app, this would be the logged-in user's ID.
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Falha ao gerar o PIX. Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.pixQrCodeBase64 && data.pixCopyPaste) {
                // Received PIX data, show it.
                setPixData({ qrCode: data.pixQrCodeBase64, copyPaste: data.pixCopyPaste });
            } else {
                throw new Error('Dados PIX não recebidos do servidor.');
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Ocorreu um erro inesperado. Verifique se o backend está rodando.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const renderPixDisplay = () => {
        if (!pixData) return null;
        return (
            <div className="text-center">
                <h3 className="text-lg font-semibold text-text-primary mb-2">Pague com PIX</h3>
                <p className="text-sm text-text-secondary mb-4">Aponte a câmera do seu celular para o QR Code ou use o "Copia e Cola".</p>
                <img 
                    src={`data:image/png;base64,${pixData.qrCode}`} 
                    alt="PIX QR Code" 
                    className="mx-auto w-48 h-48 rounded-lg bg-white p-2 shadow-md"
                />
                <div className="mt-4">
                    <label className="text-xs text-text-secondary">PIX Copia e Cola:</label>
                    <div className="flex items-center mt-1">
                        <input 
                            type="text" 
                            readOnly 
                            value={pixData.copyPaste} 
                            className="w-full bg-secondary p-2 rounded-l-md text-xs text-text-primary truncate"
                        />
                        <button 
                            onClick={() => copyToClipboard(pixData.copyPaste)}
                            className="bg-accent text-white px-3 py-2 rounded-r-md text-xs font-bold hover:bg-accent-hover w-20"
                        >
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                </div>
                 <p className="text-xs text-text-secondary mt-6">Após o pagamento, seus diamantes serão creditados automaticamente. Você pode fechar esta janela.</p>
            </div>
        );
    };

    const renderPackageSelection = () => (
        <div className="space-y-4">
            {packages.map((pkg) => (
                <button
                    key={pkg.id}
                    onClick={() => handleSelectPackage(pkg)}
                    className="w-full flex justify-between items-center p-4 bg-secondary hover:bg-accent hover:text-white rounded-xl transition-all duration-200 group"
                >
                    <div className="flex items-center">
                        <DiamondIcon className="w-6 h-6 text-accent group-hover:text-white" />
                        <span className="ml-3 font-semibold">{pkg.diamonds} Diamantes</span>
                    </div>
                    <span className="font-bold bg-accent text-white px-4 py-1 rounded-full">
                        R$ {pkg.price.toFixed(2).replace('.', ',')}
                    </span>
                </button>
            ))}
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-primary rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-100 relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">
                        {pixData ? 'Pagamento PIX' : 'Comprar Diamantes'}
                    </h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-text-primary text-3xl disabled:opacity-50" disabled={isLoading}>&times;</button>
                </div>
                
                {isLoading ? (
                    <div className="min-h-[200px] flex flex-col justify-center items-center">
                        <LoaderIcon className="w-12 h-12 animate-spin text-accent" />
                        <p className="mt-4 text-text-secondary">Gerando PIX...</p>
                    </div>
                ) : (
                    <>
                        {pixData ? renderPixDisplay() : renderPackageSelection()}
                        {error && (
                            <div className="mt-4 text-center text-red-500 bg-red-100 p-3 rounded-lg">
                                {error}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BuyDiamondsModal;
