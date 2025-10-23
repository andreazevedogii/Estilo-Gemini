import React, { useState, useMemo, useEffect } from 'react';
import ImageInput from './common/ImageInput';
import { SparklesIcon, LoaderIcon, DiamondIcon } from './icons';
import { generateVideo, analyzeVideo } from '../services/geminiService';

type AspectRatio = '16:9' | '9:16';

interface VideoLabProps {
    diamondBalance: number;
    onSpendDiamonds: (cost: number) => void;
    onPurchaseDiamonds: () => void;
}

const GENERATE_COST = 50;

const VideoLab: React.FC<VideoLabProps> = ({ diamondBalance, onSpendDiamonds, onPurchaseDiamonds }) => {
    const [genFile, setGenFile] = useState<File | null>(null);
    const [genPrompt, setGenPrompt] = useState<string>('');
    const [genAspectRatio, setGenAspectRatio] = useState<AspectRatio>('16:9');
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [genError, setGenError] = useState<string | null>(null);
    const [genStatus, setGenStatus] = useState<string>('');
    const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);

    const [analysisFile, setAnalysisFile] = useState<File | null>(null);
    const [analysisPrompt, setAnalysisPrompt] = useState<string>('');
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const genPreview = useMemo(() => genFile ? URL.createObjectURL(genFile) : null, [genFile]);
    const analysisPreviewUrl = useMemo(() => analysisFile ? URL.createObjectURL(analysisFile) : null, [analysisFile]);
    
    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setApiKeySelected(true);
            }
        };
        checkKey();
    }, []);

    const handleSelectKey = async () => {
        if(window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
        }
    };

    const handleGenerate = async () => {
        if (!genFile) return;
        if (diamondBalance < GENERATE_COST) {
            onPurchaseDiamonds();
            return;
        }
        setIsGenerating(true);
        setGenError(null);
        setGeneratedVideoUrl(null);
        setGenStatus('Iniciando geração de vídeo...');
        
        try {
            const onProgress = (status: string) => setGenStatus(status);
            const videoBlob = await generateVideo(genFile, genPrompt, genAspectRatio, onProgress);
            const url = URL.createObjectURL(videoBlob);
            setGeneratedVideoUrl(url);
            onSpendDiamonds(GENERATE_COST);
        } catch (err: any) {
            setGenError(err.message || 'Ocorreu um erro durante a geração do vídeo.');
            if (err.message.includes("Requested entity was not found")) {
                setApiKeySelected(false);
            }
        } finally {
            setIsGenerating(false);
            setGenStatus('');
        }
    };

    const handleAnalyze = async () => {
        if (!analysisFile || !analysisPrompt) return;
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResult(null);
        try {
            const result = await analyzeVideo(analysisFile, analysisPrompt);
            setAnalysisResult(result);
        } catch (err: any) {
            setAnalysisError(err.message || 'Ocorreu um erro durante a análise do vídeo.');
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const renderButtonContent = (cost: number, text: string) => (
        <div className="flex items-center justify-center">
            {text}
            <span className="flex items-center ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {cost} <DiamondIcon className="w-3 h-3 ml-1"/>
            </span>
        </div>
    );


    return (
        <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Laboratório de Vídeo</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">Dê vida às imagens e entenda o conteúdo de vídeos como nunca antes.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-secondary p-6 rounded-2xl shadow-lg">
                    <h3 className="text-2xl font-bold mb-4">Gerar Vídeo a partir de Imagem</h3>
                    {!apiKeySelected && (
                        <div className="bg-yellow-200 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-xl relative mb-4" role="alert">
                            <strong className="font-bold">Ação Necessária: </strong>
                            <span className="block sm:inline">Selecione uma chave de API para habilitar a geração de vídeo. Este recurso requer faturamento.</span>
                            <button onClick={handleSelectKey} className="ml-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded">Selecionar Chave de API</button>
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="ml-2 underline">Saiba mais sobre faturamento</a>
                        </div>
                    )}
                    <div className="space-y-4">
                        <ImageInput label="Enviar Imagem Inicial" onFileSelect={setGenFile} previewUrl={genPreview} />
                        <textarea value={genPrompt} onChange={(e) => setGenPrompt(e.target.value)} placeholder="Um holograma de néon de um gato dirigindo..." className="w-full h-24 p-2 bg-primary border-2 border-gray-300 rounded-xl focus:ring-accent focus:border-accent" />
                        <select value={genAspectRatio} onChange={(e) => setGenAspectRatio(e.target.value as AspectRatio)} className="w-full p-2 bg-primary border-2 border-gray-300 rounded-xl focus:ring-accent focus:border-accent">
                            <option value="16:9">16:9 (Paisagem)</option>
                            <option value="9:16">9:16 (Retrato)</option>
                        </select>
                        <button onClick={handleGenerate} disabled={!genFile || isGenerating || !apiKeySelected} className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105 ${diamondBalance < GENERATE_COST ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-accent hover:bg-accent-hover'} disabled:bg-gray-400`}>
                           {isGenerating ? 'Gerando...' : (diamondBalance < GENERATE_COST ? 'Comprar Diamantes' : renderButtonContent(GENERATE_COST, 'Gerar Vídeo'))}
                        </button>
                    </div>
                    <div className="mt-4 aspect-video bg-primary rounded-xl flex items-center justify-center">
                        {isGenerating && <div className="text-center"><LoaderIcon className="w-12 h-12 animate-spin text-accent mx-auto"/><p className="mt-2 text-sm text-text-secondary">{genStatus}</p></div>}
                        {genError && <p className="text-red-500 p-4 text-center">{genError}</p>}
                        {generatedVideoUrl && <video src={generatedVideoUrl} controls autoPlay loop className="w-full h-full rounded-lg"/>}
                    </div>
                </div>

                <div className="bg-secondary p-6 rounded-2xl shadow-lg">
                    <h3 className="text-2xl font-bold mb-4">Analisar Vídeo (Simulado)</h3>
                     <div className="w-full aspect-video bg-primary rounded-xl mb-4 flex items-center justify-center">
                        {analysisFile ? (
                          <video key={analysisPreviewUrl} src={analysisPreviewUrl ?? ''} controls className="w-full h-full rounded-lg" />
                        ) : (
                           <div className="text-center text-text-secondary">
                             <p>Envie um vídeo para analisar</p>
                           </div>
                        )}
                    </div>
                    <input type="file" accept="video/*" onChange={(e) => setAnalysisFile(e.target.files?.[0] || null)} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent/20 file:text-accent hover:file:bg-accent/30" />
                    <textarea value={analysisPrompt} onChange={(e) => setAnalysisPrompt(e.target.value)} placeholder="Quais são os objetos principais neste vídeo?" className="w-full h-24 p-2 mt-4 bg-primary border-2 border-gray-300 rounded-xl focus:ring-accent focus:border-accent" />
                    <button onClick={handleAnalyze} disabled={!analysisFile || !analysisPrompt || isAnalyzing} className="w-full mt-4 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105">
                        <SparklesIcon className="w-5 h-5 mr-2"/>
                        {isAnalyzing ? 'Analisando...' : 'Analisar Vídeo'}
                    </button>
                    <div className="mt-4 p-4 bg-primary rounded-xl min-h-[100px]">
                        {isAnalyzing && <LoaderIcon className="w-8 h-8 animate-spin text-accent mx-auto"/>}
                        {analysisError && <p className="text-red-500">{analysisError}</p>}
                        {analysisResult && <p className="text-text-secondary whitespace-pre-wrap">{analysisResult}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoLab;
