import { motion } from "framer-motion";
import { Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Result {
  index: number;
  image: string;
}

interface ResultsCarouselProps {
  results: Result[];
  recommendation?: string;
}

const ResultsCarousel = ({ results, recommendation }: ResultsCarouselProps) => {
  if (results.length === 0) return null;

  const handleDownload = (image: string, index: number) => {
    const link = document.createElement("a");
    link.href = image;
    link.download = `tryon-result-${index + 1}.png`;
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-accent" />
        Your Try-On Results
      </h3>

      {recommendation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-xl p-4 mb-6 border-accent/30"
        >
          <p className="text-sm text-muted-foreground">
            <span className="text-accent font-medium">AI Recommendation: </span>
            {recommendation}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.map((result, index) => (
          <motion.div
            key={result.index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative rounded-2xl overflow-hidden glass"
            style={{
              boxShadow: "0 8px 32px -8px hsl(239 84% 67% / 0.2)",
            }}
          >
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={result.image}
                alt={`Try-on result ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Look {index + 1}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownload(result.image, index)}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Save
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ResultsCarousel;
