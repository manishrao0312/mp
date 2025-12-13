import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Sparkles, Shirt, User, Loader2, ArrowRight } from 'lucide-react';

const TryOn = () => {
  // --- State Management ---
  const [personImage, setPersonImage] = useState(null);
  const [clothingImages, setClothingImages] = useState([]);
  const [size, setSize] = useState('M');
  const [gender, setGender] = useState('Male'); // Default based on your backend
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);

  // --- Handlers ---
  const handlePersonUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPersonImage(e.target.files[0]);
    }
  };

  const handleClothingUpload = (e) => {
    if (e.target.files) {
      setClothingImages(Array.from(e.target.files).slice(0, 4)); // Limit to 4
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!personImage || clothingImages.length === 0) {
      alert("Please upload both a person and at least one clothing item.");
      return;
    }

    setLoading(true);
    setResults(null);
    setLogs([]);

    const formData = new FormData();
    formData.append('person_image', personImage);
    clothingImages.forEach((file) => {
      formData.append('clothing_images', file);
    });
    formData.append('size', size);
    formData.append('gender', gender);

    try {
      // POINT THIS TO YOUR FASTAPI URL
      const response = await axios.post('http://127.0.0.1:8000/api/swap-clothing', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setResults(response.data.results);
        setLogs(response.data.logs);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-purple-500 selection:text-white">
      
      {/* --- Navbar --- */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          VTO.AI
        </div>
        <a href="#try-on" className="px-5 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition">
          Get Started
        </a>
      </nav>

      {/* --- Hero Section --- */}
      <header className="text-center py-20 px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Wear it before you <br />
          <span className="text-purple-500">buy it.</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Upload your photo, pick a style, and let our GenAI tailor the perfect fit for you in seconds.
        </p>
      </header>

      {/* --- Main Interface --- */}
      <main id="try-on" className="max-w-6xl mx-auto p-4 md:p-8 bg-neutral-900 rounded-3xl border border-neutral-800 shadow-2xl mb-20">
        <div className="grid md:grid-cols-2 gap-12">
          
          {/* LEFT: Controls & Uploads */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="text-purple-400" /> Configure Try-On
              </h2>
              
              {/* Gender & Size Selectors */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Gender</label>
                  <select 
                    value={gender} 
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Size</label>
                  <select 
                    value={size} 
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 focus:outline-none focus:border-purple-500"
                  >
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>

              {/* Upload Areas */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center hover:border-purple-500 transition cursor-pointer relative">
                  <input type="file" onChange={handlePersonUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  <User className="mx-auto h-10 w-10 text-gray-500 mb-2" />
                  <p className="text-sm font-medium">{personImage ? personImage.name : "Upload Your Photo"}</p>
                </div>

                <div className="border-2 border-dashed border-neutral-700 rounded-xl p-6 text-center hover:border-purple-500 transition cursor-pointer relative">
                  <input type="file" multiple onChange={handleClothingUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                  <Shirt className="mx-auto h-10 w-10 text-gray-500 mb-2" />
                  <p className="text-sm font-medium">
                    {clothingImages.length > 0 ? `${clothingImages.length} items selected` : "Upload Clothing (Max 4)"}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Generate Try-On"} 
                {!loading && <ArrowRight size={20} />}
              </button>
            </div>
          </div>

          {/* RIGHT: Results Area */}
          <div className="bg-neutral-950 rounded-2xl p-6 border border-neutral-800 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
             
             {!results && !loading && (
               <div className="text-center text-gray-500">
                 <p className="mb-2">No results yet.</p>
                 <p className="text-sm">Upload images and hit Generate.</p>
               </div>
             )}

             {loading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                 <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
                 <p className="text-purple-300 animate-pulse">AI is styling your outfit...</p>
                 <div className="text-xs text-gray-400 mt-4 max-w-xs text-center">
                    {/* Hacky way to show logs if you want live updates, otherwise hidden */}
                    Check console for detailed logs
                 </div>
               </div>
             )}

             {results && (
               <div className="w-full h-full overflow-y-auto space-y-6">
                 <h3 className="text-xl font-semibold sticky top-0 bg-neutral-950 pb-4 border-b border-neutral-800">Your Results</h3>
                 {results.map((res, idx) => (
                   <div key={idx} className="group relative">
                     <img 
                       src={res.image} 
                       alt={`Result ${idx}`} 
                       className="w-full rounded-lg shadow-lg border border-neutral-700 transition transform hover:scale-[1.02]" 
                     />
                     <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1 rounded text-xs backdrop-blur-md">
                        Outfit #{idx + 1}
                     </div>
                   </div>
                 ))}
                 
                 {/* Logs/Recommendation Section */}
                 <div className="bg-neutral-800/50 p-4 rounded-lg mt-4 text-sm text-gray-300">
                    <p className="font-bold text-purple-400 mb-1">AI Stylist Note:</p>
                    {logs.find(l => l.includes("Recommendation:")) || "Enjoy your new look!"}
                 </div>
               </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default TryOn;