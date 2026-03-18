import { Plus, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import AddClothing from "./components/AddClothing";
import Closet from "./components/Closet";
import Navigation from "./components/Navigation";
import Recommendations from "./components/Recommendations";
import { ClothingItem } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [closet, setCloset] = useState<ClothingItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  // Load closet from localStorage
  useEffect(() => {
    const savedCloset = localStorage.getItem("closet");
    if (savedCloset) {
      try {
        setCloset(JSON.parse(savedCloset));
      } catch (err) {
        console.error("Failed to load closet:", err);
      }
    }
  }, []);

  // Save closet to localStorage
  useEffect(() => {
    localStorage.setItem("closet", JSON.stringify(closet));
  }, [closet]);

  const handleAddItem = (item: ClothingItem) => {
    setCloset(prev => [item, ...prev]);
    setShowAdd(false);
    setActiveTab("closet");
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("您確定要移除這件衣物嗎？")) {
      setCloset(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-morandi-bg text-morandi-ink font-sans selection:bg-morandi-blue/20 selection:text-morandi-ink">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-morandi-bg/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-morandi-gray/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-morandi-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-morandi-blue/20">
            <Sparkles size={18} />
          </div>
          <h1 className="text-lg font-bold tracking-tight">AI 智慧衣櫥</h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="p-2 bg-white/50 rounded-full text-morandi-gray hover:text-morandi-blue hover:bg-white transition-all"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        {activeTab === "home" && (
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold tracking-tight leading-tight">
                您的專屬 <br />
                <span className="text-morandi-blue">AI 造型師。</span>
              </h2>
              <p className="text-morandi-gray font-medium leading-relaxed">
                整理您的衣櫥，發現新的組合，為每個場合打造完美穿搭。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-morandi-blue/10 p-6 rounded-3xl space-y-4">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-morandi-blue shadow-sm">
                  <span className="text-lg font-bold">{closet.length}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-morandi-ink">衣物總數</h3>
                  <p className="text-[10px] uppercase tracking-widest text-morandi-gray font-bold">目前庫存</p>
                </div>
              </div>
              <div className="bg-morandi-green/10 p-6 rounded-3xl space-y-4">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-morandi-green shadow-sm">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-morandi-ink">AI 穿搭</h3>
                  <p className="text-[10px] uppercase tracking-widest text-morandi-gray font-bold">隨時待命</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-morandi-gray">快速操作</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowAdd(true)}
                  className="w-full p-5 bg-morandi-blue text-white rounded-3xl font-bold flex items-center justify-between shadow-xl shadow-morandi-blue/20 active:scale-[0.98] transition-all"
                >
                  <span>添加新衣物</span>
                  <Plus size={20} />
                </button>
                <button
                  onClick={() => setActiveTab("recommend")}
                  className="w-full p-5 bg-white border border-morandi-gray/10 rounded-3xl font-bold flex items-center justify-between shadow-sm active:scale-[0.98] transition-all"
                >
                  <span className="text-morandi-ink">獲取 AI 穿搭建議</span>
                  <Sparkles size={20} className="text-morandi-blue" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "closet" && (
          <Closet items={closet} onDelete={handleDeleteItem} />
        )}

        {activeTab === "recommend" && (
          <Recommendations closet={closet} />
        )}
      </main>

      {/* Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Add Modal */}
      {showAdd && (
        <AddClothing
          onAdd={handleAddItem}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
