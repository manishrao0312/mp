import React from 'react';
import { Search, User, Menu } from 'lucide-react';

const FashionLanding = () => {
  return (
    <div className="relative h-screen w-full bg-[#0f0518] text-white overflow-hidden">
      
      {/* =========================================
          1. NAVBAR (Layer: Z-50)
          Always on top so you can click links.
      ========================================= */}
      <nav className="absolute top-0 w-full p-6 md:p-8 flex justify-between items-center z-50">
        {/* Left Links */}
        <div className="flex gap-8 text-sm font-light tracking-wide text-gray-300">
          <a href="#" className="text-white border-b border-white pb-1">Home</a>
          <a href="#" className="hover:text-white transition-colors duration-300">Contact</a>
          <a href="#" className="hover:text-white transition-colors duration-300">Try On</a>
        </div>
        
        {/* Center Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 text-xl font-bold tracking-[0.2em] text-white uppercase">
          Logoipsum
        </div>

        {/* Right Icon */}
        <div className="p-2 border border-white/20 rounded-full hover:bg-white/10 cursor-pointer transition">
          <User size={18} />
        </div>
      </nav>

      {/* =========================================
          2. BACKGROUND TEXT (Layer: Z-0)
          Pinned to TOP and BOTTOM to leave the CENTER free.
      ========================================= */}
      
      {/* Top Row: "Where ... Meets" */}
      <div className="absolute top-[18%] w-full flex justify-between px-[5%] z-0 pointer-events-none select-none">
          <h1 className="text-[10vw] leading-none font-thin italic text-outline tracking-tighter transform -translate-y-4">
            Where
          </h1>
          <h1 className="text-[10vw] leading-none font-thin italic text-outline tracking-tighter transform -translate-y-4">
            Meets
          </h1>
      </div>

      {/* Bottom Row: "Fashion ... Technology" */}
      <div className="absolute bottom-[20%] w-full flex justify-between px-[2%] z-0 pointer-events-none select-none">
          <h1 className="text-[10vw] leading-none font-light text-outline tracking-tighter">
            Fashion
          </h1>
          <h1 className="text-[10vw] leading-none font-light text-outline tracking-tighter">
            Technology
          </h1>
      </div>

      {/* =========================================
          3. MODEL IMAGE (Layer: Z-10)
          Centered at bottom. Z-10 puts it ON TOP of text.
      ========================================= */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 h-[85vh] w-auto flex items-end pointer-events-none">
        {/* CRITICAL: This image MUST be a PNG with a transparent background.
            If it has a white box, it will block the text. 
            Place 'model.png' in your 'public' folder.
        */}
        <img 
          src="/model.png" 
          alt="Virtual Try On Model" 
          className="h-full w-auto object-contain drop-shadow-[0_10px_50px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* =========================================
          4. SIDEBAR UI (Layer: Z-20)
          Floating on top of everything.
      ========================================= */}
      
      {/* Left Sidebar: Steps */}
      <div className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-10 hidden md:flex">
          <div className="group cursor-pointer">
              <h3 className="text-3xl font-light text-white/40 group-hover:text-white transition-colors">01</h3>
              <p className="text-[10px] uppercase font-medium tracking-widest mt-1 text-gray-400">Create Account</p>
          </div>
          <div className="group cursor-pointer">
              <h3 className="text-3xl font-light text-white/40 group-hover:text-white transition-colors">02</h3>
              <p className="text-[10px] uppercase font-medium tracking-widest mt-1 text-gray-400">Upload Photo</p>
          </div>
          <div className="group cursor-pointer">
              <h3 className="text-3xl font-light text-white transition-colors">03</h3>
              <p className="text-[10px] uppercase font-medium tracking-widest mt-1 text-purple-300 border-b border-purple-300 inline-block pb-1">
                  Start Try On
              </p>
          </div>
      </div>

      {/* Right Sidebar: Info */}
      <div className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 z-20 w-64 text-right hidden md:block">
          <p className="text-[10px] font-bold tracking-[0.2em] mb-4 text-white uppercase opacity-80">Since 2025</p>
          <p className="text-gray-400 text-xs leading-relaxed mb-6 font-light">
              Experience the future of fashion. 
              Our AI-driven technology adapts to your unique style and body shape instantly.
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-purple-900/50 hover:scale-105 transition transform text-white">
              Explore Collection
          </button>
      </div>

      {/* =========================================
          5. SEARCH BAR (Layer: Z-30)
          Bottom Center.
      ========================================= */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md">
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 shadow-2xl transition hover:bg-white/10">
              <Search size={18} className="text-gray-400" />
              <input 
                  type="text" 
                  placeholder="Search collection..." 
                  className="bg-transparent border-none outline-none text-white text-sm placeholder-gray-500 flex-1 font-light"
              />
              <div className="w-px h-4 bg-white/20"></div>
              <Menu size={18} className="text-gray-400 cursor-pointer hover:text-white transition" />
          </div>
      </div>

    </div>
  );
};

export default FashionLanding;