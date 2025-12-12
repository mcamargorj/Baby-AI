import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Brain, MessageCircle, LogOut, ArrowLeft, Send, BookOpen, RefreshCw, Wand2, Utensils, Heart, Moon, Bath, Apple, Candy, Milk, Battery, Zap } from 'lucide-react';
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
