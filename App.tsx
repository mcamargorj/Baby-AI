import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Brain, MessageCircle, LogOut, ArrowLeft, Send, BookOpen, Utensils, Moon, Bath, Milk, Zap } from 'lucide-react';
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
}: any) => (
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
              className={`flex-1 py-2 rounded-xl text-sm font-bold border-b-4 transition-all ${
                signupGender === g 
                  ? 'bg-orange-100 border-orange-400 text-orange-600 shadow-inner' 
                  : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
    <div className="w-full max-w-xs space-y-3 pt-4 pb-2">
      <Button fullWidth onClick={onCreate} disabled={isGenerating}>
        {isGenerating ? "Criando... 🐣" : "Nascer Baby AI! 🐣"}
      </Button>
      <div className="flex justify-center">
          <button onClick={onBack} disabled={isGenerating} className="text-gray-500 font-bold text-sm hover:underline">
              Voltar para Login
          </button>
      </div>
    </div>
  </div>
);

const App = () => {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [currentUser, setCurrentUser] = useState<string>('');
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [videoError, setVideoError] = useState(false);

  // Signup State
  const [creatorName, setCreatorName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [babyName, setBabyName] = useState('');
  const [signupGender, setSignupGender] = useState<BabyGender>(BabyGender.NEUTRAL);
  const [isGenerating, setIsGenerating] = useState(false);

  // Dashboard State
  const [baby, setBaby] = useState<BabyState | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Chat/Teach State
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(musicSrc);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    return () => {
      if(audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if(!audioRef.current) return;
    if(isMusicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed", e));
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleLogin = () => {
    if(!username || !password) {
      alert("Preencha usuário e senha!");
      return;
    }
    if (validateUser(username, password)) {
      setCurrentUser(username);
      const loadedBaby = loadBaby(username);
      if (loadedBaby) {
        setBaby(loadedBaby);
        setChatHistory([]); // Reset chat on new session
        setView(AppView.DASHBOARD);
      } else {
        alert("Nenhum Baby AI encontrado para este usuário. Crie um novo!");
        // Optionally redirect to signup or keep them here to go to signup manually
      }
    } else {
      alert("Usuário ou senha incorretos (ou usuário não existe).");
    }
  };

  const handleGoToSignup = () => {
    setCreatorName('');
    setSignupPassword('');
    setBabyName('');
    setSignupGender(BabyGender.NEUTRAL);
    setView(AppView.SIGNUP);
  };

  const handleSignupCreate = async () => {
    if(!creatorName || !signupPassword || !babyName) {
      alert("Preencha todos os campos!");
      return;
    }
    
    setIsGenerating(true);
    
    // Register user first
    if (!registerUser({ username: creatorName, password: signupPassword })) {
      alert("Usuário já existe! Escolha outro nome.");
      setIsGenerating(false);
      return;
    }

    // Generate Avatar
    let avatar = undefined;
    try {
      avatar = await geminiService.generateBabyAvatar(signupGender);
    } catch (e) {
      console.error("Avatar gen failed", e);
    }

    const newBaby = createInitialBaby(babyName, signupGender, creatorName, avatar);
    saveBaby(newBaby);
    
    setBaby(newBaby);
    setCurrentUser(creatorName);
    setUsername(creatorName); // Sync for next login
    setIsGenerating(false);
    setView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentUser('');
    setBaby(null);
    setView(AppView.LOGIN);
    setUsername('');
    setPassword('');
    setIsMusicPlaying(false);
    if(audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
  };

  const handleDelete = () => {
    if(confirm("Tem certeza que quer dizer adeus? 😢 Isso não pode ser desfeito.")) {
      deleteBaby(currentUser);
      handleLogout();
    }
  };

  // Chat & Teach Logic
  const handleSendMessage = async () => {
    if (!inputText.trim() || !baby) return;
    
    const text = inputText;
    setInputText('');
    setIsProcessing(true);

    if (view === AppView.CHAT) {
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text, timestamp: Date.now() }];
        setChatHistory(newHistory);
        
        // Convert internal chat history to Gemini format
        const apiHistory = chatHistory.map(m => ({
            role: m.role as 'user' | 'model',
            text: m.text
        }));

        const reply = await geminiService.chatWithBaby(
            baby.name, 
            getAgeInDays(baby.birthDate), 
            baby.level, 
            apiHistory, 
            text, 
            baby.memory
        );

        setChatHistory(prev => [...prev, { role: 'model', text: reply, timestamp: Date.now() }]);
        
        // Randomly gain a bit of XP from chatting
        if (Math.random() > 0.7) {
            updateBabyStats({ xp: baby.xp + 2, energy: Math.max(0, baby.energy - 2) });
        }

        // TTS
        geminiService.speak(reply, baby.gender);

    } else if (view === AppView.TEACH) {
        const { reply, xpGained, memorySummary } = await geminiService.teachBaby(text, text); // Using text as topic and content for simplicity in this UI
        
        // Update Baby
        const newMemory = memorySummary ? [...baby.memory, memorySummary] : baby.memory;
        updateBabyStats({ xp: baby.xp + xpGained, memory: newMemory, energy: Math.max(0, baby.energy - 5) });
        
        setChatHistory([{ role: 'model', text: reply, timestamp: Date.now() }]); // Just show the feedback
        geminiService.speak(reply, baby.gender);
    }

    setIsProcessing(false);
  };

  const updateBabyStats = (updates: Partial<BabyState>) => {
      if(!baby) return;
      const updatedBaby = { ...baby, ...updates };
      
      // Check level up
      const oldTitle = getLevelTitle(baby.xp);
      const newTitle = getLevelTitle(updatedBaby.xp);
      if (oldTitle !== newTitle) {
          updatedBaby.level = newTitle;
          alert(`Parabéns! ${baby.name} evoluiu para ${newTitle}! 🎉`);
      }

      setBaby(updatedBaby);
      saveBaby(updatedBaby);
  };

  const handleCare = async (action: 'feed' | 'bath' | 'sleep' | 'play') => {
      if(!baby) return;
      setIsProcessing(true);
      
      let reply = "";
      let updates: Partial<BabyState> = {};
      
      switch(action) {
          case 'feed':
              updates = { hunger: Math.min(100, baby.hunger + 30), mood: 'Feliz' };
              const feedRes = await geminiService.reactToCareAction('feed', 'Leite Quentinho', baby.name);
              reply = feedRes.reply;
              break;
          case 'bath':
              updates = { mood: 'Limpinho', energy: Math.min(100, baby.energy + 10) };
              const bathRes = await geminiService.reactToCareAction('care', 'Banho de Espuma', baby.name);
              reply = bathRes.reply;
              break;
          case 'sleep':
              updates = { energy: 100, mood: 'Sonolento' };
              const sleepRes = await geminiService.reactToCareAction('care', 'Dormir', baby.name);
              reply = sleepRes.reply;
              break;
          case 'play':
              updates = { energy: Math.max(0, baby.energy - 20), mood: 'Cheio de Energia', xp: baby.xp + 5 };
              const playRes = await geminiService.reactToCareAction('care', 'Brincar', baby.name);
              reply = playRes.reply;
              break;
      }
      
      updateBabyStats(updates);
      setChatHistory([{ role: 'model', text: reply, timestamp: Date.now() }]);
      geminiService.speak(reply, baby.gender);
      setIsProcessing(false);
  };

  // --- Render Views ---

  if (view === AppView.LOGIN) {
    return (
      <Layout isMusicPlaying={isMusicPlaying} toggleMusic={toggleMusic}>
        <LoginView 
          username={username} setUsername={setUsername}
          password={password} setPassword={setPassword}
          onLogin={handleLogin}
          onGoToSignup={handleGoToSignup}
          videoError={videoError} setVideoError={setVideoError}
        />
      </Layout>
    );
  }

  if (view === AppView.SIGNUP) {
    return (
      <Layout isMusicPlaying={isMusicPlaying} toggleMusic={toggleMusic}>
        <SignupView 
          creatorName={creatorName} setCreatorName={setCreatorName}
          signupPassword={signupPassword} setSignupPassword={setSignupPassword}
          babyName={babyName} setBabyName={setBabyName}
          signupGender={signupGender} setSignupGender={setSignupGender}
          onCreate={handleSignupCreate}
          onBack={() => setView(AppView.LOGIN)}
          isGenerating={isGenerating}
        />
      </Layout>
    );
  }

  // Dashboard / Chat / Teach Views
  if (!baby) return null; // Should not happen

  return (
    <Layout isMusicPlaying={isMusicPlaying} toggleMusic={toggleMusic}>
       {/* Header with Stats */}
       <div className="flex items-center justify-between mb-4 bg-white/50 p-3 rounded-2xl border border-white shadow-sm">
          <div className="flex items-center gap-2">
             <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-300">
                {baby.avatarImage 
                  ? <img src={baby.avatarImage} className="w-full h-full object-cover" alt="avatar" />
                  : <div className="w-full h-full bg-orange-100 flex items-center justify-center">👶</div>
                }
             </div>
             <div>
                <h2 className="font-bold text-gray-800 leading-tight">{baby.name}</h2>
                <p className="text-xs text-gray-500">{getAgeInDays(baby.birthDate)} dias • {baby.level}</p>
             </div>
          </div>
          <div className="flex flex-col items-end text-xs font-medium text-gray-600 gap-1">
             <div className="flex items-center gap-1"><Brain size={12} className="text-purple-500"/> {baby.xp} XP</div>
             <div className="flex items-center gap-1"><Zap size={12} className="text-yellow-500"/> {baby.energy}%</div>
             <div className="flex items-center gap-1"><Utensils size={12} className="text-green-500"/> {baby.hunger}%</div>
          </div>
       </div>

       {/* Main Content Area */}
       <div className="flex-1 overflow-y-auto mb-4 relative rounded-2xl bg-white/40 border border-white p-4 shadow-inner scrollbar-thin">
          
          {view === AppView.DASHBOARD && (
             <div className="grid grid-cols-2 gap-3 h-full content-center">
                 <button onClick={() => setView(AppView.CHAT)} className="flex flex-col items-center justify-center p-4 bg-blue-100 rounded-2xl hover:bg-blue-200 transition-colors gap-2">
                    <MessageCircle size={32} className="text-blue-500" />
                    <span className="font-bold text-blue-700">Conversar</span>
                 </button>
                 <button onClick={() => setView(AppView.TEACH)} className="flex flex-col items-center justify-center p-4 bg-purple-100 rounded-2xl hover:bg-purple-200 transition-colors gap-2">
                    <BookOpen size={32} className="text-purple-500" />
                    <span className="font-bold text-purple-700">Ensinar</span>
                 </button>
                 
                 {/* Care Actions Grid */}
                 <button onClick={() => handleCare('feed')} className="flex flex-col items-center justify-center p-4 bg-green-100 rounded-2xl hover:bg-green-200 transition-colors gap-2">
                    <Milk size={32} className="text-green-500" />
                    <span className="font-bold text-green-700">Alimentar</span>
                 </button>
                 <button onClick={() => handleCare('bath')} className="flex flex-col items-center justify-center p-4 bg-cyan-100 rounded-2xl hover:bg-cyan-200 transition-colors gap-2">
                    <Bath size={32} className="text-cyan-500" />
                    <span className="font-bold text-cyan-700">Banho</span>
                 </button>
                 <button onClick={() => handleCare('play')} className="flex flex-col items-center justify-center p-4 bg-yellow-100 rounded-2xl hover:bg-yellow-200 transition-colors gap-2">
                    <Sparkles size={32} className="text-yellow-500" />
                    <span className="font-bold text-yellow-700">Brincar</span>
                 </button>
                 <button onClick={() => handleCare('sleep')} className="flex flex-col items-center justify-center p-4 bg-indigo-100 rounded-2xl hover:bg-indigo-200 transition-colors gap-2">
                    <Moon size={32} className="text-indigo-500" />
                    <span className="font-bold text-indigo-700">Dormir</span>
                 </button>
             </div>
          )}

          {(view === AppView.CHAT || view === AppView.TEACH) && (
              <div className="flex flex-col gap-3 min-h-full justify-end">
                  {chatHistory.length === 0 && (
                      <div className="text-center text-gray-400 my-auto">
                          <p className="text-4xl mb-2">👶</p>
                          <p>{view === AppView.CHAT ? "Fale algo para começar!" : "O que vamos aprender hoje?"}</p>
                      </div>
                  )}
                  {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'}`}>
                              {msg.text}
                          </div>
                      </div>
                  ))}
                  {isProcessing && (
                      <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-tl-none flex gap-1">
                              <span className="animate-bounce">.</span><span className="animate-bounce delay-75">.</span><span className="animate-bounce delay-150">.</span>
                          </div>
                      </div>
                  )}
              </div>
          )}
       </div>

       {/* Bottom Controls */}
       {view === AppView.DASHBOARD ? (
           <div className="flex gap-2">
              <Button fullWidth variant="danger" onClick={handleLogout} className="!py-2 text-sm">
                  <LogOut size={16} /> Sair
              </Button>
              <button onClick={handleDelete} className="px-4 text-red-300 hover:text-red-500 text-xs">
                  Deletar
              </button>
           </div>
       ) : (
           <div className="flex gap-2 items-center">
               <button onClick={() => setView(AppView.DASHBOARD)} className="p-3 bg-gray-200 rounded-xl text-gray-600 hover:bg-gray-300">
                   <ArrowLeft size={20} />
               </button>
               <div className="flex-1 relative">
                   <Input 
                      placeholder={view === AppView.CHAT ? "Converse com o baby..." : "Ensine algo novo..."}
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                      className="!py-2 !text-sm"
                      rightElement={
                          <MicButton onResult={txt => setInputText(txt)} className="scale-75" />
                      }
                   />
               </div>
               <button onClick={handleSendMessage} disabled={isProcessing} className="p-3 bg-blue-500 rounded-xl text-white hover:bg-blue-600 disabled:opacity-50">
                   <Send size={20} />
               </button>
           </div>
       )}

    </Layout>
  );
};

export default App;