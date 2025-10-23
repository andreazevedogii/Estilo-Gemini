import React, { useState, useEffect } from 'react';
import { DiamondIcon, LoaderIcon } from './icons';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface BuyDiamondsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchase: (amount: number) => void;
}

const packages = [
    { diamonds: 100, price: 5.00, id: 'price_100' },
    { diamonds: 500, price: 20.00, id: 'price_500' },
    { diamonds: 1000, price: 35.00, id: 'price_1000' },
    { diamonds: 2500, price: 75.00, id: 'price_2500' },
];

type Package = typeof packages[0];

// Use a chave publicável de teste do Stripe. Em um app real, use variáveis de ambiente.
const stripePromise = loadStripe('pk_test_51Pbya7Rxaj9AQRxS5h43D6a6FvI0g2f9UxtVpBCJDWpyy2wzCRV1XNqPU1V3a4iA2hco22b3z7hT4LgJSCUnFSCn00lvdA1s4D');

const CheckoutForm: React.FC<{ selectedPackage: Package, onPurchaseSuccess: () => void }> = ({ selectedPackage, onPurchaseSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Em um app real, este é o URL para onde o cliente será redirecionado após o pagamento.
                return_url: window.location.href,
            },
            redirect: 'if_required', // Evita o redirecionamento para este demo
        });

        if (error) {
            // Ocorreu um erro (ex: cartão recusado).
            // Para este demo, vamos ignorar o erro e simular um sucesso para o fluxo do app.
            console.warn("Stripe confirmPayment error (ignored for demo):", error.message);
            setErrorMessage(`Erro simulado: ${error.message}`);
             // Simular sucesso mesmo com erro para fins de demonstração
            setTimeout(() => {
                onPurchaseSuccess();
            }, 1000);

        } else {
            // Pagamento bem-sucedido!
            onPurchaseSuccess();
        }
        
        // Em um cenário real, você não chamaria onPurchaseSuccess se houvesse um erro.
        // Mas para este demo, garantimos que o usuário possa continuar.
        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button
                disabled={isProcessing || !stripe || !elements}
                className="w-full mt-6 bg-accent text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
            >
                {isProcessing ? 'Processando...' : `Pagar R$ ${selectedPackage.price.toFixed(2).replace('.', ',')}`}
            </button>
            {errorMessage && <div className="text-red-500 text-sm mt-2 text-center">{errorMessage}</div>}
        </form>
    );
};


const BuyDiamondsModal: React.FC<BuyDiamondsModalProps> = ({ isOpen, onClose, onPurchase }) => {
    const [view, setView] = useState<'packages' | 'loading' | 'payment'>('packages');
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            // Reseta o estado quando o modal é fechado
            setTimeout(() => {
                setView('packages');
                setSelectedPackage(null);
                setClientSecret(null);
            }, 300); // Aguarda a animação de fechamento
        }
    }, [isOpen]);

    const handleSelectPackage = (pkg: Package) => {
        setSelectedPackage(pkg);
        setView('loading');

        // --- SIMULAÇÃO DE BACKEND ---
        // Em um app real, você faria uma chamada para o seu servidor aqui
        // para criar um PaymentIntent e obter o clientSecret.
        console.log(`Simulando criação de PaymentIntent para ${pkg.price * 100} centavos`);
        setTimeout(() => {
            // Este é um clientSecret FALSO. O Stripe Elements o usa para determinar
            // quais detalhes de pagamento exibir, mas a confirmação falhará.
            // Para o demo, trataremos a falha como um sucesso.
            const fakeClientSecret = `pi_${pkg.id}_secret_${Date.now()}`;
            setClientSecret(fakeClientSecret);
            setView('payment');
        }, 1000);
    };

    const handlePurchaseSuccess = () => {
        if (selectedPackage) {
            onPurchase(selectedPackage.diamonds);
        }
        onClose();
    };
    
    const appearance: StripeElementsOptions['appearance'] = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#E91E63',
            colorBackground: '#ffffff',
            colorText: '#4A2C3A',
            fontFamily: 'Poppins, sans-serif',
            borderRadius: '8px',
        },
    };

    const options: StripeElementsOptions | undefined = clientSecret ? { clientSecret, appearance } : undefined;

    const renderContent = () => {
        switch (view) {
            case 'loading':
                return (
                    <div className="text-center p-8 flex flex-col items-center justify-center min-h-[300px]">
                        <LoaderIcon className="w-12 h-12 animate-spin text-accent" />
                        <p className="text-lg text-text-secondary mt-4">Preparando pagamento seguro...</p>
                    </div>
                );
            case 'payment':
                if (options && selectedPackage) {
                    return (
                        <div>
                            <div className="mb-4">
                                <button onClick={() => setView('packages')} className="text-sm text-accent hover:underline">&larr; Voltar</button>
                                <div className="text-center my-2 p-3 bg-secondary rounded-lg">
                                    <p>Você está comprando:</p>
                                    <p className="font-bold text-lg">{selectedPackage.diamonds} Diamantes por R$ {selectedPackage.price.toFixed(2).replace('.', ',')}</p>
                                </div>
                            </div>
                            <Elements stripe={stripePromise} options={options}>
                                <CheckoutForm selectedPackage={selectedPackage} onPurchaseSuccess={handlePurchaseSuccess} />
                            </Elements>
                        </div>
                    );
                }
                return null;
            case 'packages':
            default:
                return (
                    <div className="space-y-4">
                        {packages.map((pkg) => (
                            <button
                                key={pkg.diamonds}
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
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-primary rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Comprar Diamantes</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-text-primary text-3xl">&times;</button>
                </div>
                {renderContent()}
                <p className="text-xs text-center text-gray-400 mt-6">Pagamentos seguros via Stripe. A criação do pagamento é simulada.</p>
            </div>
        </div>
    );
};

export default BuyDiamondsModal;