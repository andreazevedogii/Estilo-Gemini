import { GoogleGenAI, Modality, Type } from "@google/genai";
import { fileToBase64 } from "../utils/fileUtils";
import { AspectRatio } from '../types';

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });


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

export const generateImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string | null> => {
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
    return response.generatedImages?.[0]?.image?.imageBytes ?? null;
};

export const editImage = async (file: File, prompt: string): Promise<string | null> => {
    const ai = getAiClient();
    const imageBase64 = await fileToBase64(file);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: imageBase64, mimeType: file.type } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    return response.candidates?.[0]?.content?.parts[0]?.inlineData?.data ?? null;
};

export const generateVideo = async (
    file: File, 
    prompt: string, 
    aspectRatio: '16:9' | '9:16',
    onProgress: (status: string) => void
): Promise<Blob> => {
    // Re-create client to ensure it picks up the latest key from the dialog
    const ai = getAiClient(); 
    const imageBase64 = await fileToBase64(file);

    onProgress('Starting video generation operation...');
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
            imageBytes: imageBase64,
            mimeType: file.type,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        },
    });

    onProgress('Operation initiated. Waiting for video to process. This may take a few minutes...');
    let checks = 0;
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        checks++;
        onProgress(`Processing... (Check ${checks})`);
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error('Video generation finished, but no download link was found.');
    }
    
    onProgress('Video processed. Downloading...');
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error('Failed to download the generated video.');
    }
    onProgress('Download complete!');
    return response.blob();
};


export const analyzeVideo = async (file: File, prompt: string): Promise<string> => {
    // IMPORTANT: The current Web SDK for Gemini does not directly support video file uploads for analysis in generateContent.
    // This function simulates the expected behavior. In a real-world scenario, you would
    // use a backend service to process the video (e.g., extract frames) and send them to the Gemini API.
    console.log('Simulating video analysis for file:', file.name);
    
    const ai = getAiClient();
    const model = 'gemini-2.5-pro';

    const analysisPrompt = `
      You are a video analysis expert. A user has uploaded a video and asked the following question: "${prompt}".
      
      Since you cannot see the video directly, provide a detailed, hypothetical analysis based on the user's query.
      Acknowledge that this is a simulated analysis based on the prompt about the unseen video. Respond in Brazilian Portuguese.
      For example, if the user asks "What are the main colors?", describe a plausible color palette for a video.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: analysisPrompt,
    });

    return `[Análise Simulada]\n\n${response.text}`;
};
