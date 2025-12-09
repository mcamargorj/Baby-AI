import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Brain, MessageCircle, LogOut, ArrowLeft, Send, BookOpen, RefreshCw, Wand2 } from 'lucide-react';
import Layout from './components/Layout';
import Button from './components/Button';
import Input from './components/Input';
import MicButton from './components/MicButton';
import { AppView, BabyState, BabyGender, ChatMessage } from './types';
import { saveBaby, loadBaby, createInitialBaby, deleteBaby, validateUser, registerUser } from './services/storageService';
import { geminiService } from './services/geminiService';
import { getLevelTitle, getAgeInDays } from './constants';

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
                  ? 'bg-orange-500 text-white border-orange-700 transform scale-105' 
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
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

// --- Main App Component ---

const App: React.FC = () => {
  // Global State
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [baby, setBaby] = useState<BabyState | null>(null);
  const [currentUser, setCurrentUser] = useState<string>(''); // Track logged user
  
  // Audio State
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicSrc, setMusicSrc] = useState("https://babyai.pythonanywhere.com/static/audio/baby_ai_theme.mp3");
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
    
    // Confirmation could go here
    deleteBaby(currentUser);
    
    // For rebirth, we can also generate a new avatar if desired, 
    // or just keep simple for now. Let's regenerate to fit the "New Baby" theme.
    // We need to show some loading state ideally.
    // For simplicity in this view, we'll do it blocking or add a local spinner if needed.
    // But since `handleRebirth` is simpler, let's just make it async.
    
    const avatar = await geminiService.generateBabyAvatar(rebirthGender);
    const newBaby = createInitialBaby(rebirthName, rebirthGender, currentUser, avatar);
    
    setBaby(newBaby);
    saveBaby(newBaby);
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

      case AppView.DASHBOARD:
        if (!baby) return null;
        return (
          <div className="flex flex-col h-full animate-fade-in">
            <div className="flex justify-between items-center mb-4 pr-20">
              <div>
                <h2 className="text-2xl font-display font-bold text-blue-600">{baby.name}</h2>
                <p className="text-xs text-gray-500 font-bold">{baby.level} • {getAgeInDays(baby.birthDate)} dias</p>
              </div>
              <div className="text-right">
                 <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                   ⭐ {baby.xp} XP
                 </div>
                 <div className="text-xs text-gray-400 mt-1 font-medium">{baby.mood}</div>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
                <LogoWithParticles 
                  videoError={videoError} 
                  setVideoError={setVideoError} 
                  customImage={baby.avatarImage} // Pass the generated avatar
                />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button variant="primary" onClick={() => setView(AppView.CHAT)} className="flex flex-col items-center py-4">
                <MessageCircle size={24} />
                <span>Conversar</span>
              </Button>
              <Button variant="secondary" onClick={() => setView(AppView.TEACH)} className="flex flex-col items-center py-4">
                <Brain size={24} />
                <span>Ensinar</span>
              </Button>
              <Button variant="success" onClick={() => setView(AppView.REBIRTH)} className="flex flex-col items-center py-4">
                <RefreshCw size={24} />
                <span>Renascimento</span>
              </Button>
               <Button variant="danger" onClick={() => { setBaby(null); setCurrentUser(''); setView(AppView.LOGIN); setUsername(''); setPassword(''); }} className="flex flex-col items-center py-4">
                <LogOut size={24} />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        );

      case AppView.TEACH:
        return (
          <div className="flex flex-col h-full animate-fade-in overflow-hidden">
            <div className="flex items-center mb-6 shrink-0">
              <button onClick={() => setView(AppView.DASHBOARD)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="text-gray-500" />
              </button>
              <h2 className="text-xl font-display font-bold text-purple-600 ml-2">Ensinar</h2>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto min-h-0 pr-1">
              <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-100">
                <p className="text-purple-800 text-sm font-medium">
                  "Estou pronto para aprender! O que você vai me ensinar hoje?" 🧠
                </p>
              </div>
              <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-600 ml-1">Assunto</label>
                  <Input 
                      placeholder="Ex: Cores, Animais..." 
                      value={teachTopic}
                      onChange={(e) => setTeachTopic(e.target.value)}
                      icon={<BookOpen size={18} />}
                      rightElement={
                          <MicButton onResult={(t) => setTeachTopic(prev => appendVoiceText(prev, t))} />
                      }
                  />
              </div>
              <div className="space-y-2 relative">
                  <label className="text-sm font-bold text-gray-600 ml-1">Explicação</label>
                  <textarea 
                      className="w-full h-32 bg-blue-50 border-2 border-orange-300 rounded-xl p-4 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-medium placeholder-gray-400 resize-none"
                      placeholder="Toque no microfone para falar..."
                      value={teachContent}
                      onChange={(e) => setTeachContent(e.target.value)}
                  />
                  <div className="absolute right-3 bottom-3 z-10">
                      <MicButton onResult={(t) => setTeachContent(prev => appendVoiceText(prev, t))} />
                  </div>
              </div>
            </div>
            <div className="mt-4 shrink-0">
              <Button 
                  fullWidth 
                  onClick={handleTeach} 
                  disabled={isTeaching || !teachTopic || !teachContent}
                  variant="secondary"
              >
                  {isTeaching ? 'Aprendendo...' : 'Ensinar Baby AI 🎓'}
              </Button>
            </div>
          </div>
        );

      case AppView.CHAT:
        return (
          <div className="flex flex-col h-full animate-fade-in overflow-hidden">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-100 shrink-0">
                  <button onClick={() => setView(AppView.DASHBOARD)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <ArrowLeft className="text-gray-500" />
                  </button>
                  <div className="ml-2 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center overflow-hidden">
                           {/* Use generated avatar in chat header if available */}
                           {baby?.avatarImage ? (
                             <img src={baby.avatarImage} alt="Baby" className="w-full h-full object-cover" />
                           ) : (
                             <img src="https://api.dicebear.com/7.x/fun-emoji/svg?seed=Baby" alt="Baby" />
                           )}
                      </div>
                      <div>
                          <h2 className="text-lg font-display font-bold text-gray-700">{baby?.name}</h2>
                          <p className="text-xs text-green-500 font-bold flex items-center">● Online</p>
                      </div>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin mb-4 min-h-0">
                  {chatHistory.length === 0 && (
                      <div className="text-center text-gray-400 text-sm mt-10">
                          <p>Diga "Oi" para começar! 👋</p>
                      </div>
                  )}
                  {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`
                              max-w-[80%] p-3 rounded-2xl text-sm font-medium leading-relaxed
                              ${msg.role === 'user' 
                                  ? 'bg-blue-500 text-white rounded-tr-none shadow-md' 
                                  : 'bg-white text-gray-700 border-2 border-gray-100 rounded-tl-none shadow-sm'
                              }
                          `}>
                             <p>{msg.text}</p>
                             <span className="text-[10px] opacity-70 mt-1 block text-right">
                               {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </span>
                          </div>
                      </div>
                  ))}
                  <div ref={chatEndRef} />
              </div>
              <div className="flex items-center gap-2 mt-auto pt-2 shrink-0">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Converse com o Baby..."
                  onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                  rightElement={
                     <MicButton onResult={(t) => setChatMessage(prev => appendVoiceText(prev, t))} />
                  }
                />
                <Button 
                   onClick={handleChat} 
                   disabled={!chatMessage.trim() || isChatting}
                   className="!px-3 !py-3 rounded-xl"
                >
                   <Send size={20} />
                </Button>
              </div>
          </div>
        );

      case AppView.REBIRTH:
        return (
          <div className="flex flex-col h-full animate-fade-in">
             <div className="flex items-center mb-6">
                <button onClick={() => setView(AppView.DASHBOARD)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ArrowLeft className="text-gray-500" />
                </button>
                <h2 className="text-xl font-display font-bold text-red-600 ml-2">Renascimento</h2>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 px-4">
                 <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                    <RefreshCw className="text-red-500 w-12 h-12" />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-gray-800">Deseja reiniciar seu Baby AI?</h3>
                    <p className="text-gray-500 text-sm mt-2">Isso apagará todo o progresso, memórias e nível atual. Um novo bebê nascerá.</p>
                 </div>
                 
                 <div className="w-full max-w-xs space-y-4 text-left">
                    <Input 
                      placeholder="Nome do novo Baby" 
                      value={rebirthName} 
                      onChange={e => setRebirthName(e.target.value)} 
                    />
                     <div>
                      <label className="text-sm font-bold text-gray-600 block mb-2 pl-1">Gênero</label>
                      <div className="flex gap-2">
                        {[BabyGender.BOY, BabyGender.GIRL, BabyGender.NEUTRAL].map((g) => (
                          <button
                            key={g}
                            onClick={() => setRebirthGender(g)}
                            className={`flex-1 py-2 rounded-xl text-sm font-bold border-b-4 transition-all ${
                              rebirthGender === g 
                                ? 'bg-orange-500 text-white border-orange-700 transform scale-105' 
                                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                 </div>
              </div>
              
              <div className="mt-4">
                 <Button 
                    fullWidth 
                    variant="danger" 
                    onClick={handleRebirth}
                    disabled={!rebirthName}
                  >
                    Renascer Agora 🐣
                  </Button>
              </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout isMusicPlaying={isMusicPlaying} toggleMusic={toggleMusic}>
       {renderContent()}
       <audio 
         ref={audioRef} 
         src={musicSrc}
         loop
         onError={(e) => {
           console.log("Audio load error, switching fallback", e);
           if (musicSrc !== "https://cdn.pixabay.com/audio/2022/10/28/audio_195655787c.mp3") {
              setMusicSrc("https://cdn.pixabay.com/audio/2022/10/28/audio_195655787c.mp3");
           }
         }}
       />
    </Layout>
  );
};

export default App;