import { GoogleGenAI, Modality } from "@google/genai";
import { fileToBase64 } from "../utils/fileUtils";
// FIX: Import AspectRatio type
import { AspectRatio } from "../types";

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// FIX: Add generateImage function for ImageStudio component
export const generateImage = async (
    prompt: string,
    aspectRatio: AspectRatio
): Promise<string | null> => {
    const ai = getAiClient();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
        },
    });
    return response.generatedImages?.[0]?.image.imageBytes ?? null;
};

// FIX: Add editImage function for ImageStudio component
export const editImage = async (
    imageFile: File,
    prompt: string
): Promise<string | null> => {
    const ai = getAiClient();
    const imageBase64 = await fileToBase64(imageFile);
    
    const imagePart = {
        inlineData: {
            mimeType: imageFile.type,
            data: imageBase64,
        },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    return response.candidates?.[0]?.content?.parts[0]?.inlineData?.data ?? null;
};


export const generateFashionImage = async (
    personFile: File, 
    clothingDescription: string, 
    clothingFile: File | null
): Promise<string | null> => {
    const ai = getAiClient();
    const personBase64 = await fileToBase64(personFile);

    const parts: any[] = [
        { inlineData: { mimeType: personFile.type, data: personBase64 } },
    ];
    
    let prompt = `Analyze this image in detail from a fashion perspective. Respond in Brazilian Portuguese.`;
    if (clothingDescription || clothingFile) {
        prompt = `You are a fashion expert. Place the described outfit onto the person in the image. Maintain their pose and the background. The result should be photorealistic.`;
    }

    if (clothingFile) {
        const clothingBase64 = await fileToBase64(clothingFile);
        parts.push({ text: `${prompt} Use the outfit from this second image:` });
        parts.push({ inlineData: { mimeType: clothingFile.type, data: clothingBase64 } });
    } else {
        parts.push({ text: `${prompt} The outfit to add is: ${clothingDescription}` });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: parts },
        config: {
            responseModalities: clothingFile || clothingDescription ? [Modality.IMAGE] : undefined,
        },
    });

    if (clothingFile || clothingDescription) {
        return response.candidates?.[0]?.content?.parts[0]?.inlineData?.data ?? null;
    }
    return response.text;
};

// FIX: Add generateVideo function for VideoLab component
type VideoAspectRatio = '16:9' | '9:16';
export const generateVideo = async (
    imageFile: File,
    prompt: string,
    aspectRatio: VideoAspectRatio,
    onProgress: (status: string) => void
): Promise<Blob> => {
    const ai = getAiClient();

    onProgress('Preparando imagem...');
    const imageBase64 = await fileToBase64(imageFile);

    onProgress('Iniciando a geração de vídeo com o modelo VEO...');
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: imageBase64,
            mimeType: imageFile.type,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        },
    });

    onProgress('Operação iniciada. Aguardando a conclusão...');
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        onProgress('Verificando o status da geração...');
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    onProgress('Geração concluída. Baixando o vídeo...');
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Falha ao obter o link de download do vídeo.");
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY não está configurada no ambiente.");
    }
    
    const response = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!response.ok) {
        const errorBody = await response.text();
        if (errorBody.includes("Requested entity was not found")) {
            throw new Error("A chave de API selecionada não foi encontrada ou é inválida. Por favor, selecione outra chave. Requested entity was not found.");
        }
        throw new Error(`Falha ao baixar o vídeo: ${response.statusText}`);
    }

    onProgress('Download completo!');
    const videoBlob = await response.blob();
    return videoBlob;
};

// FIX: Add analyzeVideo (simulated) function for VideoLab component
export const analyzeVideo = async (
    videoFile: File,
    prompt: string
): Promise<string> => {
    console.log("Análise de vídeo simulada:", { videoFile, prompt });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula o tempo de processamento
    
    return `**Análise Simulada para "${videoFile.name}"**\n\n` +
           `Com base no prompt "${prompt}", a IA identificou o seguinte:\n\n` +
           `- **Quadros Iniciais:** Mostram uma cena urbana ao amanhecer.\n` +
           `- **Ação Principal:** Um carro vermelho passa rapidamente pela tela da esquerda para a direita entre 2 e 4 segundos.\n` +
           `- **Objetos Notáveis:** Prédios altos, semáforos e alguns pedestres ao fundo.\n` +
           `- **Conclusão:** O vídeo parece ser uma filmagem de trânsito em uma cidade grande.\n\n` +
           `*Nota: Esta é uma análise simulada. A funcionalidade de análise de vídeo real não está implementada.*`;
};
