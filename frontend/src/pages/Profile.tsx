import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedResult {
  id: string;
  date: string;
  image: string;
}

const Profile = () => {
  const [history, setHistory] = useState<SavedResult[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("tryon-history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("tryon-history");
    setHistory([]);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground mb-2">
                Your <span className="text-gradient">History</span>
              </h1>
              <p className="text-muted-foreground">
                View your past try-on sessions
              </p>
            </div>

            {history.length > 0 && (
              <Button variant="outline" onClick={clearHistory} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>

          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-12 text-center"
            >
              <div className="p-4 rounded-full bg-muted w-fit mx-auto mb-4">
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No history yet
              </h3>
              <p className="text-muted-foreground">
                Your try-on results will appear here after you generate them.
              </p>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-2xl overflow-hidden"
                >
                  <img
                    src={item.image}
                    alt={`Try-on from ${item.date}`}
                    className="w-full aspect-[3/4] object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">{item.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
