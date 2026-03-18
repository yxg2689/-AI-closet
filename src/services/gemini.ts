import { GoogleGenAI, Type } from "@google/genai";
import { ClothingCategory, ClothingItem, Outfit } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeClothingImage(base64Image: string, userNote?: string): Promise<Partial<ClothingItem> & { isClothing: boolean; canIdentify: boolean }> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
        {
          text: `分析這張圖片。
          1. 判斷這是否為可以穿在身上的東西（包括：上衣、下裝、外套、鞋子、配件、包包、洋裝/連身裙）。如果不是，請將 isClothing 設為 false。
          2. 如果是衣物，嘗試識別其類別、主要顏色、風格以及標籤。
          3. 如果是衣物但資訊不足以辨識（例如圖片太模糊或主體不明確），請將 canIdentify 設為 false。
          ${userNote ? `使用者提供的額外資訊：${userNote}` : ""}
          請使用繁體中文回答。`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isClothing: { type: Type.BOOLEAN, description: "是否為衣物、鞋子、配件或包包" },
          canIdentify: { type: Type.BOOLEAN, description: "是否能成功辨識出具體資訊" },
          category: { type: Type.STRING, enum: Object.values(ClothingCategory), nullable: true },
          color: { type: Type.STRING, nullable: true },
          style: { type: Type.STRING, nullable: true },
          tags: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
        },
        required: ["isClothing", "canIdentify"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function recommendOutfits(
  closet: ClothingItem[],
  context: { weather?: string; occasion?: string }
): Promise<Outfit[]> {
  if (closet.length === 0) return [];

  const closetSummary = closet.map(item => ({
    id: item.id,
    category: item.category,
    color: item.color,
    style: item.style,
    tags: item.tags.join(", "),
  }));

  const prompt = `根據以下衣櫥單品：${JSON.stringify(closetSummary)}。
  請為以下情境推薦 3 套合適的穿搭：${context.weather ? `天氣：${context.weather}` : ""} ${context.occasion ? `場合：${context.occasion}` : ""}。
  每套穿搭通常應包括上衣和下裝，或一件洋裝，加上鞋子，並可選擇性加入外套/配件。
  請為每項推薦提供理由。請使用繁體中文回答。`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            itemIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning: { type: Type.STRING },
          },
          required: ["itemIds", "reasoning"],
        },
      },
    },
  });

  const recommendations = JSON.parse(response.text);
  
  return recommendations.map((rec: any, index: number) => ({
    id: `outfit-${Date.now()}-${index}`,
    items: rec.itemIds.map((id: string) => closet.find(item => item.id === id)).filter(Boolean),
    reasoning: rec.reasoning,
    occasion: context.occasion,
    weatherMatch: context.weather,
  }));
}
