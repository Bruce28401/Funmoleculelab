
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Loader2, StopCircle } from 'lucide-react';
import { generateMoleculeSpeech } from '../services/geminiService';

interface VoiceButtonProps {
  text: string;
  moleculeName?: string; // Used for caching key
}

// --- Audio Helper Functions ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ text, moleculeName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Stop audio if the text changes (new molecule loaded)
  useEffect(() => {
    stopAudio();
  }, [text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsPlaying(false);
  };

  const handlePlayExplanation = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoadingAudio(true);
    try {
      // 1. Generate Speech via Gemini (Pass moleculeName for caching)
      const base64Audio = await generateMoleculeSpeech(text, moleculeName);

      // 2. Setup Audio Context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: 24000 }); // 24kHz is standard for this model
      audioContextRef.current = ctx;

      // 3. Decode PCM Data
      const bytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(bytes, ctx, 24000, 1);

      // 4. Play
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };

      sourceNodeRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio playback error:", error);
      alert("抱歉，语音生成失败。");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <button
      onClick={handlePlayExplanation}
      disabled={isLoadingAudio}
      className={`h-10 w-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 border backdrop-blur-md ${
        isPlaying 
          ? 'bg-blue-500 text-white border-blue-400 ring-2 ring-blue-300' 
          : 'bg-white/10 hover:bg-white/20 border-white/30 text-white'
      }`}
      title={isPlaying ? "停止播放" : "听听讲解"}
    >
      {isLoadingAudio ? (
        <Loader2 size={20} className="animate-spin" />
      ) : isPlaying ? (
        <StopCircle size={20} />
      ) : (
        <Volume2 size={20} />
      )}
    </button>
  );
};

export default VoiceButton;
