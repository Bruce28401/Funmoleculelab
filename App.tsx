
import React, { useState } from 'react';
import { Search, FlaskConical, Loader2, Sparkles, BookOpen, Atom } from 'lucide-react';
import { MoleculeData, AppState } from './types';
import { generateMoleculeData } from './services/geminiService';
import { SAMPLE_MOLECULES } from './constants';
import MoleculeViewer from './components/MoleculeViewer';
import InfoCard from './components/InfoCard';
import VoiceButton from './components/VoiceButton';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [data, setData] = useState<MoleculeData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // State for the floating panel visibility
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setAppState(AppState.LOADING);
    setErrorMsg('');
    setQuery(searchTerm);
    setIsInfoVisible(false); // Hide panel while loading new data

    try {
      const result = await generateMoleculeData(searchTerm);
      setData(result);
      setAppState(AppState.SUCCESS);
      setIsInfoVisible(false); // Do not auto show panel on success
    } catch (err) {
      setAppState(AppState.ERROR);
      setErrorMsg("哎呀！实验室机器人没能识别这种物质，请换一个试试！(Gemini API Error)");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 selection:bg-stone-200 font-sans">
      {/* Header */}
      <header className="bg-[#f3f4f6]/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group select-none" onClick={() => window.location.reload()}>
            {/* New Lively Logo */}
            <div className="relative">
               <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-300 to-blue-400 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
               <div className="relative w-11 h-11 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:scale-105 group-hover:rotate-6 border-2 border-white/20">
                  <FlaskConical className="text-white transform -rotate-12 drop-shadow-md" size={22} strokeWidth={2.5} />
                  {/* Decorative Bubbles */}
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-300 rounded-full border-2 border-[#f3f4f6] flex items-center justify-center shadow-sm animate-bounce" style={{ animationDuration: '2s' }}>
                    <div className="w-1 h-1 bg-white rounded-full opacity-60"></div>
                  </div>
                  <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                  <div className="absolute top-2 left-2 w-1 h-1 bg-white/40 rounded-full"></div>
               </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-happy text-slate-800 tracking-wider pt-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300">
                趣味分子实验室
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-400 font-happy tracking-wider">
            <span>✨ Powered by Google Gemini</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <section className="max-w-3xl mx-auto mb-8 text-center">
          {appState === AppState.IDLE && (
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-800 animate-fade-in-up tracking-wide">
              你想探索什么物质？
            </h2>
          )}
          
          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入物质名称，例如：水、阿司匹林..."
              className="w-full h-14 pl-6 pr-16 rounded-full border-2 border-stone-200 bg-white/80 shadow-sm text-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none transition-all placeholder:text-stone-300"
            />
            <button 
              type="submit"
              disabled={appState === AppState.LOADING}
              className="absolute right-2 top-2 h-10 w-10 rounded-full flex items-center justify-center text-stone-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all disabled:opacity-50"
            >
              {appState === AppState.LOADING ? (
                <Loader2 size={24} className="animate-spin text-cyan-500" />
              ) : (
                <Search size={24} />
              )}
            </button>
          </form>

          {/* Quick Suggestions - Only show when IDLE to reduce clutter */}
          {appState === AppState.IDLE && (
            <div className="mt-4 flex flex-wrap justify-center gap-2 animate-fade-in-up delay-100">
              {SAMPLE_MOLECULES.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSearch(item.split(' ')[0])}
                  className="px-4 py-2 bg-white/80 border border-stone-200 rounded-full text-sm font-medium text-slate-600 hover:border-cyan-400 hover:text-cyan-700 hover:bg-white transition-all shadow-sm"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Content Area */}
        {appState === AppState.ERROR && (
          <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-100 rounded-2xl text-center text-red-600">
            <p className="font-bold text-lg">{errorMsg}</p>
          </div>
        )}

        {appState === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center py-20 text-stone-400">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-stone-200 border-t-cyan-500 rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <FlaskConical size={32} className="text-cyan-500"/>
              </div>
            </div>
            <p className="mt-6 text-lg font-happy animate-pulse text-cyan-600/70">我蹦蹦跳跳过来了 你等会撒...</p>
          </div>
        )}

        {appState === AppState.SUCCESS && data && (
          <div className="relative w-full h-[65vh] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-stone-200 animate-fade-in-up">
            {/* 3D Viewer - Takes full space */}
            <div className="absolute inset-0 z-0">
               <MoleculeViewer data={data} />
            </div>

            {/* AI Badge */}
            <div className="absolute top-4 left-4 z-10 bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-mono border border-white/20 flex items-center gap-2 select-none">
              <Sparkles size={12} className="text-yellow-400"/>
              AI Generate 3D Model
            </div>

            {/* Control Buttons Cluster - Top Right */}
            <div className="absolute top-4 right-4 z-20 flex gap-3">
              {/* Voice Button - Passed data.name to use as cache key */}
              <VoiceButton text={data.description} moleculeName={data.name} />

              {/* Toggle Info Button */}
              <button
                onClick={() => setIsInfoVisible(!isInfoVisible)}
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 border backdrop-blur-md ${
                  isInfoVisible
                    ? 'bg-stone-500 text-white border-stone-400 ring-2 ring-stone-300' 
                    : 'bg-white/10 hover:bg-white/20 border-white/30 text-white'
                }`}
                title="查看信息"
              >
                <BookOpen size={20} />
              </button>
            </div>

            {/* Floating Info Panel */}
            {isInfoVisible && (
              <div className="absolute top-20 right-4 bottom-4 w-full md:w-[400px] z-10 transition-all duration-300 ease-in-out">
                <InfoCard data={data} onClose={() => setIsInfoVisible(false)} />
              </div>
            )}
          </div>
        )}

        {appState === AppState.IDLE && (
          <div className="text-center py-10 opacity-50">
             <div className="max-w-md mx-auto aspect-video rounded-3xl bg-white border-2 border-dashed border-stone-300 flex items-center justify-center">
                <p className="text-stone-400 font-bold text-3xl font-happy">看 我 看 我</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
