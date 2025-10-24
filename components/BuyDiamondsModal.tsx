import React, { useState, useEffect } from 'react';
import { DiamondIcon, LoaderIcon } from './icons';

interface BuyDiamondsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchaseComplete: (diamonds: number) => void;
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

const BuyDiamondsModal: React.FC<BuyDiamondsModalProps> = ({ isOpen, onClose, onPurchaseComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pixData, setPixData] = useState<PixData | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<(typeof packages)[0] | null>(null);
    const [copied, setCopied] = useState(false);

    const resetModalState = () => {
        setIsLoading(false);
        setError(null);
        setPixData(null);
        setCopied(false);
        setSelectedPackage(null);
    };

    // Reset state when the modal is closed from the parent
    useEffect(() => {
        if (!isOpen) {
            setTimeout(resetModalState, 300); // Allow closing animation
        }
    }, [isOpen]);


    const handleClose = () => {
        if (isLoading) return;
        onClose();
    };

    const handleSelectPackage = async (pkg: typeof packages[0]) => {
        setIsLoading(true);
        setError(null);
        setPixData(null);
        setSelectedPackage(pkg);
        
        try {
            // SIMULATION: In a real app, you would fetch from your backend here.
            // We are simulating the delay of a network request.
            await new Promise(resolve => setTimeout(resolve, 1500));
    
            // This is mock data that your backend would typically generate by
            // calling a payment provider's API (like Abacate Pay).
            const mockPixData = {
                qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQMAAACXljzdAAAABlBMVEX///8AAABVwtN+AAABHklEQVRIx2MYQUAQBgyMIAYwh0B+DzCCGFB+IE4H8nNQPqCE/4CYzUT0eUD8A6TrgXwYyC8A+Z/UPwD596B8PZAvg/kP4EAG8vNA/glI/wP5LSCfGMyfAPkfkP8Fkv8Dkv8Akv+B/E0gvwdk/kP5B0j/H5D/gPxNIL8HZIJgfg/I/4D8D5D/A/L/gfwNIJ8B8gdA/glI/wP5LSCfGMyfAPkfkP8Fkv8Dkv8Akv+B/E0gvwdk/kP5B0j/H5D/gPxNIL8HZIJgfg/I/4D8D5D/A/L/gfwNIJ8B8gdA/glI/wP5LSCfGMyfAPkfkP8Fkv8Dkv8Akv+B/E0gvwdk/kP5B0j/H5D/gPxNIL8HZIJgfg/I/4D8D5D/A/L/gfwNIJ8B8gdA/glI/wP5LSCfGMyfAPkfkP8Fkv8Dkv8Akv+B/E0gvwdk/kP5B0j/H5D/gPxNIL8HZIJgvgMAnHwWJg+p0QcAAAAASUVORK5CYII=',
                copyPaste: '00020126580014br.gov.bcb.pix0136a6f8b9-1234-4a5b-8c9d-0123456789ab520400005303986540510.005802BR5913Exemplo de Loja6009SAO PAULO62290525-simulated-gemini-style-pix6304ABCD',
            };
    
            setPixData({
                qrCode: mockPixData.qrCode,
                copyPaste: mockPixData.copyPaste,
            });
    
        } catch (err: any) {
            setError('Falha ao simular a geração do PIX. Este é um ambiente de demonstração.');
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

    const handleSimulateConfirmation = () => {
        if (selectedPackage) {
            onPurchaseComplete(selectedPackage.diamonds);
        }
    };
    
    const renderPixDisplay = () => {
        if (!pixData) return null;
        return (
            <div className="text-center">
                <h3 className="text-lg font-semibold text-text-primary mb-2">Pague com PIX</h3>
                <p className="text-sm text-text-secondary mb-4">Aponte a câmera do seu celular para o QR Code ou use o "Copia e Cola".</p>
                <img 
                    src={pixData.qrCode} 
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
                 <div className="text-sm text-blue-800 bg-blue-100 p-3 rounded-md mt-6 text-left">
                    <p className="font-semibold">Aviso do Desenvolvedor:</p>
                    <p className="text-xs mt-1">Para fins de demonstração, a geração de PIX e a comunicação com o servidor de pagamentos foram simuladas. O QR Code e a chave são fictícios. Clique no botão abaixo para simular um pagamento bem-sucedido e receber seus diamantes.</p>
                 </div>
                 <button 
                    onClick={handleSimulateConfirmation}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl mt-4"
                >
                    Simular Pagamento Confirmado
                </button>
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
                    <button onClick={handleClose} className="text-gray-500 hover:text-text-primary text-3xl disabled:opacity-50" disabled={isLoading && !pixData}>&times;</button>
                </div>
                
                {isLoading && !pixData ? (
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
