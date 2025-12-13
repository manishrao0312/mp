import React from 'react';
import { Search, User, SlidersHorizontal, ArrowRight } from 'lucide-react';

const App = () => {
  return (
    <div className="relative h-screen w-full text-white overflow-hidden selection:bg-fuchsia-500 selection:text-white">
      
      {/* 0. AMBIENT GLOW */}
      <div className="absolute inset-0 bg-glow z-0 pointer-events-none" />
      
      {/* 1. NAVBAR */}
      <nav className="absolute top-0 w-full p-8 flex justify-between items-center z-50">
        <div className="flex gap-12 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
          <a href="#" className="text-white border-b border-white pb-1">Home</a>
          <a href="#" className="hover:text-white transition-colors">Collection</a>
          <a href="#" className="hover:text-white transition-colors">New Arrivals</a>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold tracking-[0.3em] text-white uppercase">
            Virtual Try-On
        </div>

        <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 cursor-pointer transition">
          <User size={18} />
        </div>
      </nav>

      {/* 2. TEXT LAYER (Solid White & Thin - Matches Target) */}
      <div className="absolute inset-0 z-0 flex flex-col justify-center pointer-events-none select-none">
        
        {/* TOP ROW: "Where ... Meets" */}
        <div className="w-full flex justify-between px-[6%] mb-[-3vh]">
          {/* CHANGED: Removed 'text-outline', used 'text-white' to match the target color */}
          <h1 className="text-[13vw] leading-none font-[100] italic text-white tracking-tighter transform translate-x-8">
            Where
          </h1>
          <h1 className="text-[13vw] leading-none font-[100] italic text-white tracking-tighter transform -translate-x-8">
            Fashion
          </h1>
        </div>

        {/* BOTTOM ROW: "Fashion ... Tech" */}
        <div className="w-full flex justify-between px-[5%] mt-[-4vh]">
          <h1 className="text-[13vw] leading-none font-[100] text-white tracking-tighter">
            Meets
          </h1>
          <h1 className="text-[13vw] leading-none font-[100] text-white tracking-tighter">
            Tech
          </h1>
        </div>
      </div>

      {/* 3. MODEL LAYER */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 h-[92vh] flex items-end pointer-events-none">
        <img 
          src="/model.png" 
          alt="Fashion Model" 
          className="h-full w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* 4. UI LAYER */}
      
      {/* Left Sidebar: Moved Down to Bottom-12 */}
      <div className="absolute left-12 bottom-12 z-20 flex flex-col gap-8 hidden md:flex">
          <div className="group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
              <span className="block text-xs font-bold tracking-[0.2em] mb-1 text-white">01</span>
              <div className="h-px w-8 bg-white mb-2"></div>
              <p className="text-[10px] font-medium tracking-widest text-gray-300 uppercase">Sign Up</p>
          </div>
          <div className="group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
              <span className="block text-xs font-bold tracking-[0.2em] mb-1 text-white">02</span>
              <div className="h-px w-8 bg-white mb-2"></div>
              <p className="text-[10px] font-medium tracking-widest text-gray-300 uppercase">Upload</p>
          </div>
          <div className="group cursor-pointer">
              <span className="block text-xs font-bold tracking-[0.2em] mb-1 text-fuchsia-400">03</span>
              <div className="h-px w-16 bg-fuchsia-400 mb-2"></div>
              <p className="text-[10px] font-bold tracking-widest text-white uppercase">Virtual Try-On</p>
          </div>
      </div>

      {/* Right Sidebar: MOVED WAY DOWN to 'bottom-10' */}
      <div className="absolute right-12 bottom-10 z-20 w-72 text-right hidden md:block">
          <div className="glass p-6 rounded-2xl">
            <p className="text-[9px] font-bold tracking-[0.3em] mb-3 text-fuchsia-300 uppercase">AI Powered</p>
            <p className="text-gray-300 text-xs leading-relaxed mb-5 font-light">
                Experience the next generation of digital fashion. Try on any outfit instantly.
            </p>
            <button className="w-full group bg-white text-black py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-fuchsia-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                Start Now <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform"/>
            </button>
          </div>
      </div>

      {/* Bottom Center: Search Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
          <div className="glass flex items-center justify-between rounded-full pl-6 pr-2 py-2 w-[450px] shadow-2xl hover:border-white/30 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <Search size={16} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search collection..." 
                  className="bg-transparent border-none outline-none text-white text-sm placeholder-gray-500 font-light w-full"
                />
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                <SlidersHorizontal size={14} className="text-white" />
              </div>
          </div>
      </div>

    </div>
  );
};

export default App;