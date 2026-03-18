import { Cloud, MapPin, RefreshCcw, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { recommendOutfits } from "../services/gemini";
import { ClothingItem, Outfit } from "../types";

interface RecommendationsProps {
  closet: ClothingItem[];
}

export default function Recommendations({ closet }: RecommendationsProps) {
  const [occasion, setOccasion] = useState("");
  const [weather, setWeather] = useState("晴天, 25°C");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  const handleGenerate = async () => {
    if (closet.length === 0) {
      alert("請先在衣櫥中添加一些衣服！");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await recommendOutfits(closet, { weather, occasion });
      setOutfits(result);
    } catch (err) {
      console.error("Failed to generate outfits:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const occasions = ["工作", "約會", "休閒出遊", "健身房", "婚禮", "旅行"];

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">AI 穿搭指南</h2>
        <div className="p-2 bg-morandi-blue/10 rounded-full text-morandi-blue">
          <Sparkles size={20} />
        </div>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-3xl border border-morandi-gray/10 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-morandi-gray">
            <Cloud size={18} />
            <input
              type="text"
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              placeholder="目前天氣 (例如：下雨, 15°C)"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-morandi-ink placeholder:text-morandi-gray/50"
            />
          </div>
          <div className="flex items-center gap-3 text-morandi-gray">
            <MapPin size={18} />
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="您要去哪裡？"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-morandi-ink placeholder:text-morandi-gray/50"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {occasions.map(occ => (
            <button
              key={occ}
              onClick={() => setOccasion(occ)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                occasion === occ
                  ? "bg-morandi-blue text-white shadow-lg shadow-morandi-blue/20"
                  : "bg-white border border-morandi-gray/20 text-morandi-gray hover:border-morandi-blue hover:text-morandi-blue"
              }`}
            >
              {occ}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || closet.length === 0}
          className="w-full p-4 bg-morandi-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-morandi-blue/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {isGenerating ? (
            <div className="flex items-center gap-2">
              <RefreshCcw size={20} className="animate-spin" />
              <span>正在策劃穿搭...</span>
            </div>
          ) : (
            <>
              <Sparkles size={20} />
              <span>生成推薦</span>
            </>
          )}
        </button>
      </div>

      {outfits.length > 0 && (
        <div className="space-y-10">
          {outfits.map((outfit, idx) => (
            <motion.div
              key={outfit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-morandi-gray">選項 {idx + 1}</h3>
                <div className="h-px flex-1 bg-morandi-gray/20" />
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
                {outfit.items.map(item => (
                  <div key={item.id} className="flex-shrink-0 w-32 aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm border border-morandi-gray/10">
                    <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>

              <div className="bg-morandi-blue/10 p-6 rounded-3xl border border-morandi-blue/10">
                <p className="text-sm text-morandi-ink/80 leading-relaxed font-medium">
                  "{outfit.reasoning}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
