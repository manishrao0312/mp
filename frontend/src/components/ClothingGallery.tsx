import { motion } from "framer-motion";
import { Check, Shirt } from "lucide-react";

export interface ClothingItem {
  id: string;
  name: string;
  src: string;
}

interface ClothingGalleryProps {
  items: ClothingItem[];
  selected: ClothingItem[];
  onSelect: (item: ClothingItem) => void;
  maxSelect?: number;
}

const ClothingGallery = ({
  items,
  selected,
  onSelect,
  maxSelect = 4,
}: ClothingGalleryProps) => {
  const isSelected = (item: ClothingItem) =>
    selected.some((s) => s.id === item.id);

  const handleSelect = (item: ClothingItem) => {
    if (isSelected(item)) {
      onSelect(item);
    } else if (selected.length < maxSelect) {
      onSelect(item);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
        <Shirt className="w-5 h-5 text-primary" />
        Select Clothing ({selected.length}/{maxSelect})
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => {
          const itemSelected = isSelected(item);
          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelect(item)}
              disabled={!itemSelected && selected.length >= maxSelect}
              className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
                itemSelected
                  ? "ring-2 ring-primary glow-primary"
                  : "hover:ring-1 hover:ring-primary/50"
              } ${
                !itemSelected && selected.length >= maxSelect
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <div className="aspect-square overflow-hidden bg-secondary">
                <img
                  src={item.src}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {itemSelected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-primary"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/90 to-transparent">
                <p className="text-xs text-foreground truncate">{item.name}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default ClothingGallery;
