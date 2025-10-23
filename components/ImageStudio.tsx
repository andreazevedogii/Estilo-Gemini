import React, { useState, useMemo } from 'react';
import ImageInput from './common/ImageInput';
import { SparklesIcon, LoaderIcon, DiamondIcon } from './icons';
import { generateImage, editImage } from '../services/geminiService';
import { AspectRatio } from '../types';

interface ImageStudioProps {
    diamondBalance: number;
    onSpendDiamonds: (cost: number) => void;
    onPurchaseDiamonds: () => void;
}

const GENERATE_COST = 5;
const EDIT_COST = 3;

const ImageStudio: React.FC<ImageStudioProps> = ({ diamondBalance, onSpendDiamonds, onPurchaseDiamonds }) => {
  const [generationPrompt, setGenerationPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  const editPreview = useMemo(() => editFile ? URL.createObjectURL(editFile) : null, [editFile]);
  const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

  const handleGenerate = async () => {
    if (!generationPrompt) return;
    if (diamondBalance < GENERATE_COST) {
        onPurchaseDiamonds();
        return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedImage(null);
    try {
      const result = await generateImage(generationPrompt, aspectRatio);
      if (result) {
        setGeneratedImage(`data:image/jpeg;base64,${result}`);
        onSpendDiamonds(GENERATE_COST);
      } else {
        setGenerationError('Falha ao gerar a imagem.');
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Ocorreu um erro.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!editFile || !editPrompt) return;
    if (diamondBalance < EDIT_COST) {
        onPurchaseDiamonds();
        return;
    }
    setIsEditing(true);
    setEditError(null);
    setEditedImage(null);
    try {
      const result = await editImage(editFile, editPrompt);
      if (result) {
        setEditedImage(`data:image/png;base64,${result}`);
        onSpendDiamonds(EDIT_COST);
      } else {
        setEditError('Falha ao editar a imagem.');
      }
    } catch (err: any) {
      setEditError(err.message || 'Ocorreu um erro.');
    } finally {
      setIsEditing(false);
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
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Estúdio de Imagem</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">Crie novos mundos ou aperfeiçoe suas fotos com IA.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-secondary p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Gerar Imagem</h3>
                <div className="space-y-4">
                    <textarea
                        value={generationPrompt}
                        onChange={(e) => setGenerationPrompt(e.target.value)}
                        placeholder="Uma cidade futurista ao pôr do sol..."
                        className="w-full h-24 p-2 bg-primary border-2 border-gray-300 rounded-xl focus:ring-accent focus:border-accent"
                    />
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Proporção</label>
                        <select
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                            className="w-full p-2 bg-primary border-2 border-gray-300 rounded-xl focus:ring-accent focus:border-accent"
                        >
                            {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
                        </select>
                    </div>
                    <button onClick={handleGenerate} disabled={!generationPrompt || isGenerating} className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105 ${diamondBalance < GENERATE_COST ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-accent hover:bg-accent-hover'} disabled:bg-gray-400`}>
                        {isGenerating ? 'Criando...' : (diamondBalance < GENERATE_COST ? 'Comprar Diamantes' : renderButtonContent(GENERATE_COST, 'Gerar'))}
                    </button>
                </div>
                <div className="mt-4 aspect-square bg-primary rounded-xl flex items-center justify-center">
                    {isGenerating && <LoaderIcon className="w-12 h-12 animate-spin text-accent"/>}
                    {generationError && <p className="text-red-500">{generationError}</p>}
                    {generatedImage && <img src={generatedImage} alt="Generated" className="w-full h-full object-contain rounded-lg"/>}
                </div>
            </div>

            <div className="bg-secondary p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Editar Imagem</h3>
                <div className="space-y-4">
                    <ImageInput label="Enviar Imagem para Editar" onFileSelect={setEditFile} previewUrl={editPreview} />
                    <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="Adicione um filtro retrô e remova a pessoa no fundo..."
                        className="w-full h-24 p-2 bg-primary border-2 border-gray-300 rounded-xl focus:ring-accent focus:border-accent"
                    />
                    <button onClick={handleEdit} disabled={!editFile || !editPrompt || isEditing} className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-transform transform hover:scale-105 ${diamondBalance < EDIT_COST ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-accent hover:bg-accent-hover'} disabled:bg-gray-400`}>
                        {isEditing ? 'Aplicando...' : (diamondBalance < EDIT_COST ? 'Comprar Diamantes' : renderButtonContent(EDIT_COST, 'Editar'))}
                    </button>
                </div>
                <div className="mt-4 aspect-square bg-primary rounded-xl flex items-center justify-center">
                     {isEditing && <LoaderIcon className="w-12 h-12 animate-spin text-accent"/>}
                     {editError && <p className="text-red-500">{editError}</p>}
                     {editedImage && <img src={editedImage} alt="Edited" className="w-full h-full object-contain rounded-lg"/>}
                </div>
            </div>
        </div>
    </div>
  );
};

export default ImageStudio;