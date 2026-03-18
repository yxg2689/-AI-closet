import { Home, Plus, Shirt, Sparkles } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: "home", icon: Home, label: "首頁" },
    { id: "closet", icon: Shirt, label: "衣櫥" },
    { id: "add", icon: Plus, label: "添加" },
    { id: "recommend", icon: Sparkles, label: "AI 穿搭" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-morandi-bg/80 backdrop-blur-md border-t border-morandi-gray/20 px-6 py-3 flex justify-between items-center z-50">
      {tabs.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === id ? "text-morandi-blue" : "text-morandi-gray hover:text-morandi-ink"
          }`}
        >
          <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
          <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
        </button>
      ))}
    </nav>
  );
}
