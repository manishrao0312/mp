import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UploadDropzone from "@/components/UploadDropzone";
import ClothingGallery, { ClothingItem } from "@/components/ClothingGallery";
import ProgressPanel from "@/components/ProgressPanel";
import ResultsCarousel from "@/components/ResultsCarousel";
import Spinner from "@/components/Spinner";
import { clothingItems, sizes } from "@/data/clothing";
import { toast } from "@/hooks/use-toast";

interface TryOnResult {
  index: number;
  image: string;
}

const API_URL = "http://127.0.0.1:8000";

const TryOn = () => {
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [selectedClothing, setSelectedClothing] = useState<ClothingItem[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [results, setResults] = useState<TryOnResult[]>([]);
  const [recommendation, setRecommendation] = useState<string>("");

  const handleClothingSelect = (item: ClothingItem) => {
    setSelectedClothing((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) {
        return prev.filter((c) => c.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const handleGenerate = async () => {
    if (!personImage) {
      toast({
        title: "Missing Photo",
        description: "Please upload your photo first.",
        variant: "destructive",
      });
      return;
    }

    if (selectedClothing.length === 0) {
      toast({
        title: "No Clothing Selected",
        description: "Please select at least one clothing item.",
        variant: "destructive",
      });
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

      // Fetch and append clothing images
      for (const cloth of selectedClothing) {
        setLogs((prev) => [...prev, `Loading ${cloth.name}...`]);
        const response = await fetch(cloth.src);
        const blob = await response.blob();
        formData.append("clothing_images", blob, cloth.name);
      }

      setLogs((prev) => [...prev, "Sending to AI..."]);

      const response = await fetch("http://127.0.0.1:8000/api/swap-clothing", {
    method: "POST",
    body: formData,
});


      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Generation failed");
      }

      if (data.logs) {
        setLogs(data.logs);
      }

      if (data.results) {
        setResults(data.results);
      }

      // Extract recommendation from logs
      const recLog = data.logs?.find((log: string) =>
        log.includes("Gemini recommendation:")
      );
      if (recLog) {
        setRecommendation(recLog.replace("💬 Gemini recommendation: ", ""));
      }

      toast({
        title: "Success!",
        description: "Your try-on images are ready.",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
      setLogs((prev) => [
        ...prev,
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const canGenerate = personImage && selectedClothing.length > 0 && !isLoading;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Virtual <span className="text-gradient">Try-On</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Upload your photo, select outfits, and see the magic happen
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Upload */}
            <div className="space-y-6">
              <UploadDropzone file={personImage} onFileSelect={setPersonImage} />

              {/* Size Selector */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-4">
                  Select Size
                </h3>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full glass">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column - Clothing Gallery */}
            <ClothingGallery
              items={clothingItems}
              selected={selectedClothing}
              onSelect={handleClothingSelect}
            />
          </div>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mb-8"
          >
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="gap-2 px-8 glow-primary"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Try-On
                </>
              )}
            </Button>
          </motion.div>

          {/* Progress Panel */}
          <div className="mb-8">
            <ProgressPanel logs={logs} isLoading={isLoading} />
          </div>

          {/* Results */}
          <ResultsCarousel results={results} recommendation={recommendation} />
        </motion.div>
      </div>
    </div>
  );
};

export default TryOn;
