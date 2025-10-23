export enum Page {
  TryOn = 'Provador Virtual',
  ImageStudio = 'Estúdio de Imagem',
  VideoLab = 'Laboratório de Vídeo',
  AIAssistant = 'Assistente IA',
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  mode?: 'Fast' | 'Thinking';
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";