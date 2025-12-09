import React, { ReactNode } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  themeColor?: string; // e.g., 'text-purple-600'
  isMusicPlaying: boolean;
  toggleMusic: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, isMusicPlaying, toggleMusic }) => {
  return (
    <div className="min-h-screen w-full animate-rainbow flex items-center justify-center p-4 font-sans selection:bg-orange-100">
      {/* Container Principal - Futuristic Glass/Soft UI 
          Changed min-h-[680px] to h-[85vh] max-h-[850px] to force internal scrolling
      */}
      <div className="w-full max-w-md bg-[#FFFBF5]/95 backdrop-blur-xl rounded-[3rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.15)] relative h-[85vh] max-h-[850px] min-h-[600px] flex flex-col transition-all duration-300 border-[8px] border-white ring-1 ring-black/5 overflow-hidden">
        
        {/* Top Shine Reflection for Glass Effect */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-0 opacity-60" />

        {/* Audio Toggle Button - Embedded Neumorphic Look */}
        <button 
          onClick={toggleMusic}
          className={`
            cursor-pointer hover:scale-105 active:scale-95
            absolute top-6 right-6 z-50 w-12 h-12 rounded-2xl transition-all duration-300 ease-in-out
            flex items-center justify-center
            ${isMusicPlaying 
              ? 'text-orange-500 shadow-[2px_2px_10px_rgba(0,0,0,0.1),-2px_-2px_10px_rgba(255,255,255,0.8)] bg-gradient-to-br from-orange-50 to-white translate-y-[-1px]'
              : 'text-gray-400 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.2),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] bg-[#FFFBF5]'
            }
          `}
          title={isMusicPlaying ? "Silenciar" : "Tocar música"}
        >
          {isMusicPlaying ? (
            <Volume2 size={20} strokeWidth={2.5} className="drop-shadow-sm" />
          ) : (
            <VolumeX size={20} strokeWidth={2.5} className="opacity-50" />
          )}
        </button>

        <div className="flex-1 p-8 flex flex-col relative z-10 overflow-hidden">
           {children}
        </div>
        
      </div>
    </div>
  );
};

export default Layout;