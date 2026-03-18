import { Camera, RefreshCcw, Save, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import React, { useRef, useState } from "react";
import { analyzeClothingImage } from "../services/gemini";
import { ClothingCategory, ClothingItem } from "../types";

interface AddClothingProps {
  onAdd: (item: ClothingItem) => void;
  onCancel: () => void;
}

interface PendingItem {
  id: string;
  image: string;
  analysis: (Partial<ClothingItem> & { isClothing: boolean; canIdentify: boolean }) | null;
  isAnalyzing: boolean;
  note: string;
}

export default function AddClothing({ onAdd, onCancel }: AddClothingProps) {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        const newItem: PendingItem = {
          id: `pending-${Date.now()}`,
          image: dataUrl,
          analysis: null,
          isAnalyzing: true,
          note: "",
        };
        setPendingItems(prev => [...prev, newItem]);
        stopCamera();
        handleAnalyze(newItem.id, dataUrl);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraOpen(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const files = Array.from(fileList) as File[];
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const newItem: PendingItem = {
            id: `pending-${Date.now()}-${index}`,
            image: dataUrl,
            analysis: null,
            isAnalyzing: true,
            note: "",
          };
          setPendingItems(prev => [...prev, newItem]);
          handleAnalyze(newItem.id, dataUrl);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAnalyze = async (id: string, dataUrl: string, note?: string) => {
    setPendingItems(prev => prev.map(item => 
      item.id === id ? { ...item, isAnalyzing: true } : item
    ));
    try {
      const result = await analyzeClothingImage(dataUrl, note);
      setPendingItems(prev => prev.map(item => 
        item.id === id ? { ...item, analysis: result, isAnalyzing: false } : item
      ));
    } catch (err) {
      console.error("Analysis failed:", err);
      setPendingItems(prev => prev.map(item => 
        item.id === id ? { ...item, isAnalyzing: false } : item
      ));
    }
  };

  const handleUpdateNote = (id: string, note: string) => {
    setPendingItems(prev => prev.map(item => 
      item.id === id ? { ...item, note } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setPendingItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveAll = () => {
    const validItems = pendingItems.filter(item => item.analysis?.isClothing && item.analysis?.canIdentify && !item.isAnalyzing);
    validItems.forEach(item => {
      const newItem: ClothingItem = {
        id: `cloth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageUrl: item.image,
        category: item.analysis!.category as ClothingCategory,
        color: item.analysis!.color || "未知",
        style: item.analysis!.style || "休閒",
        tags: item.analysis!.tags || [],
        createdAt: Date.now(),
      };
      onAdd(newItem);
    });
    setPendingItems([]);
  };

  const isAnyAnalyzing = pendingItems.some(item => item.isAnalyzing);
  const hasValidItems = pendingItems.some(item => item.analysis?.isClothing && item.analysis?.canIdentify && !item.isAnalyzing);

  return (
    <div className="fixed inset-0 bg-morandi-bg z-50 overflow-y-auto p-6 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">新增至衣櫥</h2>
        <button onClick={onCancel} className="p-2 bg-white rounded-full text-morandi-gray hover:text-morandi-ink shadow-sm transition-colors">
          <X size={20} />
        </button>
      </div>

      {pendingItems.length === 0 && !isCameraOpen && (
        <div className="space-y-4">
          <button
            onClick={startCamera}
            className="w-full aspect-square border-2 border-dashed border-morandi-gray/30 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-morandi-blue/50 hover:bg-morandi-blue/5 transition-all"
          >
            <div className="p-4 bg-morandi-blue/10 rounded-full text-morandi-blue">
              <Camera size={32} />
            </div>
            <span className="font-medium text-morandi-gray">拍攝照片</span>
          </button>

          <label className="w-full p-4 border border-morandi-gray/20 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-white transition-colors">
            <Upload size={20} className="text-morandi-gray" />
            <span className="font-medium text-morandi-gray">從相簿上傳 (支援多選)</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {isCameraOpen && (
        <div className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 px-6">
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-morandi-gray/20 shadow-lg active:scale-95 transition-transform"
            >
              <div className="w-12 h-12 bg-morandi-blue rounded-full" />
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {pendingItems.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            {pendingItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-white shadow-sm border border-morandi-gray/10">
                  <img src={item.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {item.isAnalyzing && (
                    <div className="absolute inset-0 bg-morandi-ink/40 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                      <RefreshCcw size={32} className="animate-spin" />
                      <span className="font-medium tracking-wide">AI 分析中...</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-4 right-4 p-2 bg-morandi-ink/50 backdrop-blur-md text-white rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {item.analysis && !item.isAnalyzing && (
                  <div className="space-y-4 bg-white p-6 rounded-3xl border border-morandi-gray/10 shadow-sm">
                    {!item.analysis.isClothing ? (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center">
                        這個不可放入衣櫥!
                      </div>
                    ) : !item.analysis.canIdentify ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-morandi-yellow/10 border border-morandi-yellow/20 rounded-2xl text-morandi-brown text-sm font-medium leading-relaxed">
                          無法加入衣櫥請重新上傳或是添加註釋讓AI可以更好辨識這是什麼。
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-morandi-gray font-bold">添加註釋</label>
                          <textarea
                            value={item.note}
                            onChange={(e) => handleUpdateNote(item.id, e.target.value)}
                            placeholder="例如：這是一件深藍色的羊毛大衣..."
                            className="w-full p-4 bg-morandi-bg border border-morandi-gray/20 rounded-2xl text-sm focus:ring-2 focus:ring-morandi-blue focus:border-transparent outline-none transition-all"
                            rows={3}
                          />
                          <button
                            onClick={() => handleAnalyze(item.id, item.image, item.note)}
                            className="w-full p-3 bg-morandi-blue/10 text-morandi-blue rounded-xl text-sm font-bold hover:bg-morandi-blue/20 transition-colors"
                          >
                            重新辨識
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase tracking-widest text-morandi-gray font-bold">類別</label>
                            <p className="font-medium text-morandi-ink">{item.analysis.category}</p>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-widest text-morandi-gray font-bold">顏色</label>
                            <p className="font-medium text-morandi-ink">{item.analysis.color}</p>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-widest text-morandi-gray font-bold">風格</label>
                            <p className="font-medium text-morandi-ink">{item.analysis.style}</p>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-morandi-gray font-bold">標籤</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.analysis.tags?.map(tag => (
                              <span key={tag} className="px-3 py-1 bg-morandi-bg border border-morandi-gray/10 rounded-full text-xs font-medium text-morandi-gray">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-morandi-bg py-4 border-t border-morandi-gray/10">
            <button
              onClick={() => setPendingItems([])}
              className="flex-1 p-4 bg-white border border-morandi-gray/20 rounded-2xl font-bold text-morandi-gray hover:bg-morandi-gray/10 transition-colors shadow-sm"
            >
              清空
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isAnyAnalyzing || !hasValidItems}
              className="flex-[2] p-4 bg-morandi-blue text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-morandi-blue/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save size={20} />
              儲存全部 ({pendingItems.filter(i => i.analysis?.isClothing && i.analysis?.canIdentify && !i.isAnalyzing).length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
