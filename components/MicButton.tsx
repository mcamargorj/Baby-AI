import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface MicButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

const MicButton: React.FC<MicButtonProps> = ({ onResult, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'pt-BR';
      rec.continuous = false;
      rec.interimResults = false;
      
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
            onResult(transcript);
        }
      };
      rec.onerror = (event: any) => {
        console.error("Erro no reconhecimento de voz:", event.error);
        setIsListening(false);
      };
      setRecognition(rec);
    }
  }, [onResult]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Desculpe, seu navegador não suporta reconhecimento de voz.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (
    <button 
      type="button"
      onClick={toggleListening}
      className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center shadow-sm ${
        isListening 
          ? 'bg-red-500 text-white animate-pulse shadow-red-300 shadow-md scale-110 ring-2 ring-red-300' 
          : 'bg-orange-100 text-orange-500 hover:bg-orange-200 hover:scale-105'
      } ${className}`}
      title={isListening ? "Parar de ouvir" : "Falar"}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
};

export default MicButton;