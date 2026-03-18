export enum ClothingCategory {
  TOP = "上衣",
  BOTTOM = "下裝",
  OUTERWEAR = "外套",
  SHOES = "鞋子",
  ACCESSORY = "配件",
  BAG = "包包",
  DRESS = "洋裝/連身裙"
}

export interface ClothingItem {
  id: string;
  imageUrl: string;
  category: ClothingCategory;
  color: string;
  style: string;
  tags: string[];
  createdAt: number;
}

export interface Outfit {
  id: string;
  items: ClothingItem[];
  reasoning: string;
  occasion?: string;
  weatherMatch?: string;
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  location: string;
}
