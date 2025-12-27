
import React, { useState } from 'react';
import { Search, FlaskConical, Loader2, Sparkles, BookOpen, Download } from 'lucide-react';
import { MoleculeData, AppState } from './types';
import { generateMoleculeData } from './services/geminiService';
import { SAMPLE_MOLECULES } from './constants';
import { downloadMoleculeAsHtml } from './services/exportService';
import MoleculeViewer from './components/MoleculeViewer';
import InfoCard from './components/InfoCard';
import VoiceButton from './components/VoiceButton';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [data, setData] = useState<MoleculeData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setAppState(AppState.LOADING);
    setErrorMsg('');
    setQuery(searchTerm);
    setIsInfoVisible(false);

    try {
      const result = await generateMoleculeData(searchTerm);
      setData(result);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      setAppState(AppState.ERROR);
      setErrorMsg("哎呀！实验室机器人没能识别这种物质，请换一个试试！(Gemini API Error)");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleDownload = () => {
    if (data) {
      downloadMoleculeAsHtml(data);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 selection:bg-stone-200 font-sans flex flex-col">
      <header className="bg-[#f3f4f6]/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 cursor-pointer group select-none" onClick={() => window.location.reload()}>
            <div className="relative">
               <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-300 to-blue-400 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
               <div className="relative w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-all duration-300 group-hover:scale-105 group-hover:rotate-6 border-2 border-white/20">
                  <FlaskConical className="text-white transform -rotate-12 drop-shadow-md" size={20} strokeWidth={2.5} />
               </div>
            </div>
            <h1 className="text-xl md:text-3xl font-happy text-slate-800 tracking-wider pt-1">趣味分子实验室</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8 w-full flex-grow flex flex-col">
        <section className="max-w-3xl mx-auto mb-6 md:mb-8 text-center w-full">
          {appState === AppState.IDLE && (
            <h2 className="text-2xl md:text-5xl font-bold mb-6 text-slate-800 animate-fade-in-up tracking-wide">
              你想探索什么物质？
            </h2>
          )}
          
          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="输入物质名称，例如：水、金刚石..."
              className="w-full h-12 md:h-14 pl-5 pr-14 md:pl-6 md:pr-16 rounded-full border-2 border-stone-200 bg-white/80 shadow-sm text-base md:text-lg focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 outline-none transition-all"
            />
            <button 
              type="submit"
              disabled={appState === AppState.LOADING}
              className="absolute right-1.5 top-1.5 h-9 w-9 md:h-11 md:w-11 rounded-full flex items-center justify-center text-stone-400 hover:text-cyan-600 transition-all"
            >
              {appState === AppState.LOADING ? (
                <Loader2 size={20} className="animate-spin text-cyan-500" />
              ) : (
                <Search size={22} />
              )}
            </button>
          </form>

          {appState === AppState.IDLE && (
            <div className="mt-4 flex flex-wrap justify-center gap-2 animate-fade-in-up delay-100">
              {SAMPLE_MOLECULES.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSearch(item.split(' ')[0])}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-white/80 border border-stone-200 rounded-full text-xs md:text-sm font-medium text-slate-600 hover:border-cyan-400 transition-all shadow-sm active:scale-95"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </section>

        {appState === AppState.ERROR && (
          <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-100 rounded-2xl text-center text-red-600">
            <p className="font-bold text-lg">{errorMsg}</p>
          </div>
        )}

        {appState === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center flex-grow py-10 text-stone-400">
            <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-stone-200 border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="mt-6 text-base md:text-lg font-happy animate-pulse text-cyan-600/70">实验室正在合成中...</p>
          </div>
        )}

        {appState === AppState.SUCCESS && data && (
          <div className="relative w-full flex-grow min-h-[50vh] md:min-h-[60vh] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-stone-200 animate-fade-in-up flex flex-col">
            <div className="absolute inset-0 z-0">
               <MoleculeViewer data={data} />
            </div>

            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 flex flex-col md:flex-row gap-2 md:gap-3">
              <button
                onClick={handleDownload}
                className="h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 border backdrop-blur-md bg-blue-600 text-white border-blue-400 hover:bg-blue-500"
                title="导出报告"
              >
                <Download size={18} className="md:w-5 md:h-5" />
              </button>

              <VoiceButton text={data.description} moleculeName={data.name} />

              <button
                onClick={() => setIsInfoVisible(!isInfoVisible)}
                className={`h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 border backdrop-blur-md ${
                  isInfoVisible
                    ? 'bg-stone-500 text-white border-stone-400' 
                    : 'bg-white/10 hover:bg-white/20 border-white/30 text-white'
                }`}
                title="详细信息"
              >
                <BookOpen size={18} className="md:w-5 md:h-5" />
              </button>
            </div>

            {isInfoVisible && (
              <div className="absolute top-14 right-3 bottom-3 md:top-20 md:right-4 md:bottom-4 w-[calc(100%-1.5rem)] md:w-[380px] z-10 transition-all duration-300">
                <InfoCard data={data} onClose={() => setIsInfoVisible(false)} />
              </div>
            )}
          </div>
        )}

        {appState === AppState.IDLE && (
          <div className="text-center py-6 md:py-10 opacity-50 flex-grow flex items-center justify-center">
             <div className="max-w-md w-full aspect-video rounded-3xl bg-white border-2 border-dashed border-stone-300 flex items-center justify-center p-4">
                <p className="text-stone-400 font-bold text-xl md:text-3xl font-happy text-center">输入物质名称或点击下方示例开始探索</p>
             </div>
          </div>
        )}
      </main>
      
      <footer className="py-4 text-center text-[10px] md:text-xs text-stone-400">
        <p>© 趣味分子实验室 - 微观世界探索计划</p>
      </footer>
    </div>
  );
};

export default App;
