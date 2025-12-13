import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Upload, Check, Loader2, Shirt, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- CONSTANTS ---
const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const genders = ["Male", "Female", "Unisex"]; // Added Genders

// Your real clothing items
const initialClothingItems = [
  { id: "1", name: "Classic White Shirt", src: "/clothes/white-shirt.jpg" },
  { id: "2", name: "Black Blazer", src: "/clothes/black-blazer.jpg" },
  { id: "3", name: "Denim Jacket", src: "/clothes/denim-jacket.jpg" },
  { id: "4", name: "Red Dress", src: "/clothes/red-dress.jpg" },
  { id: "5", name: "Navy Suit", src: "/clothes/navy-suit.jpg" },
  { id: "6", name: "Floral Blouse", src: "/clothes/floral-blouse.jpg" },
  { id: "7", name: "Leather Jacket", src: "/clothes/leather-jacket.jpg" },
  { id: "8", name: "Striped Sweater", src: "/clothes/striped-sweater.jpg" },
  { id: "9", name: "Green Shirt", src: "/clothes/greenshirt.jpg" },
  { id: "10", name: "Grey Tommy Shirt", src: "/clothes/greytommy.jpg" },
  { id: "11", name: "Striper Shirt", src: "/clothes/stripesblack.jpg" },
  { id: "12", name: "Blue Shirt", src: "/clothes/blueeee.jpg" },
  { id: "13", name: "Creamish Shirt", src: "/clothes/creamish.jpg" },
  { id: "14", name: "Red Shirt", src: "/clothes/redfull.jpg" },
  { id: "15", name: "Pink Dress", src: "/clothes/womencloth1.jpg" },
  { id: "16", name: "Half Saree", src: "/clothes/waglesaree.jpg" },
  { id: "17", name: "Traditional Dress", src: "/clothes/creamsaree.jpg" },
  { id: "18", name: "Black Suit", src: "/clothes/suit.webp" },
  { id: "19", name: "Violet Saree", src: "/clothes/violet saree.jpg" }
];

const TryOn = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [personImage, setPersonImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [clothingItems, setClothingItems] = useState(initialClothingItems);
  const [selectedClothing, setSelectedClothing] = useState([]);
  
  // 1. ADDED GENDER STATE
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedGender, setSelectedGender] = useState("Male"); 

  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState([]);
  const [recommendation, setRecommendation] = useState("");

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

    setIsLoading(true);
    setLogs([]);
    setResults([]);
    setRecommendation("");

    try {
      setLogs((prev) => [...prev, "Preparing images..."]);

      const formData = new FormData();
      formData.append("person_image", personImage);
      formData.append("size", selectedSize);
      formData.append("gender", selectedGender); // 2. SEND GENDER TO BACKEND

      // Process Clothing Items
      for (const cloth of selectedClothing) {
        setLogs((prev) => [...prev, `Processing ${cloth.name}...`]);
        
        if (cloth.fileObject) {
           // It's a user uploaded cloth
           formData.append("clothing_images", cloth.fileObject);
        } else {
           // It's a gallery item (fetch from URL)
           try {
             const response = await fetch(cloth.src);
             // If image doesn't exist locally, fetch returns 404 HTML, which breaks things.
             if (!response.ok) throw new Error(`Image not found: ${cloth.src}`);
             const blob = await response.blob();
             formData.append("clothing_images", blob, cloth.name + ".jpg");
           } catch (err) {
             console.error("Failed to load image:", cloth.src);
             setLogs(prev => [...prev, `⚠️ Error loading ${cloth.name}. Skipping.`]);
           }
        }
      }

      setLogs((prev) => [...prev, "Sending to AI Server..."]);

      // --- API CALL ---
      const response = await fetch("http://127.0.0.1:8000/api/swap-clothing", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Log detailed backend error
        console.error("Backend Error:", data); 
        throw new Error(data.detail ? JSON.stringify(data.detail) : "Generation failed");
      }

      if (data.logs) setLogs(data.logs);
      if (data.results) setResults(data.results);

      const recLog = data.logs?.find((log) => log.includes("Gemini recommendation:"));
      if (recLog) setRecommendation(recLog.replace("💬 Gemini recommendation: ", ""));

    } catch (error) {
      console.error(error);
      setLogs((prev) => [...prev, `❌ Error: ${error.message}`]);
      // If error is 422, it's usually missing fields
      if (error.message.includes("422")) {
        alert("Server Error: Missing Data. Check if Backend expects 'gender' field.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05010a] text-white pt-12 pb-12 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-white transition bg-black/50 p-2 rounded-full backdrop-blur-md"
      >
        <ArrowLeft size={20} /> <span className="text-sm font-bold">EXIT</span>
      </button>

      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          {/* HEADER */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter text-white">
              Virtual Try-On
            </h1>
            <p className="text-2xl md:text-3xl font-bold mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-purple-600">
              Where Fashion Meets Tech
            </p>
            <p className="text-gray-400 text-lg">Upload your photo, mix & match outfits, and see the magic.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-12">
            
            {/* LEFT COLUMN: UPLOADS & CONFIG */}
            <div className="space-y-8">
              
              {/* 1. Person Upload */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-fuchsia-500/50 transition duration-300">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><Upload size={18} className="text-fuchsia-400"/> Your Photo</h3>
                
                <div className="relative group cursor-pointer border-2 border-dashed border-white/20 rounded-xl h-64 flex flex-col items-center justify-center bg-black/20 overflow-hidden">
                  <input type="file" onChange={handleFileSelect} className="absolute inset-0 opacity-0 z-20 cursor-pointer" accept="image/*" />
                  
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="text-center p-6 transition group-hover:scale-110">
                      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-400">Drag & drop or click to upload</p>
                    </div>
                  )}
                  {previewUrl && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10">
                        <p className="text-white font-bold">Change Photo</p>
                      </div>
                  )}
                </div>
              </div>

              {/* 2. CONFIGURATION (Size & Gender) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                
                {/* Gender Selector */}
                <h3 className="text-lg font-medium mb-4">Select Gender</h3>
                <div className="flex gap-3 mb-6">
                  {genders.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGender(g)}
                      className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                        selectedGender === g 
                        ? "bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.5)]" 
                        : "bg-white/10 text-gray-400 hover:bg-white/20"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                {/* Size Selector */}
                <h3 className="text-lg font-medium mb-4">Select Size</h3>
                <div className="flex gap-3 flex-wrap">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`h-12 w-12 rounded-lg font-bold transition-all ${
                        selectedSize === s 
                        ? "bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.5)] scale-110" 
                        : "bg-white/10 text-gray-400 hover:bg-white/20"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CLOTHING GALLERY */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-medium flex items-center gap-2"><Shirt size={18} className="text-fuchsia-400"/> Wardrobe</h3>
                 <div className="relative">
                    <input type="file" onChange={handleCustomClothUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <button className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition">
                       + Upload New
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {clothingItems.map((item) => {
                  const isSelected = selectedClothing.find(c => c.id === item.id);
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleClothingSelection(item)}
                      className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 group ${
                        isSelected ? "border-fuchsia-500 shadow-[0_0_20px_rgba(192,38,211,0.3)]" : "border-transparent hover:border-white/30"
                      }`}
                    >
                      <img src={item.src} alt={item.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                      <p className="absolute bottom-2 left-2 text-xs font-medium text-white truncate w-11/12">{item.name}</p>
                      
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected ? "bg-fuchsia-500 scale-100" : "bg-black/50 scale-0 group-hover:scale-100"
                      }`}>
                        <Check size={14} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">Selected: {selectedClothing.length} items</p>
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <div className="flex justify-center mb-12">
             <button
                onClick={handleGenerate}
                disabled={isLoading || !personImage || selectedClothing.length === 0}
                className="relative group bg-gradient-to-r from-fuchsia-600 to-purple-600 px-12 py-4 rounded-full font-bold text-xl tracking-widest uppercase transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(192,38,211,0.3)]"
             >
                <span className="flex items-center gap-3">
                   {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                   {isLoading ? "Styling..." : "Generate Try-On"}
                </span>
                <div className="absolute inset-0 rounded-full bg-white/20 blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
             </button>
          </div>

          {/* PROGRESS LOGS */}
          <AnimatePresence>
            {(isLoading || logs.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-12 bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-green-400 max-w-2xl mx-auto overflow-hidden"
              >
                 {logs.map((log, i) => (
                    <div key={i} className="mb-1">{log}</div>
                 ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* RESULTS AREA */}
          {results.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

               <div className="relative z-10 text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">Your New Look</h2>
                  {recommendation && (
                    <p className="text-fuchsia-300 italic">" {recommendation} "</p>
                  )}
               </div>

               <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory justify-center">
                  {results.map((res, idx) => (
                     <div key={idx} className="snap-center shrink-0 w-[300px] md:w-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                        <img src={res.image} alt="Result" className="w-full h-auto" />
                        <div className="bg-black/80 p-4 flex justify-between items-center">
                           <span className="text-sm text-gray-300">Outfit #{idx + 1}</span>
                           <button className="text-xs bg-white text-black px-3 py-1 rounded font-bold hover:bg-gray-200">Download</button>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
};

export default TryOn;