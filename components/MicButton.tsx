import React, { useState, useEffect, useRef } from 'react';
import { Mic, Trash2, ChevronLeft, Send, X } from 'lucide-react';

interface MicButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

const MicButton: React.FC<MicButtonProps> = ({ onResult, className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [duration, setDuration] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [recognition, setRecognition] = useState<any>(null);
  const [transcript, setTranscript] = useState('');

  const timerRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const CANCEL_THRESHOLD_X = -80; 

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.lang = 'pt-BR';
      rec.continuous = true;
      rec.interimResults = true; // Enabled interim results to show live feedback in locked mode
      
      rec.onstart = () => {
        setIsListening(true);
        setIsCancelled(false);
        setDuration(0);
        setDragX(0);
        setTranscript('');
        
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
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        // Save live transcript for locked mode feedback
        if (event.results[event.results.length - 1][0].transcript) {
          setTranscript(event.results[event.results.length - 1][0].transcript);
        }

        if (finalTranscript && !isCancelled) {
          // If we are holding, we only submit on PointerUp. 
          // In locked mode, we might wait for the Send button.
          // For simplicity, we'll buffer the text and onResult when stop is called.
        }
      };

      rec.onerror = (event: any) => {
        console.error("Erro no reconhecimento:", event.error);
        setIsListening(false);
        setIsLocked(false);
      };

      setRecognition(rec);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, [isCancelled]);

  const startRecording = () => {
    try {
      recognition.start();
      if ('vibrate' in navigator) navigator.vibrate(50);
    } catch (err) {
      console.warn("Reconhecimento já está ativo", err);
    }
  };

  const stopAndSubmit = () => {
    if (recognition) {
      recognition.stop();
      // Use the last captured transcript
      if (transcript && !isCancelled) {
        onResult(transcript);
      }
    }
    setIsLocked(false);
    setIsListening(false);
  };

  const cancelRecording = () => {
    setIsCancelled(true);
    if (recognition) recognition.stop();
    setIsLocked(false);
    setIsListening(false);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!recognition) return;
    if (isLocked) return; // Ignore if already in locked mode

    startPos.current = { x: e.clientX, y: e.clientY };
    setIsCancelled(false);
    
    // Timer to detect if it's a tap or a hold
    holdTimerRef.current = window.setTimeout(() => {
      // It's a hold
      startRecording();
    }, 200);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
      
      // If it was a short tap (PointerUp before the 200ms hold timer)
      if (!isListening && !isLocked) {
        setIsLocked(true);
        startRecording();
        return;
      }
    }

    // If it was a hold and not locked, submit on release
    if (isListening && !isLocked) {
      stopAndSubmit();
    }
    
    startPos.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isListening && !isLocked && startPos.current) {
      const deltaX = e.clientX - startPos.current.x;
      if (deltaX < 0) {
        setDragX(deltaX);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* 1. HOLDING MODE OVERLAY (Matches Slide to Cancel Image) */}
      {isListening && !isLocked && (
        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center px-6 z-[200] animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center w-full max-w-md mx-auto gap-4">
            <div className="text-red-500 animate-pulse">
              <Mic size={28} fill="currentColor" />
            </div>
            <span className="text-xl font-medium text-gray-700 w-16">
              {formatTime(duration)}
            </span>
            <div className="flex-1 flex justify-center items-center gap-1" style={{ transform: `translateX(${dragX * 0.3}px)` }}>
              <span className={`text-gray-400 font-medium ${isCancelled ? 'text-red-500' : ''}`}>
                {isCancelled ? 'Cancelado!' : 'Deslize para cancelar'}
              </span>
              {!isCancelled && <ChevronLeft size={20} className="text-gray-300 animate-pulse" />}
            </div>
            <div className={`${isCancelled ? 'text-red-600' : 'text-gray-200'}`}>
              <Trash2 size={24} />
            </div>
          </div>
        </div>
      )}

      {/* 2. LOCKED MODE OVERLAY (Matches the specific image with Trash | Mic | Send) */}
      {isLocked && isListening && (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-white border-t border-gray-100 flex items-center px-4 z-[200] animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center w-full max-w-md mx-auto justify-between gap-4">
            
            {/* Trash Button */}
            <button 
              onClick={cancelRecording}
              className="p-4 text-gray-600 hover:text-red-500 transition-colors"
            >
              <Trash2 size={32} />
            </button>

            {/* Central UI with pulsing mic and timer */}
            <div className="flex flex-col items-center">
               <div className="text-red-500 animate-pulse mb-1">
                 <Mic size={32} fill="currentColor" />
               </div>
               <span className="text-sm font-bold text-gray-500">{formatTime(duration)}</span>
            </div>

            {/* Send Button */}
            <button 
              onClick={stopAndSubmit}
              className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all transform active:scale-95"
            >
              <Send size={28} />
            </button>

          </div>
        </div>
      )}

      {/* MAIN TRIGGER BUTTON */}
      {!isLocked && (
        <button 
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerMove={handlePointerMove}
          className={`relative z-[201] p-3 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg select-none touch-none ${
            isListening 
              ? 'bg-red-500 text-white scale-110' 
              : 'bg-orange-50 text-orange-500 hover:bg-orange-100 active:scale-90'
          } ${className}`}
          style={{ touchAction: 'none' }}
          title="Toque ou Segure"
        >
          <Mic size={isListening ? 24 : 20} />
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30 -z-10" />
          )}
        </button>
      )}
    </div>
  );
};

export default MicButton;