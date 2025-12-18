import React, { useState, useEffect, useRef } from 'react';
import { Mic, Trash2, ChevronLeft } from 'lucide-react';

interface MicButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

const MicButton: React.FC<MicButtonProps> = ({ onResult, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [duration, setDuration] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [recognition, setRecognition] = useState<any>(null);
  
  const timerRef = useRef<number | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const CANCEL_THRESHOLD_X = -100; // Pixels to drag left to cancel (WhatsApp style)

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
        setDuration(0);
        setDragX(0);
        
        // Start timer
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      };
      
      rec.onend = () => {
        setIsListening(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      rec.onresult = (event: any) => {
        // Logic: Only process if the user didn't slide to cancel
        if (!isCancelled) {
          const transcript = event.results[event.results.length - 1][0].transcript;
          if (transcript) {
            onResult(transcript);
          }
        }
      };

      rec.onerror = (event: any) => {
        console.error("Erro no reconhecimento:", event.error);
        setIsListening(false);
      };

      setRecognition(rec);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onResult, isCancelled]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!recognition) {
      alert("Seu navegador não suporta reconhecimento de voz.");
      return;
    }
    
    startPos.current = { x: e.clientX, y: e.clientY };
    setIsCancelled(false);
    setDragX(0);
    
    try {
      recognition.start();
      if ('vibrate' in navigator) navigator.vibrate(50);
    } catch (err) {
      console.warn("Reconhecimento já está ativo", err);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isListening && startPos.current) {
      const deltaX = e.clientX - startPos.current.x;
      
      // WhatsApp style: drag to the LEFT to cancel
      if (deltaX < 0) {
        setDragX(deltaX);
        
        // If dragged past threshold, mark as cancelled
        if (deltaX < CANCEL_THRESHOLD_X) {
          if (!isCancelled) {
            setIsCancelled(true);
            if ('vibrate' in navigator) navigator.vibrate([30, 30]);
          }
        } else {
          setIsCancelled(false);
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
    startPos.current = null;
    // Note: the onresult callback handles the actual text submission if not cancelled
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Recording Overlay Bar (Matches Image 2) */}
      {isListening && (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center px-6 z-[200] animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center w-full max-w-md mx-auto gap-4">
            
            {/* Red Pulsing Mic Icon */}
            <div className="text-red-500 animate-pulse">
              <Mic size={28} fill="currentColor" />
            </div>
            
            {/* Timer */}
            <span className="text-xl font-medium text-gray-700 w-16">
              {formatTime(duration)}
            </span>

            {/* Slide to Cancel UI with Animation */}
            <div 
              className="flex-1 flex justify-center items-center gap-1 transition-opacity duration-200"
              style={{ 
                transform: `translateX(${dragX * 0.4}px)`,
                opacity: Math.max(0, 1 - Math.abs(dragX / 150))
              }}
            >
              <span className={`text-gray-400 font-medium ${isCancelled ? 'text-red-500 font-bold' : ''}`}>
                {isCancelled ? 'Cancelado!' : 'Deslize para cancelar'}
              </span>
              {!isCancelled && <ChevronLeft size={20} className="text-gray-300 animate-pulse" />}
            </div>

            {/* Trash icon that lights up when cancelled */}
            <div className={`transition-all duration-300 ${isCancelled ? 'scale-150 text-red-600' : 'text-gray-200'}`}>
              <Trash2 size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Main Mic Trigger Button */}
      <button 
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        className={`relative z-[201] p-3 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg select-none touch-none ${
          isListening 
            ? 'bg-red-500 text-white scale-125 ring-4 ring-red-100' 
            : 'bg-orange-100 text-orange-500 hover:bg-orange-200 active:scale-90'
        } ${className}`}
        style={{ touchAction: 'none' }}
        title="Segure para gravar"
      >
        <Mic size={isListening ? 24 : 20} />
      </button>

      {/* Behind-the-button Ripple when active */}
      {isListening && (
        <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20 z-[199]" />
      )}
    </div>
  );
};

export default MicButton;