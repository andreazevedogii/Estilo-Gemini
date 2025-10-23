import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { Message } from '../types';
import { LoaderIcon } from './icons';

// Audio decoding/encoding functions must be defined at the top level or imported.
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

const AIAssistant: React.FC = () => {
    const [mode, setMode] = useState<'Live' | 'Text'>('Text');

    return (
        <div className="container mx-auto max-w-4xl">
             <div className="text-center mb-10">
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Assistente IA</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-text-secondary">Converse em tempo real ou obtenha respostas de texto detalhadas.</p>
            </div>
            <div className="bg-secondary rounded-2xl shadow-lg p-6">
                <div className="flex justify-center border-b border-gray-300 mb-4">
                    <button onClick={() => setMode('Live')} className={`px-4 py-2 font-semibold ${mode === 'Live' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'}`}>Conversa ao Vivo</button>
                    <button onClick={() => setMode('Text')} className={`px-4 py-2 font-semibold ${mode === 'Text' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary'}`}>Chat de Texto</button>
                </div>
                {mode === 'Live' ? <LiveChat /> : <TextChat />}
            </div>
        </div>
    );
};

// --- Live Chat Component ---
const LiveChat: React.FC = () => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [status, setStatus] = useState('Inativo');
    const [transcription, setTranscription] = useState<{user: string, model: string}[]>([]);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

    const startSession = async () => {
        try {
            setStatus('Solicitando permissões...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            setStatus('Iniciando sessão...');

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            let nextStartTime = 0;
            let currentInputTranscription = '';
            let currentOutputTranscription = '';
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setStatus('Conectado. Comece a falar.');
                        setIsSessionActive(true);
                        const source = audioContextRef.current!.createMediaStreamSource(stream);
                        scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscription += message.serverContent.outputTranscription.text;
                        }
                        if (message.serverContent?.turnComplete) {
                            setTranscription(prev => [...prev, {user: currentInputTranscription, model: currentOutputTranscription}]);
                            currentInputTranscription = '';
                            currentOutputTranscription = '';
                        }
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContext.destination);
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                        }
                    },
                    onclose: () => {
                        setStatus('Sessão encerrada.');
                        setIsSessionActive(false);
                    },
                    onerror: (e) => {
                        console.error('Erro na sessão:', e);
                        setStatus(`Erro: ${e}`);
                        setIsSessionActive(false);
                    },
                },
            });

        } catch (error) {
            console.error('Falha ao iniciar a sessão:', error);
            setStatus('Erro: Não foi possível iniciar a sessão. Verifique as permissões.');
        }
    };

    const stopSession = () => {
        sessionPromiseRef.current?.then((session) => session.close());
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        audioContextRef.current?.close();
        setIsSessionActive(false);
        setStatus('Inativo');
    };
    
    useEffect(() => {
        return () => {
            if (isSessionActive) stopSession();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSessionActive]);

    return (
        <div>
            <div className="text-center mb-4">
                <button onClick={isSessionActive ? stopSession : startSession} className={`px-6 py-3 font-bold rounded-xl ${isSessionActive ? 'bg-red-600 hover:bg-red-700' : 'bg-accent hover:bg-accent-hover'} text-white`}>
                    {isSessionActive ? 'Parar Sessão' : 'Iniciar Chat ao Vivo'}
                </button>
                <p className="mt-2 text-sm text-text-secondary">Status: {status}</p>
            </div>
            <div className="h-64 bg-primary p-4 rounded-xl overflow-y-auto">
                {transcription.map((t, i) => (
                    <div key={i} className="mb-2">
                        <p><strong className="text-accent">Você:</strong> {t.user}</p>
                        <p><strong className="text-blue-500">IA:</strong> {t.model}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Text Chat Component ---
const TextChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatMode, setChatMode] = useState<'Fast' | 'Thinking'>('Fast');
    const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY as string }));

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const newUserMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const modelName = chatMode === 'Thinking' ? 'gemini-2.5-pro' : 'gemini-flash-lite-latest';
            const config = chatMode === 'Thinking' ? { thinkingConfig: { thinkingBudget: 32768 } } : {};

            const response = await aiRef.current.models.generateContent({
                model: modelName,
                contents: input,
                config,
            });
            
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.text,
                sender: 'bot',
                mode: chatMode,
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Desculpe, encontrei um erro.",
                sender: 'bot',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-center mb-4">
                <div className="bg-primary p-1 rounded-lg flex space-x-1">
                    <button onClick={() => setChatMode('Fast')} className={`px-4 py-1 text-sm rounded-md ${chatMode === 'Fast' ? 'bg-accent text-white' : 'text-text-secondary'}`}>Rápido</button>
                    <button onClick={() => setChatMode('Thinking')} className={`px-4 py-1 text-sm rounded-md ${chatMode === 'Thinking' ? 'bg-accent text-white' : 'text-text-secondary'}`}>Modo Pensante</button>
                </div>
            </div>
            <div className="h-80 bg-primary p-4 rounded-xl overflow-y-auto mb-4 flex flex-col space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-xl ${msg.sender === 'user' ? 'bg-accent text-white' : 'bg-gray-200 text-text-primary'}`}>
                           <p>{msg.text}</p>
                           {msg.sender === 'bot' && msg.mode && <p className="text-xs text-gray-500 mt-1">{msg.mode} Mode</p>}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><LoaderIcon className="w-6 h-6 animate-spin text-accent"/></div>}
            </div>
            <div className="flex">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Digite sua mensagem..."
                    className="flex-grow p-3 bg-primary border-2 border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button onClick={handleSend} disabled={isLoading} className="bg-accent px-6 py-3 text-white font-semibold rounded-r-xl hover:bg-accent-hover disabled:bg-gray-500">
                    Enviar
                </button>
            </div>
        </div>
    );
};

export default AIAssistant;
