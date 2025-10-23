import React, { useState, useMemo } from 'react';
import ImageInput from './common/ImageInput';
import { SparklesIcon, LoaderIcon, DiamondIcon } from './icons';
import { generateFashionImage } from '../services/geminiService';

interface VirtualTryOnProps {
    diamondBalance: number;
    onSpendDiamonds: (cost: number) => void;
    onPurchaseDiamonds: () => void;
}

const GENERATE_COST = 10;
const ANALYZE_COST = 2;

const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ diamondBalance, onSpendDiamonds, onPurchaseDiamonds }) => {
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [clothingFile, setClothingFile] = useState<File | null>(null);
  const [clothingDescription, setClothingDescription] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalysis, setIsAnalysis] = useState(false);

  const personPreview = useMemo(() => personFile ? URL.createObjectURL(personFile) : null, [personFile]);
  const clothingPreview = useMemo(() => clothingFile ? URL.createObjectURL(clothingFile) : null, [clothingFile]);
  
  const handleSubmit = async () => {
    if (!personFile || !(clothingFile || clothingDescription.trim().length > 0)) return;
    if (diamondBalance < GENERATE_COST) {
        onPurchaseDiamonds();
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setIsAnalysis(false);

    try {
      const result = await generateFashionImage(personFile, clothingDescription, clothingFile);
      if (result) {
        setGeneratedImage(`data:image/png;base64,${result}`);
        onSpendDiamonds(GENERATE_COST);
      } else {
        setError('Falha ao gerar a imagem. O resultado estava vazio.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnalyze = async () => {
      if (!personFile) return;
      if (diamondBalance < ANALYZE_COST) {
          onPurchaseDiamonds();
          return;
      }
      setIsLoading(true);
      setError(null);
      setGeneratedImage(null);
      setIsAnalysis(true);
      try {
          const result = await generateFashionImage(personFile, "Analyze this image in detail from a fashion perspective. Be detailed and constructive. Respond in Brazilian Portuguese.", null);
          if (result) {
              setGeneratedImage(result);
              onSpendDiamonds(ANALYZE_COST);
          } else {
              setError("Falha ao obter a análise.");
          }
      } catch (err: any) {
          setError(err.message || 'Ocorreu um erro desconhecido.');
      } finally {
          setIsLoading(false);
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
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-text-primary">Provador Virtual</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">Envie sua foto, descreva um look ou envie uma foto da roupa e deixe nossa IA te vestir.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-6 bg-secondary p-6 rounded-2xl shadow-lg">
          <ImageInput label="Sua Foto" onFileSelect={setPersonFile} previewUrl={personPreview} />
          <ImageInput label="Foto da Roupa (Opcional)" onFileSelect={setClothingFile} previewUrl={clothingPreview} />
           <div className="relative text-center">
             <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300" />
             </div>
             <div className="relative flex justify-center">
                <span className="bg-secondary px-2 text-sm text-text-secondary">OU</span>
             </div>
          </div>
          <textarea
            value={clothingDescription}
            onChange={(e) => setClothingDescription(e.target.value)}
            placeholder="Descreva o look..."
            className="w-full h-24 p-2 bg-primary border-2 border-gray-300 rounded-xl focus:ring-accent focus:border-accent"
          />
          <button
              onClick={handleSubmit}
              disabled={!personFile || !(clothingFile || clothingDescription.trim().length > 0) || isLoading}
              className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105 ${diamondBalance < GENERATE_COST ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-accent hover:bg-accent-hover'} disabled:bg-gray-400`}
          >
              {isLoading ? 'Gerando...' : (diamondBalance < GENERATE_COST ? 'Comprar Diamantes' : renderButtonContent(GENERATE_COST, 'Gerar Look'))}
          </button>
          <button
              onClick={handleAnalyze}
              disabled={!personFile || isLoading}
              className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105 mt-2 ${diamondBalance < ANALYZE_COST ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-gray-400`}
            >
              {isLoading ? 'Analisando...' : (diamondBalance < ANALYZE_COST ? 'Comprar Diamantes' : renderButtonContent(ANALYZE_COST, 'Analisar Imagem'))}
          </button>
        </div>

        <div className="md:col-span-2 bg-secondary p-6 rounded-2xl shadow-lg aspect-square flex items-center justify-center">
          {isLoading && (
              <div className="text-center">
                  <LoaderIcon className="w-16 h-16 animate-spin text-accent mx-auto"/>
                  <p className="mt-4 text-text-secondary">Nossa IA está criando seu novo look...</p>
              </div>
          )}
          {error && <div className="text-red-500 text-center p-4"><p>Erro:</p><p>{error}</p></div>}
          {generatedImage && !isAnalysis && (
              <img src={generatedImage} alt="Generated fashion" className="w-full h-full object-contain rounded-xl"/>
          )}
          {generatedImage && isAnalysis && (
            <div className="w-full h-full overflow-y-auto p-4 text-text-primary whitespace-pre-wrap">{generatedImage}</div>
          )}
          {!isLoading && !error && !generatedImage && (
            <div className="text-center text-gray-400">
                <SparklesIcon className="w-24 h-24 mx-auto"/>
                <p className="mt-4">Sua imagem gerada aparecerá aqui.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
