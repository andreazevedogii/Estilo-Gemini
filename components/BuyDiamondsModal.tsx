import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DiamondIcon, LoaderIcon, GoogleIcon } from './icons';
import { fileToBase64 } from '../utils/fileUtils';
import { useAuth } from './AuthContext';

// --- Static PIX Information (Replace with your actual data) ---
const PIX_KEY = "seu-email-ou-chave-pix-aqui@dominio.com";
// Generate a static QR Code from your bank's app and place it in the public folder
const PIX_QR_CODE_URL = "/pix-qrcode.png"; 

interface BuyDiamondsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchaseComplete: () => void;
    userId?: string;
}

const packages = [
    { diamonds: 100, price: 29.90, id: 'pkg_100_imagens', name: 'Pacote 10 Imagens' },
];

type ModalStep = 'login_required' | 'select_package' | 'payment_info' | 'submitted';

const BuyDiamondsModal: React.FC<BuyDiamondsModalProps> = ({ isOpen, onClose, onPurchaseComplete, userId }) => {
    const { currentUser, login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<ModalStep>('login_required');
    const [selectedPackage, setSelectedPackage] = useState<(typeof packages)[0] | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [copied, setCopied] = useState(false);

    const resetModalState = () => {
        setIsLoading(false);
        setError(null);
        setStep(currentUser ? 'select_package' : 'login_required');
        setSelectedPackage(null);
        setReceiptFile(null);
        setCopied(false);
    };

    useEffect(() => {
        if (!isOpen) {
            setTimeout(resetModalState, 300);
        } else {
             if (!currentUser) {
                setStep('login_required');
            } else if (step === 'login_required') {
                setStep('select_package');
            }
        }
    }, [isOpen, currentUser]);

    const handleClose = () => {
        if (isLoading) return;
        onClose();
    };
    
    const handleGoogleLogin = () => {
        // In a real app, this would trigger the Google OAuth flow.
        // Here, we simulate it with a prompt for demonstration purposes.
        const name = prompt("SIMULAÇÃO DE LOGIN:\n\nPara continuar, digite seu nome de usuário.");
        if (name) {
            login(name);
            // The useEffect hook will automatically transition the modal to the next step.
        }
    };

    const handleSelectPackage = (pkg: typeof packages[0]) => {
        setSelectedPackage(pkg);
        setStep('payment_info');
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setReceiptFile(file);
    };

    const handleSubmitProof = async () => {
        if (!receiptFile || !selectedPackage || !userId) {
            setError("Por favor, selecione um pacote, anexe o comprovante e esteja logado.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const receiptImageBase64 = await fileToBase64(receiptFile);
            await axios.post('/api/submit-proof', {
                userId,
                packageId: selectedPackage.id,
                packageName: selectedPackage.name,
                packageDiamonds: selectedPackage.diamonds,
                receiptImage: receiptImageBase64,
            });
            setStep('submitted');
        } catch (err: any) {
            setError(err.response?.data?.error || "Falha ao enviar o comprovante. Tente novamente.");
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

    const renderContent = () => {
        if (isLoading) {
            return (
                 <div className="min-h-[300px] flex flex-col justify-center items-center">
                    <LoaderIcon className="w-12 h-12 animate-spin text-accent" />
                    <p className="mt-4 text-text-secondary">Enviando...</p>
                </div>
            )
        }

        if (error) {
           return <div className="mt-4 text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</div>
        }

        switch (step) {
            case 'login_required':
                 return (
                    <div className="text-center min-h-[300px] flex flex-col justify-center items-center">
                        <h3 className="text-xl font-bold text-text-primary mt-4">Conecte-se para Continuar</h3>
                        <p className="text-text-secondary mt-2 mb-6">Para comprar diamantes e salvar seu progresso, por favor, conecte-se com sua conta.</p>
                        <button 
                            onClick={handleGoogleLogin} 
                            className="w-full bg-white hover:bg-gray-100 text-text-primary font-bold py-3 px-4 rounded-xl shadow-md border border-gray-300 flex items-center justify-center transition-all"
                        >
                            <GoogleIcon className="w-6 h-6 mr-3" />
                            Conectar com Google
                        </button>
                    </div>
                );
            case 'select_package':
                return (
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
            case 'payment_info':
                return (
                    <div>
                         <button onClick={() => setStep('select_package')} className="text-sm text-accent mb-4">&larr; Voltar para pacotes</button>
                         <h3 className="text-lg font-semibold text-text-primary mb-2">1. Efetue o Pagamento PIX</h3>
                         <p className="text-sm text-text-secondary mb-4">Pague para a chave abaixo e guarde o comprovante.</p>
                         <img src={PIX_QR_CODE_URL} alt="PIX QR Code" className="mx-auto w-48 h-48 rounded-lg bg-white p-2 shadow-md mb-4" />
                         <div className="flex items-center mt-1">
                            <input type="text" readOnly value={PIX_KEY} className="w-full bg-secondary p-2 rounded-l-md text-sm text-text-primary truncate" />
                            <button onClick={() => copyToClipboard(PIX_KEY)} className="bg-accent text-white px-3 py-2 rounded-r-md text-xs font-bold hover:bg-accent-hover w-20">{copied ? 'Copiado!' : 'Copiar'}</button>
                         </div>

                         <h3 className="text-lg font-semibold text-text-primary mt-6 mb-2">2. Envie o Comprovante</h3>
                         <p className="text-sm text-text-secondary mb-4">Anexe a imagem do seu comprovante de pagamento para que possamos verificar sua compra.</p>
                         <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30"
                         />
                         {receiptFile && <p className="text-xs text-green-600 mt-2">Arquivo selecionado: {receiptFile.name}</p>}

                         <button
                            onClick={handleSubmitProof}
                            disabled={!receiptFile}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl mt-6 disabled:bg-gray-400"
                        >
                           Enviar para Aprovação
                        </button>
                    </div>
                );
            case 'submitted':
                return (
                    <div className="text-center min-h-[300px] flex flex-col justify-center items-center">
                         <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h3 className="text-xl font-bold text-text-primary mt-4">Enviado com Sucesso!</h3>
                        <p className="text-text-secondary mt-2">Recebemos seu comprovante. Seus diamantes serão creditados assim que um administrador aprovar a transação. Isso geralmente leva algumas horas.</p>
                        <button onClick={onPurchaseComplete} className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-xl mt-6">
                            Fechar
                        </button>
                    </div>
                )
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-primary rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-100 relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Comprar Diamantes</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-text-primary text-3xl disabled:opacity-50" disabled={isLoading}>&times;</button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

export default BuyDiamondsModal;