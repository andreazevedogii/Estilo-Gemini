import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { PaymentSubmission } from '../types';
import { LoaderIcon } from './icons';

const AdminPanel: React.FC = () => {
    const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubmissions = useCallback(async () => {
        try {
            setError(null);
            const response = await axios.get('/api/admin/submissions');
            setSubmissions(response.data);
        } catch (err) {
            setError('Falha ao buscar as submissões pendentes.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleApprove = async (id: number) => {
        try {
            await axios.post(`/api/admin/approve/${id}`);
            // Remove from list optimistically
            setSubmissions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert(`Erro ao aprovar: ${err}`);
        }
    };

    const handleReject = async (id: number) => {
        try {
            await axios.post(`/api/admin/reject/${id}`);
            // Remove from list optimistically
            setSubmissions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert(`Erro ao rejeitar: ${err}`);
        }
    };

    return (
        <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Painel de Administração</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">Aprove ou rejeite as compras de diamantes pendentes.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <LoaderIcon className="w-12 h-12 animate-spin text-accent" />
                </div>
            ) : error ? (
                <p className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>
            ) : submissions.length === 0 ? (
                <p className="text-center text-text-secondary bg-secondary p-8 rounded-2xl">Não há nenhuma submissão pendente no momento.</p>
            ) : (
                <div className="space-y-6">
                    {submissions.map(sub => (
                        <div key={sub.id} className="bg-secondary p-4 sm:p-6 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="md:col-span-1">
                                <a href={`data:image/jpeg;base64,${sub.receiptImage}`} target="_blank" rel="noopener noreferrer">
                                    <img 
                                        src={`data:image/jpeg;base64,${sub.receiptImage}`} 
                                        alt="Comprovante" 
                                        className="w-full h-auto rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                    />
                                </a>
                            </div>
                            <div className="md:col-span-1 text-sm">
                                <p><strong>ID da Submissão:</strong> {sub.id}</p>
                                <p><strong>ID do Usuário:</strong> {sub.userId}</p>
                                <p><strong>Pacote:</strong> {sub.packageName}</p>
                                <p><strong>Diamantes:</strong> {sub.packageDiamonds}</p>
                                <p><strong>Data:</strong> {new Date(sub.timestamp).toLocaleString('pt-BR')}</p>
                            </div>
                            <div className="md:col-span-1 flex flex-col space-y-2">
                                <button
                                    onClick={() => handleApprove(sub.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105"
                                >
                                    Aprovar
                                </button>
                                <button
                                    onClick={() => handleReject(sub.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105"
                                >
                                    Rejeitar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
