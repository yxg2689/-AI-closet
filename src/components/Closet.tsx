import { Filter, Trash2 } from "lucide-react";
import { ClothingCategory, ClothingItem } from "../types";

interface ClosetProps {
  items: ClothingItem[];
  onDelete: (id: string) => void;
}

export default function Closet({ items, onDelete }: ClosetProps) {
  const categories = Object.values(ClothingCategory);

  return (
    <div className="space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">我的衣櫥</h2>
        <button className="p-2 bg-white rounded-full text-morandi-gray hover:text-morandi-blue transition-colors shadow-sm">
          <Filter size={20} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-morandi-gray gap-4">
          <div className="p-6 bg-white rounded-full shadow-sm">
            <Filter size={48} strokeWidth={1} />
          </div>
          <p className="font-medium text-sm">您的衣櫥是空的。開始添加衣物吧！</p>
        </div>
      ) : (
        <div className="space-y-10">
          {categories.map(category => {
            const categoryItems = items.filter(item => item.category === category);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-morandi-gray">{category}</h3>
                  <div className="h-px flex-1 bg-morandi-gray/20" />
                  <span className="text-[10px] font-bold text-morandi-gray bg-white px-2 py-0.5 rounded-full shadow-sm">
                    {categoryItems.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {categoryItems.map(item => (
                    <div key={item.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm border border-morandi-gray/10">
                      <img
                        src={item.imageUrl}
                        alt={item.category}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <div className="flex justify-between items-end">
                          <div className="text-white">
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{item.color}</p>
                            <p className="text-xs font-medium">{item.style}</p>
                          </div>
                          <button
                            onClick={() => onDelete(item.id)}
                            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
