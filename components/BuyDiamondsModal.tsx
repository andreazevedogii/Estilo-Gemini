import React, { useState } from 'react';
import { DiamondIcon, LoaderIcon } from './icons';
import PaymentBrick from './PaymentBrick';

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

// Substitua pela sua Chave Pública (Public Key) de teste do Mercado Pago.
// Esta chave é segura para ser usada no frontend.
const MERCADO_PAGO_PUBLIC_KEY = 'TEST-c4a72181-e241-4f21-945f-4a6f7c19a27c';


const BuyDiamondsModal: React.FC<BuyDiamondsModalProps> = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(null);
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error' | null>(null);


    const handleClose = () => {
        onClose();
        // Reset state on close
        setTimeout(() => {
            setIsLoading(false);
            setError(null);
            setSelectedPackage(null);
            setPreferenceId(null);
            setPaymentStatus(null);
        }, 300); // delay to allow closing animation
    };

    const handleSelectPackage = async (pkg: typeof packages[0]) => {
        setIsLoading(true);
        setError(null);
        setPreferenceId(null);
        setSelectedPackage(pkg);

        try {
            // O endpoint do seu backend agora deve retornar o ID da preferência.
            const response = await fetch('http://localhost:3001/api/mercadopago/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: pkg.id,
                    title: pkg.title,
                    quantity: 1,
                    unit_price: pkg.price,
                }),
            });

            if (!response.ok) {
                throw new Error('Falha ao criar a preferência de pagamento.');
            }

            const preference = await response.json();

            if (preference.id) {
                setPreferenceId(preference.id);
            } else {
                throw new Error('ID da preferência não foi recebido do servidor.');
            }

        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro inesperado.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderContent = () => {
        if (paymentStatus === 'success') {
            return (
                 <div className="text-center">
                    <h3 className="text-2xl font-bold text-green-600 mb-4">Pagamento Aprovado!</h3>
                    <p className="text-text-secondary">Seus diamantes foram adicionados à sua conta.</p>
                    <button onClick={handleClose} className="mt-6 w-full bg-accent text-white font-bold py-3 px-4 rounded-xl">Fechar</button>
                </div>
            )
        }
        
        if (paymentStatus === 'error') {
            return (
                 <div className="text-center">
                    <h3 className="text-2xl font-bold text-red-500 mb-4">Erro no Pagamento</h3>
                    <p className="text-text-secondary">{error || "Não foi possível processar seu pagamento. Tente novamente."}</p>
                    <button onClick={() => setPaymentStatus(null)} className="mt-6 w-full bg-accent text-white font-bold py-3 px-4 rounded-xl">Tentar Novamente</button>
                </div>
            )
        }
        
        if (preferenceId && selectedPackage) {
            return (
                <div>
                    <button onClick={() => { setSelectedPackage(null); setPreferenceId(null); }} className="text-sm text-accent mb-4">&larr; Voltar para pacotes</button>
                    <div className="p-4 border rounded-lg mb-4">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">{selectedPackage.title}</span>
                            <span className="font-bold">R$ {selectedPackage.price.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                    <PaymentBrick
                        publicKey={MERCADO_PAGO_PUBLIC_KEY}
                        preferenceId={preferenceId}
                        onPaymentSuccess={() => setPaymentStatus('success')}
                        onPaymentError={(err) => { setError(err); setPaymentStatus('error');}}
                    />
                </div>
            )
        }
        
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
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-primary rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-100 relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Comprar Diamantes</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-text-primary text-3xl">&times;</button>
                </div>
                
                {isLoading && (
                    <div className="min-h-[200px] flex flex-col justify-center items-center">
                        <LoaderIcon className="w-12 h-12 animate-spin text-accent" />
                        <p className="mt-4 text-text-secondary">Preparando pagamento...</p>
                    </div>
                )}

                {!isLoading && renderContent()}

                {error && !paymentStatus && (
                    <div className="mt-4 text-center text-red-500 bg-red-100 p-3 rounded-lg">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyDiamondsModal;