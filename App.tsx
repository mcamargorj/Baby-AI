import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Brain, MessageCircle, LogOut, ArrowLeft, Send, BookOpen, RefreshCw, Wand2, Utensils, Heart, Moon, Bath, Apple, Candy, Milk, Zap } from 'lucide-react';
import Layout from './components/Layout';
import Button from './components/Button';
import Input from './components/Input';
import MicButton from './components/MicButton';
import { AppView, BabyState, BabyGender, ChatMessage } from './types';
import { saveBaby, loadBaby, createInitialBaby, deleteBaby, validateUser, registerUser } from './services/storageService';
import { geminiService } from './services/geminiService';
import { getLevelTitle, getAgeInDays } from './constants';

const musicSrc = "https://cdn.pixabay.com/audio/2022/10/18/audio_31c2730e64.mp3";

// --- Extracted Components to prevent re-render focus loss ---

const LogoWithParticles = ({ videoError, setVideoError, customImage }: { videoError: boolean, setVideoError: (e: boolean) => void, customImage?: string }) => (
  <div className="relative w-44 h-44 flex items-center justify-center my-4">
      <div className="particle-ring" style={{ animationDuration: '10s' }}>
          <div className="particle-dot bg-blue-400" style={{ top: '0%', left: '50%' }}></div>
          <div className="particle-dot bg-green-400" style={{ top: '15%', left: '85%' }}></div>
          <div className="particle-dot bg-yellow-400" style={{ top: '50%', left: '100%', transform: 'translate(-50%, -50%)' }}></div>
          <div className="particle-dot bg-orange-400" style={{ top: '85%', left: '85%' }}></div>
          <div className="particle-dot bg-red-400" style={{ top: '100%', left: '50%', transform: 'translate(-50%, -100%)' }}></div>
          <div className="particle-dot bg-pink-400" style={{ top: '85%', left: '15%' }}></div>
          <div className="particle-dot bg-purple-400" style={{ top: '50%', left: '0%', transform: 'translate(-50%, -50%)' }}></div>
          <div className="particle-dot bg-indigo-400" style={{ top: '15%', left: '15%' }}></div>
      </div>
      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 blur-sm"></div>
      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-inner bg-black z-10">
          {customImage ? (
             <img 
               src={customImage} 
               alt="Baby Avatar" 
               className="w-full h-full object-cover"
             />
          ) : !videoError ? (
              <video 
              src="https://babyai.pythonanywhere.com/static/baby_ai.mp4" 
              className="w-full h-full object-cover"
              autoPlay 
              loop 
              muted 
              playsInline
              onError={() => setVideoError(true)}
              />
          ) : (
              <img 
              src="https://img.freepik.com/free-vector/cute-baby-boy-profile-cartoon_18591-56161.jpg?w=740&t=st=1709400000~exp=1709400600~hmac=6e5c898" 
              alt="Baby AI Logo" 
              className="w-full h-full rounded-full object-cover"
              />
          )}
      </div>
  </div>
);

const LoginView = ({ username, setUsername, password, setPassword, onLogin, onGoToSignup, videoError, setVideoError }: any) => (
  <div className="flex flex-col items-center justify-center h-full space-y-6 animate-fade-in py-4">
    <LogoWithParticles videoError={videoError} setVideoError={setVideoError} />
    <div className="text-center space-y-1">
      <h1 className="text-3xl font-display font-bold text-blue-600 flex items-center justify-center gap-2 drop-shadow-sm">
        <span className="text-blue-700">Login</span> <span className="text-lime-500">Baby AI</span>
      </h1>
      <p className="text-gray-500 text-sm font-medium">Entre para brincar e ensinar seu Baby AI! 🍼</p>
    </div>
    <div className="w-full space-y-4 max-w-xs">
      <Input 
        placeholder="Seu nome (Usuário)" 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="bg-blue-50 border-orange-300"
      />
      <Input 
          placeholder="Sua senha" 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-blue-50 border-orange-300"
      />
    </div>
    <div className="w-full max-w-xs space-y-4 pt-2">
      <Button fullWidth onClick={onLogin}>
        Entrar 🚀
      </Button>
      <div className="flex justify-center">
          <button onClick={onGoToSignup} className="text-blue-800 font-bold flex items-center justify-center gap-2 text-sm hover:underline hover:text-blue-600 transition-colors">
          <span className="text-green-500 text-lg">🔰</span> Cadastre-se e crie seu Baby AI!
          </button>
      </div>
    </div>
  </div>
);

const SignupView = ({ 
  creatorName, setCreatorName, 
  signupPassword, setSignupPassword, 
  babyName, setBabyName, 
  signupGender, setSignupGender, 
  onCreate, onBack,
  isGenerating
}: any) => {

  const getGenderButtonStyle = (g: BabyGender) => {
    const isSelected = signupGender === g;
    return `flex-1 py-2 rounded-xl text-sm font-bold border-b-4 transition-all ${
      isSelected 
        ? 'bg-orange-500 text-white border-orange-700 transform scale-105' 
        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
    }`;
  };

  return (
    <div className="flex flex-col items-center h-full pt-2 animate-fade-in w-full">
      <div className="text-center mb-6">
          <div className="inline-block p-2">
              <Sparkles className="text-purple-600 w-8 h-8 inline-block mr-2 animate-pulse" />
          </div>
          <h1 className="text-2xl font-display font-bold text-center leading-tight inline-block">
          <span className="text-purple-700">Vamos</span> <span className="text-green-500">criar</span> <span className="text-orange-500">seu Baby AI!</span>
          </h1>
          <p className="text-gray-500 text-center text-xs mt-2 px-8">Preencha os campos abaixo para dar vida ao seu amigo virtual 🍼</p>
      </div>
      <div className="w-full max-w-xs space-y-3 flex-1 overflow-y-auto pb-4 px-1 scrollbar-thin">
        <Input 
          placeholder="Escolha um Usuário" 
          value={creatorName} 
          onChange={e => setCreatorName(e.target.value)} 
          disabled={isGenerating}
        />
        <Input 
          placeholder="Escolha uma Senha" 
          type="password"
          value={signupPassword}
          onChange={e => setSignupPassword(e.target.value)}
          disabled={isGenerating}
        />
        <div className="py-1"></div>
        <Input 
          placeholder="Nome do seu Baby AI" 
          value={babyName} 
          onChange={e => setBabyName(e.target.value)} 
          disabled={isGenerating}
        />
        <div>
          <label className="text-sm font-bold text-gray-600 block mb-2 pl-1">Gênero</label>
          <div className="flex gap-2">
            {[BabyGender.BOY, BabyGender.GIRL, BabyGender.NEUTRAL].map((g) => (
              <button
                key={g}
                onClick={() => !isGenerating && setSignupGender(g)}
                disabled={isGenerating}
                className={getGenderButtonStyle(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full max-w-xs space-y-3 pt-2 mt-auto">
        <Button fullWidth onClick={onCreate} variant="success" disabled={isGenerating}>
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <Wand2 className="animate-spin" size={18} /> Gerando visual único...
            </span>
          ) : 'Nascer Baby AI! 🐣'}
        </Button>
        <button 
          onClick={onBack}
          disabled={isGenerating}
          className="w-full text-center text-gray-400 text-sm font-bold hover:text-gray-600"
        >
          Voltar para Login
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  // Global State
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [baby, setBaby] = useState<BabyState | null>(null);
  const [currentUser, setCurrentUser] = useState<string>(''); // Track logged user
  
  // Audio State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup State
  const [creatorName, setCreatorName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [babyName, setBabyName] = useState('');
  const [signupGender, setSignupGender] = useState<BabyGender>(BabyGender.GIRL);
  const [isGenerating, setIsGenerating] = useState(false); // New loading state
  
  // Video State
  const [videoError, setVideoError] = useState(false);
  
  // Teaching State
  const [teachTopic, setTeachTopic] = useState('');
  const [teachContent, setTeachContent] = useState('');
  const [isTeaching, setIsTeaching] = useState(false);

  // Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Rebirth State
  const [rebirthName, setRebirthName] = useState('');
  const [rebirthGender, setRebirthGender] = useState<BabyGender>(BabyGender.NEUTRAL);

  // Interaction State
  const [isInteracting, setIsInteracting] = useState(false);

  // Initialize - removed auto-load on mount because we need login now
  useEffect(() => {
    // Only scroll chat if in chat view
  }, []);

  // Update scroll on chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, view]);

  // Audio Control
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsMusicPlaying(true))
            .catch((error) => {
              console.log("Audio autoplay blocked or failed:", error);
              // Do not set error state, let user try again by clicking
              setIsMusicPlaying(false); 
            });
        }
      }
    }
  };

  const tryStartMusic = () => {
    if (audioRef.current && !isMusicPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsMusicPlaying(true))
          .catch(() => {
              // Silently fail for autoplay, user can toggle manually
          });
      }
    }
  };

  // Actions
  const handleLogin = () => {
    if (!username || !password) {
        alert("Por favor, digite usuário e senha.");
        return;
    }

    const isValid = validateUser(username, password);
    
    if (isValid) {
      tryStartMusic();
      const savedBaby = loadBaby(username);
      
      setCurrentUser(username);
      if (savedBaby) {
        setBaby(savedBaby);
        setView(AppView.DASHBOARD);
      } else {
        // User exists but has no baby? Edge case, treat as new
        alert("Usuário encontrado, mas sem Baby AI. Crie um novo.");
        // Redirect to create baby logic or handle gracefully. 
        // For now, let's assume if user exists they might have deleted baby.
        setCreatorName(username);
        setSignupPassword(password); 
        setView(AppView.SIGNUP);
      }
    } else {
      alert("Usuário ou senha incorretos! Se não tem conta, cadastre-se.");
    }
  };

  const handleCreateBaby = async () => {
    if (!creatorName || !babyName || !signupPassword) {
        alert("Preencha todos os campos!");
        return;
    }
    
    // Register User first
    const success = registerUser({ username: creatorName, password: signupPassword });
    if (!success) {
      alert("Este nome de usuário já existe. Tente outro.");
      return;
    }

    setIsGenerating(true); // Start loading avatar
    tryStartMusic();

    try {
       // Generate unique avatar
       const avatar = await geminiService.generateBabyAvatar(signupGender);
       
       const newBaby = createInitialBaby(babyName, signupGender, creatorName, avatar);
       setBaby(newBaby);
       saveBaby(newBaby); 
       setCurrentUser(creatorName);
       setView(AppView.DASHBOARD);
    } catch (e) {
       console.error("Error creating baby:", e);
       alert("Erro ao criar o baby. Tente novamente.");
    } finally {
       setIsGenerating(false);
    }
  };

  const handleTeach = async () => {
    if (!baby || !teachTopic || !teachContent) return;
    setIsTeaching(true);

    const { reply, xpGained, memorySummary } = await geminiService.teachBaby(teachTopic, teachContent);
    
    // Update baby state with new XP and Memory
    const currentMemory = baby.memory || [];
    const updatedMemory = memorySummary ? [...currentMemory, memorySummary] : currentMemory;

    const updatedBaby: BabyState = {
      ...baby,
      xp: baby.xp + xpGained,
      level: getLevelTitle(baby.xp + xpGained),
      mood: 'Feliz',
      memory: updatedMemory
    };
    
    setBaby(updatedBaby);
    saveBaby(updatedBaby);
    
    geminiService.speak(reply, updatedBaby.gender);

    setTeachTopic('');
    setTeachContent('');
    setIsTeaching(false);
    
    let alertMsg = `Baby aprendeu! XP +${xpGained}\nBaby: "${reply}"`;
    if (memorySummary) alertMsg += `\n(Guardado na memória)`;
    alert(alertMsg);
    
    setView(AppView.DASHBOARD);
  };

  const handleChat = async () => {
    if (!baby || !chatMessage.trim()) return;
    
    const newUserMsg: ChatMessage = { role: 'user', text: chatMessage, timestamp: Date.now() };
    setChatHistory(prev => [...prev, newUserMsg]);
    setChatMessage('');
    setIsChatting(true);

    const responseText = await geminiService.chatWithBaby(
      baby.name,
      getAgeInDays(baby.birthDate),
      baby.level,
      chatHistory.map(m => ({ role: m.role, text: m.text })),
      newUserMsg.text,
      baby.memory || []
    );

    const newAiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
    setChatHistory(prev => [...prev, newAiMsg]);
    setIsChatting(false);

    geminiService.speak(responseText, baby.gender);
  };

  const handleRebirth = async () => {
    if(!baby || !currentUser) return;
    
    deleteBaby(currentUser);
    
    const avatar = await geminiService.generateBabyAvatar(rebirthGender);
    const newBaby = createInitialBaby(rebirthName, rebirthGender, currentUser, avatar);
    
    setBaby(newBaby);
    saveBaby(newBaby);
    setView(AppView.DASHBOARD);
  };

  const handleFeed = async (item: string, hungerRestore: number) => {
    if (!baby) return;
    setIsInteracting(true);
    
    const { reply } = await geminiService.reactToCareAction('feed', item, baby.name);
    
    const newHunger = Math.min(100, (baby.hunger || 50) + hungerRestore);
    const newMood = newHunger > 80 ? 'Feliz' : 'Com fome';
    
    const updatedBaby: BabyState = {
       ...baby,
       hunger: newHunger,
       mood: newMood as any,
       xp: baby.xp + 5 // Small XP for care
    };
    setBaby(updatedBaby);
    saveBaby(updatedBaby);
    
    geminiService.speak(reply, updatedBaby.gender);
    alert(`${baby.name}: "${reply}"`);
    setIsInteracting(false);
    setView(AppView.DASHBOARD);
  };

  const handleCare = async (item: string, energyRestore: number, moodSet?: string) => {
    if (!baby) return;
    setIsInteracting(true);
    
    const { reply } = await geminiService.reactToCareAction('care', item, baby.name);
    
    const newEnergy = Math.min(100, (baby.energy || 50) + energyRestore);
    
    const updatedBaby: BabyState = {
       ...baby,
       energy: newEnergy,
       mood: (moodSet || 'Feliz') as any,
       xp: baby.xp + 5
    };
    setBaby(updatedBaby);
    saveBaby(updatedBaby);
    
    geminiService.speak(reply, updatedBaby.gender);
    alert(`${baby.name}: "${reply}"`);
    setIsInteracting(false);
    setView(AppView.DASHBOARD);
  };

  const appendVoiceText = (current: string, newText: string) => {
    return current ? `${current} ${newText}` : newText;
  };

  // Render Logic
  const renderContent = () => {
    switch(view) {
      case AppView.LOGIN:
        return (
          <LoginView 
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            onLogin={handleLogin}
            onGoToSignup={() => setView(AppView.SIGNUP)}
            videoError={videoError}
            setVideoError={setVideoError}
          />
        );

      case AppView.SIGNUP:
        return (
          <SignupView 
            creatorName={creatorName}
            setCreatorName={setCreatorName}
            signupPassword={signupPassword}
            setSignupPassword={setSignupPassword}
            babyName={babyName}
            setBabyName={setBabyName}
            signupGender={signupGender}
            setSignupGender={setSignupGender}
            onCreate={handleCreateBaby}
            onBack={() => setView(AppView.LOGIN)}
            isGenerating={isGenerating}
          />
        );

      case AppView.FEED:
        return (
          <div className="flex flex-col h-full animate-fade-in space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setView(AppView.DASHBOARD)} className="text-gray-500 hover:text-orange-500 transition-colors">
                  <ArrowLeft size={28} />
                </button>
                <h2 className="text-2xl font-display font-bold text-orange-500 flex items-center gap-2">
                   <Utensils size={24} /> Hora do Lanche
                </h2>
             </div>
             <p className="text-center text-gray-500 mb-4">O que vamos comer hoje?</p>
             
             <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto p-2">
                <button onClick={() => handleFeed('Leite', 10)} disabled={isInteracting} className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all transform active:scale-95">
                    <Milk className="text-blue-500 w-10 h-10" />
                    <span className="font-bold text-blue-700">Leite</span>
                    <span className="text-xs text-blue-400">+10 Fome</span>
                </button>
                <button onClick={() => handleFeed('Maçã', 15)} disabled={isInteracting} className="bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all transform active:scale-95">
                    <Apple className="text-red-500 w-10 h-10" />
                    <span className="font-bold text-red-700">Maçã</span>
                    <span className="text-xs text-red-400">+15 Fome</span>
                </button>
                <button onClick={() => handleFeed('Doce', 5)} disabled={isInteracting} className="bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all transform active:scale-95">
                    <Candy className="text-pink-500 w-10 h-10" />
                    <span className="font-bold text-pink-700">Doce</span>
                    <span className="text-xs text-pink-400">+5 Fome</span>
                </button>
                <button onClick={() => handleFeed('Brócolis', 20)} disabled={isInteracting} className="bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all transform active:scale-95">
                    <div className="text-4xl">🥦</div>
                    <span className="font-bold text-green-700">Brócolis</span>
                    <span className="text-xs text-green-400">+20 Fome</span>
                </button>
             </div>
             {isInteracting && <p className="text-center text-orange-500 font-bold animate-pulse">Nham nham...</p>}
          </div>
        );

      case AppView.CARE:
        return (
          <div className="flex flex-col h-full animate-fade-in space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setView(AppView.DASHBOARD)} className="text-gray-500 hover:text-purple-500 transition-colors">
                  <ArrowLeft size={28} />
                </button>
                <h2 className="text-2xl font-display font-bold text-purple-500 flex items-center gap-2">
                   <Heart size={24} /> Hora de Cuidar
                </h2>
             </div>
             <p className="text-center text-gray-500 mb-4">O que seu baby precisa?</p>
             
             <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto p-2">
                <button onClick={() => handleCare('Banho', 20, 'Limpinho')} disabled={isInteracting} className="bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-200 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all transform active:scale-95">
                    <Bath className="text-cyan-500 w-10 h-10" />
                    <span className="font-bold text-cyan-700">Banho</span>
                    <span className="text-xs text-cyan-400">+20 Energia</span>
                </button>
                <button onClick={() => handleCare('Dormir', 50, 'Cheio de Energia')} disabled={isInteracting} className="bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all transform active:scale-95">
                    <Moon className="text-indigo-500 w-10 h-10" />
                    <span className="font-bold text-indigo-700">Dormir</span>
                    <span className="text-xs text-indigo-400">+50 Energia</span>
                </button>
                <button onClick={() => handleCare('Carinho', 10, 'Amado')} disabled={isInteracting} className="col-span-2 bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all transform active:scale-95">
                    <Heart className="text-pink-500 w-10 h-10" />
                    <span className="font-bold text-pink-700">Carinho</span>
                    <span className="text-xs text-pink-400">+10 Amor</span>
                </button>
             </div>
             {isInteracting && <p className="text-center text-purple-500 font-bold animate-pulse">Cuidando com amor...</p>}
          </div>
        );

      case AppView.DASHBOARD:
        return (
          <div className="flex flex-col h-full space-y-4 animate-fade-in overflow-hidden">
            {/* Header: Level and Logout */}
            <div className="flex justify-between items-center bg-white/50 p-2 rounded-2xl border border-white/60 shadow-sm">
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                   {baby?.level.charAt(0)}
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nível</span>
                   <span className="text-sm font-bold text-gray-700">{baby?.level}</span>
                 </div>
               </div>
               <button onClick={() => setView(AppView.LOGIN)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-xl shadow-sm hover:shadow-md">
                 <LogOut size={18} />
               </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              
              {/* Baby Avatar Section */}
              <div className="flex flex-col items-center justify-center py-2 relative">
                <LogoWithParticles videoError={videoError} setVideoError={setVideoError} customImage={baby?.avatarImage} />
                <h2 className="text-3xl font-display font-bold text-gray-800 mt-2">{baby?.name}</h2>
                <div className="flex gap-2 mt-1">
                   <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                     {getAgeInDays(baby?.birthDate || 0)} dias
                   </span>
                   <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                     <Brain size={12} /> {baby?.xp} XP
                   </span>
                </div>
                <div className="mt-2 bg-white/80 px-4 py-1 rounded-full text-sm text-gray-600 font-medium shadow-sm border border-orange-100">
                   Status: <span className="text-orange-500 font-bold">{baby?.mood}</span>
                </div>
              </div>

              {/* Status Bars */}
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-sm flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                       <span className="flex items-center gap-1"><Utensils size={12}/> Fome</span>
                       <span>{baby?.hunger || 50}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-orange-300 to-green-400 transition-all duration-500" 
                         style={{ width: `${baby?.hunger || 50}%` }}
                       />
                    </div>
                 </div>
                 <div className="bg-white/60 p-3 rounded-2xl border border-white shadow-sm flex flex-col gap-1">
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                       <span className="flex items-center gap-1"><Zap size={12}/> Energia</span>
                       <span>{baby?.energy || 80}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-gradient-to-r from-blue-300 to-purple-400 transition-all duration-500" 
                         style={{ width: `${baby?.energy || 80}%` }}
                       />
                    </div>
                 </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setView(AppView.TEACH)}
                  className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-2xl border-b-4 border-indigo-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <BookOpen className="w-8 h-8 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="block font-bold text-gray-700">Ensinar</span>
                    <span className="text-xs text-gray-400">Ganhar XP</span>
                  </div>
                </button>

                <button 
                  onClick={() => setView(AppView.CHAT)}
                  className="bg-gradient-to-br from-pink-50 to-white p-4 rounded-2xl border-b-4 border-pink-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <MessageCircle className="w-8 h-8 text-pink-500 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="block font-bold text-gray-700">Conversar</span>
                    <span className="text-xs text-gray-400">Interagir</span>
                  </div>
                </button>

                <button 
                  onClick={() => setView(AppView.FEED)}
                  className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-2xl border-b-4 border-orange-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <Utensils className="w-8 h-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="block font-bold text-gray-700">Alimentar</span>
                    <span className="text-xs text-gray-400">Dar comidinha</span>
                  </div>
                </button>

                <button 
                  onClick={() => setView(AppView.CARE)}
                  className="bg-gradient-to-br from-teal-50 to-white p-4 rounded-2xl border-b-4 border-teal-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <Heart className="w-8 h-8 text-teal-500 mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <span className="block font-bold text-gray-700">Cuidar</span>
                    <span className="text-xs text-gray-400">Banho e sono</span>
                  </div>
                </button>
              </div>

              <div className="pt-2">
                 <button 
                    onClick={() => setView(AppView.REBIRTH)} 
                    className="w-full py-2 text-xs font-bold text-gray-400 hover:text-purple-600 flex items-center justify-center gap-1 transition-colors"
                 >
                    <RefreshCw size={12} /> Reiniciar Vida (Rebirth)
                 </button>
              </div>

            </div>
          </div>
        );

      case AppView.TEACH:
        return (
          <div className="flex flex-col h-full animate-fade-in">
             <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setView(AppView.DASHBOARD)} className="text-gray-500 hover:text-indigo-600 transition-colors">
                  <ArrowLeft size={28} />
                </button>
                <h2 className="text-2xl font-display font-bold text-indigo-600 flex items-center gap-2">
                   <BookOpen size={24} /> Ensinar
                </h2>
             </div>
             <p className="text-gray-500 text-sm mb-6 bg-white/50 p-3 rounded-xl">
               Ensine algo novo para o {baby?.name}! Se ele gostar, vai ganhar XP e ficar mais inteligente.
             </p>
             <div className="space-y-4 flex-1">
                <Input 
                  placeholder="Tópico (ex: Cores, Animais)" 
                  value={teachTopic}
                  onChange={(e) => setTeachTopic(e.target.value)}
                  className="bg-white"
                />
                <div className="relative">
                  <textarea 
                    className="w-full h-32 bg-white border-2 border-orange-200 rounded-xl p-4 text-gray-700 focus:outline-none focus:border-orange-500 resize-none font-medium placeholder-gray-400"
                    placeholder="Explique aqui..."
                    value={teachContent}
                    onChange={(e) => setTeachContent(e.target.value)}
                  />
                  <MicButton 
                    onResult={(text) => setTeachContent((prev) => appendVoiceText(prev, text))}
                    className="absolute right-2 bottom-2"
                  />
                </div>
             </div>
             <div className="mt-auto pt-4">
                <Button fullWidth onClick={handleTeach} disabled={isTeaching || !teachTopic || !teachContent}>
                  {isTeaching ? <span className="animate-pulse">Aprendendo...</span> : 'Ensinar Baby AI 🎓'}
                </Button>
             </div>
          </div>
        );

      case AppView.CHAT:
        return (
          <div className="flex flex-col h-full animate-fade-in">
             {/* Header */}
             <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => setView(AppView.DASHBOARD)} className="text-gray-500 hover:text-pink-600 transition-colors">
                    <ArrowLeft size={24} />
                  </button>
                  <div className="flex flex-col">
                    <h2 className="text-xl font-display font-bold text-pink-600">Chat</h2>
                    <span className="text-xs text-gray-400 font-bold">com {baby?.name}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-pink-200">
                    <img src={baby?.avatarImage || "https://img.freepik.com/free-vector/cute-baby-boy-profile-cartoon_18591-56161.jpg"} alt="avatar" className="w-full h-full object-cover" />
                </div>
             </div>

             {/* Messages Area */}
             <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 scrollbar-thin">
                {chatHistory.length === 0 && (
                   <div className="text-center text-gray-400 mt-10 text-sm">
                      Diga "Oi" para começar! 👋
                   </div>
                )}
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${
                       msg.role === 'user' 
                         ? 'bg-purple-600 text-white rounded-tr-none' 
                         : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                     }`}>
                        {msg.text}
                     </div>
                  </div>
                ))}
                {isChatting && (
                   <div className="flex justify-start">
                     <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></div>
                        </div>
                     </div>
                   </div>
                )}
                <div ref={chatEndRef} />
             </div>

             {/* Input Area */}
             <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2 items-center">
                <div className="relative flex-1">
                   <input 
                     className="w-full bg-gray-50 rounded-xl py-3 pl-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200"
                     placeholder="Digite sua mensagem..."
                     value={chatMessage}
                     onChange={e => setChatMessage(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleChat()}
                   />
                   <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <MicButton 
                        onResult={(text) => setChatMessage((prev) => appendVoiceText(prev, text))}
                        className="scale-75 origin-right"
                      />
                   </div>
                </div>
                <button 
                  onClick={handleChat}
                  disabled={!chatMessage.trim() || isChatting}
                  className="bg-pink-500 text-white p-3 rounded-xl hover:bg-pink-600 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Send size={18} />
                </button>
             </div>
          </div>
        );

      case AppView.REBIRTH:
        return (
          <div className="flex flex-col h-full animate-fade-in justify-center items-center text-center p-4">
             <Sparkles className="text-yellow-400 w-16 h-16 mb-4 animate-spin-slow" />
             <h2 className="text-2xl font-display font-bold text-purple-700 mb-2">Renascimento</h2>
             <p className="text-gray-600 text-sm mb-8">
               Seu baby atual será deletado e um novo nascerá. Todo o progresso será perdido. Tem certeza?
             </p>
             
             <div className="w-full max-w-xs space-y-4">
                <Input 
                   placeholder="Novo Nome"
                   value={rebirthName}
                   onChange={e => setRebirthName(e.target.value)}
                />
                <div className="flex gap-2 justify-center">
                  {[BabyGender.BOY, BabyGender.GIRL, BabyGender.NEUTRAL].map((g) => (
                    <button
                      key={g}
                      onClick={() => setRebirthGender(g)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border-b-4 transition-all ${
                        rebirthGender === g 
                          ? 'bg-purple-500 text-white border-purple-700' 
                          : 'bg-white text-gray-500 border-gray-200'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <Button fullWidth variant="danger" onClick={handleRebirth}>
                   Confirmar Renascimento
                </Button>
                <button 
                   onClick={() => setView(AppView.DASHBOARD)}
                   className="text-gray-400 text-sm font-bold hover:text-gray-600 underline"
                >
                   Cancelar
                </button>
             </div>
          </div>
        );

      default:
        return <div>View not found</div>;
    }
  };

  return (
    <Layout isMusicPlaying={isMusicPlaying} toggleMusic={toggleMusic}>
       <audio ref={audioRef} src={musicSrc} loop />
       {renderContent()}
    </Layout>
  );
};

export default App;