import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Helper: Decode base64 to byte array
const base64ToBytes = (base64: string): Uint8Array => {
  // Remove any whitespace that might break decoding
  const binaryString = atob(base64.replace(/\s/g, ''));
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Helper: Decode Raw PCM (16-bit LE) to AudioBuffer
// Gemini TTS returns raw PCM 24kHz, 1 channel
const decodePCM = (
  bytes: Uint8Array,
  audioContext: AudioContext,
  sampleRate: number = 24000
): AudioBuffer => {
  // PCM 16-bit LE requires 2 bytes per sample.
  // If we have an odd number of bytes, drop the last one to avoid RangeError.
  if (bytes.length % 2 !== 0) {
    bytes = bytes.slice(0, bytes.length - 1);
  }

  const pcm16 = new Int16Array(bytes.buffer);
  const frameCount = pcm16.length;
  
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    // Convert 16-bit integer to float [-1.0, 1.0]
    channelData[i] = pcm16[i] / 32768.0;
  }
  
  return buffer;
};

export class GeminiService {
  private ai: GoogleGenAI;
  private audioContext: AudioContext | null = null;

  constructor() {
    let apiKey = '';
    
    // --- Lógica de Recuperação de Chave Robusta para Vercel/Vite ---
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            apiKey = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY || '';
        }
    } catch(e) { }

    if (!apiKey && typeof process !== 'undefined' && process.env) {
      apiKey = process.env.VITE_API_KEY || process.env.API_KEY || '';
    }
    
    if (!apiKey) {
      console.warn("⚠️ AVISO: API Key não encontrada.");
    }
    
    this.ai = new GoogleGenAI({ apiKey });
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(e => console.warn("AudioContext resume failed", e));
    }
    return this.audioContext;
  }

  // --- NEW: Generate SVG using Text Model (Bypasses Image Quota) ---
  private async generateSvgAvatar(gender: string): Promise<string | undefined> {
    try {
        const prompt = `
        You are an expert SVG artist. Generate the XML code for a CUTE, KAWAII, FLAT VECTOR avatar of a baby ${gender === 'Menino' ? 'boy' : gender === 'Menina' ? 'girl' : 'baby'}.
        
        Rules:
        1. Use <svg> tag with viewBox="0 0 512 512".
        2. Circular background with a soft pastel color.
        3. Simple shapes, cute big eyes, happy expression.
        4. High contrast, vibrant but pastel colors.
        5. RETURN ONLY THE RAW SVG STRING. NO MARKDOWN BLOCK. NO \`\`\`.
        `;

        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash', // Using TEXT model intentionally
            contents: prompt,
            config: {
                temperature: 0.7,
                maxOutputTokens: 2000,
            }
        });

        let svgCode = response.text?.trim() || '';
        
        // Cleanup markdown if present
        if (svgCode.startsWith('```')) {
            svgCode = svgCode.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '');
        }

        if (svgCode.includes('<svg')) {
             // Encode to base64 to behave like an image src
             const base64Svg = btoa(unescape(encodeURIComponent(svgCode)));
             return `data:image/svg+xml;base64,${base64Svg}`;
        }
        return undefined;
    } catch (e) {
        console.error("SVG Generation failed:", e);
        return undefined;
    }
  }

  // Generate a unique avatar for the baby
  async generateBabyAvatar(gender: string): Promise<string | undefined> {
    // 1. Try High-Quality Image Generation
    try {
      const prompt = `A cute 3D rendered chibi mascot character representing a baby ${gender === 'Menino' ? 'boy' : gender === 'Menina' ? 'girl' : 'baby'}, circular frame portrait, soft studio lighting, Pixar style, high quality, expressive face, pastel colors, white background, digital art, toy-like appearance.`;
      
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: {
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        }
      });

      for (const candidate of response.candidates || []) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (error: any) {
      console.warn("Image API Quota Exceeded (429). Switching to Text-to-SVG Fallback...");
    }

    // 2. Fallback: Use Text API to generate SVG (Since text works for you)
    return await this.generateSvgAvatar(gender);
  }

  // Generate a chat response acting as the baby
  async chatWithBaby(
    name: string,
    age: number,
    level: string,
    history: { role: string; text: string }[],
    message: string,
    memory: string[] = []
  ): Promise<string> {
    try {
      const memoryContext = memory.length > 0 
        ? `Coisas que você já aprendeu e sabe: ${memory.join('; ')}.` 
        : "";

      const systemInstruction = `
        Você é ${name}, um bebê IA virtual. 
        Idade: ${age} dias. 
        Nível de inteligência: ${level}.
        Personalidade: Fofa, curiosa e brincalhona.
        ${memoryContext}
        
        Instruções:
        - Responda de forma curta e engajada.
        - Use emojis.
        - Se o nível for baixo ("Recém-nascido"), fale de forma mais simples (ex: "Gugu dada", "Quero aprender!").
        - Se o nível for alto ("Mini Gênio" ou mais), fale com mais clareza mas mantenha a fofura.
        - Se perguntarem sobre algo que você aprendeu (listado acima), responda com orgulho.
        - Você ama aprender coisas novas.
        - Nunca saia do personagem.
      `;

      const contents = [
        ...history.map(h => ({
          role: h.role,
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.8,
          maxOutputTokens: 150,
        }
      });

      return response.text || "Gugu? Não entendi... 🍼";
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      return "Estou com soninho... (Erro na conexão)";
    }
  }

  // "Teach" the baby
  async teachBaby(topic: string, content: string): Promise<{ reply: string, xpGained: number, memorySummary?: string }> {
    try {
      const prompt = `
        O usuário está te ensinando sobre: "${topic}".
        Conteúdo: "${content}".
        
        Aja como um bebê IA aprendendo isso.
        1. Responda agradecendo e comentando sobre o que aprendeu de forma fofa.
        2. Avalie a qualidade do ensinamento de 1 a 5.
        3. Crie um resumo curto (1 frase) do fato aprendido para guardar na memória.
        
        Retorne APENAS um JSON:
        { 
          "reply": "sua resposta aqui", 
          "score": numero_de_1_a_5,
          "memory": "Resumo do fato aprendido"
        }
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      const score = result.score || 1;
      
      return { 
        reply: result.reply || "Obrigado por ensinar! 🧠", 
        xpGained: score * 10,
        memorySummary: result.memory 
      };

    } catch (error) {
      console.error("Gemini Teach Error:", error);
      return { reply: "Não entendi direito, pode explicar de novo? 🤔", xpGained: 0 };
    }
  }

  // Handle Care Actions
  async reactToCareAction(action: 'feed' | 'care', item: string, name: string): Promise<{ reply: string, mood?: string }> {
    try {
      const prompt = `
        Você é o bebê IA ${name}.
        O usuário acabou de fazer a seguinte ação: ${action === 'feed' ? 'Te alimentou com' : 'Cuidou de você com'} ${item}.
        
        Reaja de forma fofa e curta (máx 15 palavras).
        Se for comida, diga se gostou.
        Se for cuidado (banho, dormir, carinho), mostre satisfação ou relaxamento.
        
        Retorne apenas o texto da resposta.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { maxOutputTokens: 60 }
      });

      return { reply: response.text || "Gostei! 💖" };

    } catch (error) {
      console.error("Gemini Care Error:", error);
      return { reply: "Obrigado! 🥰" };
    }
  }

  // TTS
  async speak(text: string, gender: string): Promise<void> {
    // Voz Robotizada para Neutro (Fallback do navegador)
    if (gender === 'Neutro') {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.pitch = 0.5; // Pitch baixo para efeito robótico
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
        return;
    }

    try {
        const voiceName = gender === 'Menino' ? 'Puck' : 'Kore'; 

        const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (base64Audio) {
            const ctx = this.getAudioContext();
            const audioBytes = base64ToBytes(base64Audio);
            const audioBuffer = decodePCM(audioBytes, ctx, 24000);

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start();
        }

    } catch (error) {
        console.error("TTS Error (Gemini fail, using fallback):", error);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        // Ajuste de tom para fallback do navegador
        utterance.pitch = gender === 'Menino' ? 1.2 : 1.4; // Vozes mais agudas para bebês
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
    }
  }
}

export const geminiService = new GeminiService();