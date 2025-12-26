import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, Check, Loader2, Shirt, ArrowLeft, RefreshCw, Download, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- CONSTANTS ---
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const genders = ["Male", "Female", "Unisex"];

const initialClothingItems = [
  { id: "1", name: "Classic White Shirt", src: "/clothes/white-shirt.jpg",category:"boy" },
  { id: "2", name: "Black Blazer", src: "/clothes/black-blazer.jpg" ,category:"unisex"},
  { id: "3", name: "Denim Jacket", src: "/clothes/denim-jacket.jpg" ,category:"boy"},
  { id: "4", name: "Red Dress", src: "/clothes/red-dress.jpg" ,category:"girl"},
  { id: "5", name: "Navy Suit", src: "/clothes/navy-suit.jpg" ,category:"boy"},
  { id: "6", name: "Floral Blouse", src: "/clothes/floral-blouse.jpg" ,category:"girl"},
  { id: "7", name: "Leather Jacket", src: "/clothes/leather-jacket.jpg" ,category:"unisex"},
  { id: "8", name: "Striped Sweater", src: "/clothes/striped-sweater.jpg" ,category:"boy"},
  { id: "9", name: "Green Shirt", src: "/clothes/greenshirt.jpg" ,category:"boy"},
  { id: "10", name: "Grey Tommy Shirt", src: "/clothes/greytommy.jpg" ,category:"boy"},
  { id: "11", name: "Striper Shirt", src: "/clothes/stripesblack.jpg" ,category:"boy"},
  { id: "12", name: "Blue Shirt", src: "/clothes/blueeee.jpg" ,category:"boy"},
  { id: "13", name: "Creamish Shirt", src: "/clothes/creamish.jpg" ,category:"boy"},
  { id: "14", name: "Red Shirt", src: "/clothes/redfull.jpg" ,category:"boy"},
  { id: "15", name: "Pink Dress", src: "/clothes/womencloth1.jpg" ,category:"girl"},
  { id: "16", name: "Half Saree", src: "/clothes/waglesaree.jpg" ,category:"girl"},
  { id: "17", name: "Traditional Dress", src: "/clothes/creamsaree.jpg" ,category:"girl"},
  { id: "18", name: "Black Suit", src: "/clothes/suit.webp" ,category:"boy"},
  { id: "19", name: "Violet Saree", src: "/clothes/violet saree.jpg",category:"girl" }
];

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const TryOn = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [personImage, setPersonImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [clothingItems, setClothingItems] = useState(initialClothingItems);
  const [selectedClothing, setSelectedClothing] = useState([]);
  
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedGender, setSelectedGender] = useState("Male"); 

  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState([]);
  const [recommendation, setRecommendation] = useState("");

  // Auto-scroll logs
  const logsEndRef = React.useRef(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // --- HANDLERS ---
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPersonImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCustomClothUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newCloth = {
        id: Date.now().toString(),
        name: file.name,
        src: URL.createObjectURL(file),
        fileObject: file
      };
      setClothingItems(prev => [newCloth, ...prev]);
      setSelectedClothing(prev => [...prev, newCloth]);
    }
  };

  const toggleClothingSelection = (item) => {
    setSelectedClothing((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) return prev.filter((c) => c.id !== item.id);
      return [...prev, item];
    });
  };

  const handleGenerate = async () => {
    if (!personImage) {
      alert("Please upload your photo first.");
      return;
    }
    if (selectedClothing.length === 0) {
      alert("Please select at least one clothing item.");
      return;
    }

    // --- NEW GENDER RESTRICTION CHECK ---
    const hasMismatchedCloth = selectedClothing.some(cloth => {
        // We skip checking for 'unisex' items or custom uploads (which might not have a category)
        if (!cloth.category || cloth.category === "unisex") return false;

        if (selectedGender === "Male" && cloth.category === "girl") return true;
        if (selectedGender === "Female" && cloth.category === "boy") return true;
        return false;
    });

    if (hasMismatchedCloth) {
        // You can use a standard alert or a custom toast
        alert(`Incompatible Selection: You cannot add ${selectedGender === "Male" ? "girl" : "boy"} clothing to a ${selectedGender} profile.`);
        return; // Stops the generation process
    }
    // --- END CHECK ---

    setIsLoading(true);
    setLogs([]);
    setResults([]);
    setRecommendation("");

    try {
      setLogs((prev) => [...prev, "⚡ System Initialized..."]);
      // ... rest of your existing fetch/formData code ...
      setLogs((prev) => [...prev, "📸 Analyzing user biometrics..."]);

      const formData = new FormData();
      formData.append("person_image", personImage);
      formData.append("size", selectedSize);
      formData.append("gender", selectedGender);

      for (const cloth of selectedClothing) {
        setLogs((prev) => [...prev, `🧵 Processing fabric texture: ${cloth.name}...`]);
        if (cloth.fileObject) {
           formData.append("clothing_images", cloth.fileObject);
        } else {
           try {
             const response = await fetch(cloth.src);
             if (!response.ok) throw new Error(`Image not found: ${cloth.src}`);
             const blob = await response.blob();
             formData.append("clothing_images", blob, cloth.name + ".jpg");
           } catch (err) {
             console.error("Failed to load image:", cloth.src);
             setLogs(prev => [...prev, `⚠️ Error loading ${cloth.name}. Skipping.`]);
           }
        }
      }

      setLogs((prev) => [...prev, "🚀 Sending payload to Neural Network..."]);

      // Mock delay for visual effect if testing without backend, remove setTimeout in real logic
      // await new Promise(r => setTimeout(r, 2000)); 

      const response = await fetch("https://mp-2-lg8d.onrender.com/api/swap-clothing", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail ? JSON.stringify(data.detail) : "Generation failed");
      }

      if (data.logs) setLogs(data.logs);
      if (data.results) setResults(data.results);
      
      const recLog = data.logs?.find((log) => log.includes("Gemini recommendation:"));
      if (recLog) setRecommendation(recLog.replace("💬 Gemini recommendation: ", ""));

    } catch (error) {
      console.error(error);
      setLogs((prev) => [...prev, `❌ Critical Error: ${error.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white font-sans selection:bg-purple-500/30 selection:text-purple-200 overflow-x-hidden relative">
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-700/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 rounded-full blur-[120px]" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"></div>
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
         <button onClick={() => navigate('/')} className="flex items-center gap-2 group text-gray-400 hover:text-white transition-colors">
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                <ArrowLeft size={18} />
            </div>
            <span className="text-sm font-medium tracking-wide">EXIT STUDIO</span>
         </button>
         <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-mono text-gray-300">SYSTEM ONLINE</span>
         </div>
      </nav>

      <div className="relative z-10 container mx-auto px-6 max-w-7xl pb-20">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          
          {/* HEADER */}
          <motion.div variants={itemVariants} className="text-center mb-16 mt-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-bold tracking-widest uppercase mb-4">
               <Zap size={12} className="fill-current" /> AI Powered Styling
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              Virtual <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 animate-gradient-x">Try-On</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Upload your photo, curate your wardrobe, and let our generative AI redefine your style in seconds.
            </p>
          </motion.div>

          {/* MAIN GRID */}
          <div className="grid lg:grid-cols-12 gap-8 mb-16">
            
            {/* LEFT: UPLOAD & CONFIG (Span 5) */}
            <motion.div variants={itemVariants} className="lg:col-span-5 space-y-6">
              
              {/* PHOTO UPLOAD CARD */}
              <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-1 overflow-hidden group hover:border-fuchsia-500/30 transition-all duration-500 shadow-2xl">
                <div className="relative rounded-[20px] bg-black/50 h-[500px] flex flex-col items-center justify-center overflow-hidden">
                  <input type="file" onChange={handleFileSelect} className="absolute inset-0 opacity-0 z-30 cursor-pointer" accept="image/*" />
                  
                  {previewUrl ? (
                    <>
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover opacity-90" />
                        {/* SCANNER EFFECT */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fuchsia-500/20 to-transparent z-20 h-[20%] w-full animate-scan pointer-events-none" />
                        <div className="absolute bottom-4 left-4 right-4 z-20 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center justify-between">
                            <span className="text-xs font-mono text-fuchsia-300">IMG_SOURCE_DETECTED</span>
                            <RefreshCw size={14} className="text-gray-400" />
                        </div>
                    </>
                  ) : (
                    <div className="text-center p-8 transition-transform duration-500 group-hover:scale-105">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(192,38,211,0.2)]">
                        <Upload className="text-gray-400 group-hover:text-fuchsia-400 transition-colors" size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Upload Reference</h3>
                      <p className="text-sm text-gray-500">Full body or half body shots work best</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CONFIG PANEL */}
              <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                
                <div className="mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Gender Identity</label>
                    <div className="grid grid-cols-3 gap-2 bg-black/30 p-1 rounded-xl">
                    {genders.map((g) => (
                        <button
                        key={g}
                        onClick={() => setSelectedGender(g)}
                        className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                            selectedGender === g 
                            ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg" 
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                        >
                        {g}
                        </button>
                    ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Fit / Size</label>
                    <div className="flex justify-between gap-2">
                    {sizes.map((s) => (
                        <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-full aspect-square rounded-lg text-sm font-bold transition-all border ${
                            selectedSize === s 
                            ? "border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400 shadow-[0_0_10px_rgba(192,38,211,0.2)]" 
                            : "border-transparent bg-black/30 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                        }`}
                        >
                        {s}
                        </button>
                    ))}
                    </div>
                </div>

              </div>
            </motion.div>

            {/* RIGHT: WARDROBE (Span 7) */}
            <motion.div variants={itemVariants} className="lg:col-span-7 flex flex-col h-full">
               <div className="bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col h-[700px]">
                  
                  <div className="flex justify-between items-center mb-6">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-fuchsia-500/20 rounded-lg text-fuchsia-400"><Shirt size={20}/></div>
                         <div>
                            <h3 className="text-lg font-bold text-white">Digital Wardrobe</h3>
                            <p className="text-xs text-gray-500">{clothingItems.length} Available Assets</p>
                         </div>
                     </div>
                     <div className="relative group">
                        <input type="file" onChange={handleCustomClothUpload} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                        <button className="flex items-center gap-2 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-all group-hover:border-fuchsia-500/50 group-hover:text-fuchsia-300">
                           <Upload size={14} /> Import Custom Cloth
                        </button>
                     </div>
                  </div>

                  {/* SCROLLABLE GRID */}
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4">
                        {clothingItems.map((item) => {
                        const isSelected = selectedClothing.find(c => c.id === item.id);
                        return (
                            <motion.div 
                                layout
                                key={item.id}
                                onClick={() => toggleClothingSelection(item)}
                                className={`group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                                    isSelected 
                                    ? "border-fuchsia-500 shadow-[0_0_20px_rgba(192,38,211,0.3)] ring-1 ring-fuchsia-500" 
                                    : "border-white/5 hover:border-white/20"
                                }`}
                            >
                                <img src={item.src} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                                
                                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <p className="text-xs font-medium text-white truncate">{item.name}</p>
                                </div>
                                
                                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-lg ${
                                    isSelected ? "bg-fuchsia-500 scale-100" : "bg-white/20 backdrop-blur scale-0 group-hover:scale-100"
                                }`}>
                                    <Check size={14} className="text-white" />
                                </div>
                            </motion.div>
                        )
                        })}
                    </div>
                  </div>
                  
               </div>
            </motion.div>
          </div>

          {/* GENERATE SECTION */}
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center mb-16">
             <button
                onClick={handleGenerate}
                disabled={isLoading || !personImage || selectedClothing.length === 0}
                className="relative group w-full max-w-md bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 p-[1px] rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500 animate-tilt"></div>
                <div className="relative h-16 bg-black rounded-full flex items-center justify-center gap-3 transition duration-200 group-hover:bg-transparent">
                   {isLoading ? (
                       <>
                        <Loader2 className="animate-spin text-white" />
                        <span className="text-lg font-bold text-white tracking-widest">PROCESSING...</span>
                       </>
                   ) : (
                       <>
                        <Sparkles className="text-fuchsia-200" />
                        <span className="text-lg font-bold text-white tracking-widest group-hover:scale-105 transition-transform">INITIALIZE TRY-ON</span>
                       </>
                   )}
                </div>
             </button>

             {/* TERMINAL LOGS */}
             <AnimatePresence>
                {(isLoading || logs.length > 0) && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-8 w-full max-w-2xl bg-black/80 backdrop-blur border border-green-900/50 rounded-lg p-4 font-mono text-xs shadow-2xl"
                >
                    <div className="flex gap-1.5 mb-3 border-b border-white/10 pb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                        <span className="ml-auto text-green-700">server_node: 8080</span>
                    </div>
                    <div className="h-32 overflow-y-auto space-y-1 custom-scrollbar text-green-400">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                                <span>{log}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </motion.div>
                )}
             </AnimatePresence>
          </motion.div>

          {/* RESULTS REVEAL */}
          <AnimatePresence>
            {results.length > 0 && (
                <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-[3rem] p-8 md:p-16 overflow-hidden"
                >
                {/* Decorative BG elements inside results */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">The New You</h2>
                    {recommendation && (
                        <div className="inline-block bg-white/5 border border-fuchsia-500/30 rounded-xl px-6 py-4 max-w-2xl backdrop-blur-md">
                             <p className="text-fuchsia-200 italic font-medium text-lg">"{recommendation}"</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap justify-center gap-8">
                    {results.map((res, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.2 }}
                            className="group relative w-[300px] md:w-[350px] bg-white/5 rounded-2xl p-2 border border-white/10 hover:border-fuchsia-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(192,38,211,0.2)]"
                        >
                            <div className="relative overflow-hidden rounded-xl aspect-[3/4]">
                                <img src={res.image} alt="Result" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                                    <button className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-gray-200 transform translate-y-4 group-hover:translate-y-0 transition-all">
                                        <Download size={18} /> Download
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div>

      {/* Global Styles for Animations */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { bg: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 3s linear infinite;
        }
        
        .animate-tilt {
            animation: tilt 10s infinite linear;
        }
        @keyframes tilt {
            0%, 50%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(1deg); }
            75% { transform: rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};

export default TryOn;