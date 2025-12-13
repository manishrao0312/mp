import React from 'react';
import { Search, User, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="relative h-screen w-full text-white overflow-hidden bg-[#090014] selection:bg-fuchsia-500 selection:text-white">
      
      {/* BACKGROUND GRADIENTS (Ambient Glow) */}
      <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-fuchsia-800/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-800/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen z-0" />

      {/* NAVBAR */}
      <nav className="absolute top-0 w-full p-8 flex justify-between items-center z-50">
        <div className="flex gap-12 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
          <Link to="/" className="text-white border-b border-white pb-1 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all">Home</Link>
          <a href="#" className="hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all">Collection</a>
          <a href="#" className="hover:text-white hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all">New Arrivals</a>
        </div>
        
        <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold tracking-[0.3em] text-white uppercase hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all">
           Virtual Try-On
        </Link>

        <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10 cursor-pointer transition">
          <User size={18} />
        </div>
      </nav>

      {/* --- TEXT LAYER --- */}
      {/* Changed pointer-events-none to pointer-events-auto so hovers work! */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center select-none pointer-events-none">
        
        {/* Top Row: "Where ... Fashion" */}
        <div className="w-full flex justify-between px-[6%] mb-[-3vh]">
          <h1 className="pointer-events-auto cursor-default text-[13vw] leading-none font-[100] italic text-white tracking-tighter transform translate-x-8 transition-all duration-300
            drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] 
            hover:drop-shadow-[0_0_50px_rgba(255,255,255,1)] hover:scale-105">
            Where
          </h1>
          <h1 className="pointer-events-auto cursor-default text-[13vw] leading-none font-[100] italic text-white tracking-tighter transform -translate-x-8 transition-all duration-300
            drop-shadow-[0_0_20px_rgba(217,70,239,0.5)] 
            hover:drop-shadow-[0_0_60px_rgba(217,70,239,1)] hover:text-fuchsia-100 hover:scale-105">
            Fashion
          </h1>
        </div>

        {/* Bottom Row: "Meets ... Tech" */}
        <div className="w-full flex justify-between px-[5%] mt-[-4vh]">
          <h1 className="pointer-events-auto cursor-default text-[13vw] leading-none font-[100] text-white tracking-tighter transition-all duration-300
            drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] 
            hover:drop-shadow-[0_0_50px_rgba(255,255,255,1)] hover:scale-105">
            Meets
          </h1>
          <h1 className="pointer-events-auto cursor-default text-[13vw] leading-none font-[100] text-white tracking-tighter transition-all duration-300
            drop-shadow-[0_0_20px_rgba(217,70,239,0.5)] 
            hover:drop-shadow-[0_0_60px_rgba(217,70,239,1)] hover:text-fuchsia-100 hover:scale-105">
            Tech
          </h1>
        </div>
      </div>

      {/* MODEL LAYER */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 h-[92vh] flex items-end pointer-events-none">
        <img src="/model.png" alt="Fashion Model" className="h-full w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" />
      </div>

      {/* UI LAYER */}
      <div className="absolute left-12 bottom-12 z-30 flex flex-col gap-8 hidden md:flex">
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
              <Link to="/tryon" className="text-[10px] font-bold tracking-widest text-white uppercase hover:text-fuchsia-400 transition">Virtual Try-On</Link>
          </div>
      </div>

      <div className="absolute right-12 bottom-10 z-30 w-72 text-right hidden md:block">
          <div className="glass p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors">
            <p className="text-[9px] font-bold tracking-[0.3em] mb-3 text-fuchsia-300 uppercase">AI Powered</p>
            <p className="text-gray-300 text-xs leading-relaxed mb-5 font-light">
                Experience the next generation of digital fashion. Try on any outfit instantly.
            </p>
            <Link to="/tryon">
                <button className="w-full group bg-white text-black py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-fuchsia-400 hover:text-white hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-all duration-300 flex items-center justify-center gap-2">
                    Start Now <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform"/>
                </button>
            </Link>
          </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
          <div className="glass flex items-center justify-between rounded-full pl-6 pr-2 py-2 w-[450px] shadow-2xl hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:border-white/30 transition-all bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-3 flex-1">
                <Search size={16} className="text-gray-400" />
                <input type="text" placeholder="Search collection..." className="bg-transparent border-none outline-none text-white text-sm placeholder-gray-500 font-light w-full" />
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                <SlidersHorizontal size={14} className="text-white" />
              </div>
          </div>
      </div>

    </div>
  );
};

export default Home;