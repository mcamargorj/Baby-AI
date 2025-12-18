import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, XCircle } from 'lucide-react';

interface MicButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

const MicButton: React.FC<MicButtonProps> = ({ onResult, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const CANCEL_THRESHOLD = 60; // Pixels to drag up to cancel

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'pt-BR';
      rec.continuous = true;
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsListening(true);
        setIsCancelled(false);
      };
      
      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        // Only process result if NOT cancelled
        if (!isCancelled) {
          const transcript = event.results[event.results.length - 1][0].transcript;
          if (transcript) {
            onResult(transcript);
          }
        }
      };

      rec.onerror = (event: any) => {
        console.error("Erro no reconhecimento de voz:", event.error);
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onResult, isCancelled]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!recognition) {
      alert("Navegador não suporta reconhecimento de voz.");
      return;
    }
    
    // Set start position for drag tracking
    startPos.current = { x: e.clientX, y: e.clientY };
    setIsCancelled(false);
    
    try {
      recognition.start();
      // Vibrate if supported
      if ('vibrate' in navigator) navigator.vibrate(50);
    } catch (err) {
      console.warn("Recognition already started or error:", err);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (recognition && isListening) {
      recognition.stop();
    }
    startPos.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isListening && startPos.current) {
      const distY = startPos.current.y - e.clientY;
      
      if (distY > CANCEL_THRESHOLD) {
        if (!isCancelled) {
          setIsCancelled(true);
          if ('vibrate' in navigator) navigator.vibrate([30, 30]);
        }
      } else {
        setIsCancelled(false);
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Cancel Hint Overlay */}
      {isListening && (
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-2 py-1 rounded-full transition-all duration-300 pointer-events-none z-50 ${
          isCancelled ? 'bg-red-500 text-white animate-bounce' : 'bg-gray-800/80 text-white animate-pulse'
        }`}>
          {isCancelled ? 'SOLTE PARA CANCELAR' : 'ARRASTE PARA CIMA CANCELAR'}
        </div>
      )}

      <button 
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg select-none touch-none ${
          isListening 
            ? (isCancelled 
                ? 'bg-gray-400 text-white scale-90 opacity-50' 
                : 'bg-red-500 text-white animate-pulse scale-125 ring-4 ring-red-200 z-50') 
            : 'bg-orange-100 text-orange-500 hover:bg-orange-200'
        } ${className}`}
        style={{ touchAction: 'none' }}
        title="Segure para falar"
      >
        {isListening ? (isCancelled ? <XCircle size={24} /> : <Mic size={24} />) : <Mic size={20} />}
      </button>

      {/* Recording Ring Animation */}
      {isListening && !isCancelled && (
        <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20 -z-10" />
      )}
    </div>
  );
};

export default MicButton;