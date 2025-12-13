import React from 'react';
import { MoleculeData } from '../types';
import { Thermometer, Info, Lightbulb } from 'lucide-react';

interface InfoCardProps {
  data: MoleculeData;
  onClose?: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({ data }) => {
  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl h-full overflow-y-auto animate-fade-in-up text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h2 className="text-3xl font-bold text-white shadow-black/50 text-shadow-sm tracking-wide pt-1">{data.name}</h2>
        <div className="bg-white/10 border border-white/20 text-blue-200 px-3 py-1 rounded-full font-mono text-lg font-bold">
          {data.formula}
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
         <p className="text-slate-100 text-base leading-relaxed font-medium tracking-wide shadow-black/50">
          {data.description}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-orange-500/20 p-3 rounded-2xl border border-orange-500/30 flex flex-col items-center text-center backdrop-blur-sm">
          <Thermometer className="text-orange-400 mb-1" size={20} />
          <span className="text-[10px] text-orange-300 uppercase font-bold tracking-wider">物质状态</span>
          <span className="text-lg font-bold text-white">{data.properties.state}</span>
        </div>
        <div className="bg-blue-500/20 p-3 rounded-2xl border border-blue-500/30 flex flex-col items-center text-center backdrop-blur-sm">
          <Info className="text-blue-400 mb-1" size={20} />
          <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">熔点</span>
          <span className="text-lg font-bold text-white">{data.properties.meltingPoint}</span>
        </div>
      </div>

      {/* Fun Fact */}
      <div className="bg-gradient-to-br from-blue-900/60 to-sky-900/60 border border-blue-500/30 p-4 rounded-2xl shadow-inner text-white relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 p-2 opacity-20">
          <Lightbulb size={60} />
        </div>
        <div className="relative z-10">
          <h3 className="text-sm font-bold mb-1 flex items-center gap-2 text-yellow-300">
            <Lightbulb size={16} />
            趣味冷知识
          </h3>
          <p className="text-blue-100 text-sm leading-relaxed">
            {data.funFact}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoCard;