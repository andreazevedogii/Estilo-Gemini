import React, { useRef } from 'react';

interface ImageInputProps {
  onFileSelect: (file: File | null) => void;
  previewUrl: string | null;
  label: string;
}

const ImageInput: React.FC<ImageInputProps> = ({ onFileSelect, previewUrl, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
      <div
        onClick={handleClick}
        className="cursor-pointer aspect-square bg-primary rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-accent hover:text-accent transition-colors"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
        ) : (
          <div className="text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="mt-2 block text-sm">Clique para enviar</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageInput;