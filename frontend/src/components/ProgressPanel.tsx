import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

interface ProgressPanelProps {
  logs: string[];
  isLoading: boolean;
}

const ProgressPanel = ({ logs, isLoading }: ProgressPanelProps) => {
  if (logs.length === 0 && !isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="w-full"
    >
      <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
        <Terminal className="w-5 h-5 text-primary" />
        Progress
      </h3>

      <div className="glass rounded-xl p-4 max-h-48 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-1">
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            </div>
            <span className="text-sm text-muted-foreground">Processing...</span>
          </div>
        )}

        <div className="space-y-1 font-mono text-xs">
          {logs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-muted-foreground"
            >
              <span className="text-primary/60 mr-2">[{index + 1}]</span>
              {log}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressPanel;
