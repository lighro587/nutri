
import { ScanResult } from '../types';

export const FOOD_DATABASE: Record<string, Omit<ScanResult, 'id' | 'timestamp' | 'image'>> = {
  "apple": {
    foodName: "Apple",
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fats: 0.2,
    insight: "High in fiber and vitamin C. Great for a quick energy boost.",
    healthScore: 95
  },
  "banana": {
    foodName: "Banana",
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fats: 0.3,
    insight: "Excellent source of potassium and quick energy.",
    healthScore: 90
  },
  "chicken breast": {
    foodName: "Chicken Breast",
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    insight: "Lean protein source, essential for muscle recovery.",
    healthScore: 98
  },
  "rice": {
    foodName: "White Rice",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fats: 0.3,
    insight: "Easily digestible carbohydrate source.",
    healthScore: 70
  },
  "salmon": {
    foodName: "Salmon",
    calories: 208,
    protein: 20,
    carbs: 0,
    fats: 13,
    insight: "Rich in Omega-3 fatty acids and high-quality protein.",
    healthScore: 96
  },
  "egg": {
    foodName: "Egg",
    calories: 78,
    protein: 6,
    carbs: 0.6,
    fats: 5,
    insight: "Complete protein source with essential vitamins.",
    healthScore: 92
  },
  "avocado": {
    foodName: "Avocado",
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fats: 15,
    insight: "Healthy fats and high fiber content.",
    healthScore: 94
  },
  "broccoli": {
    foodName: "Broccoli",
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fats: 0.4,
    insight: "Nutrient-dense vegetable, high in vitamin K and C.",
    healthScore: 99
  },
  "oats": {
    foodName: "Oats",
    calories: 389,
    protein: 16.9,
    carbs: 66.3,
    fats: 6.9,
    insight: "Great source of complex carbohydrates and beta-glucan fiber.",
    healthScore: 93
  },
  "almonds": {
    foodName: "Almonds",
    calories: 579,
    protein: 21.2,
    carbs: 21.7,
    fats: 49.9,
    insight: "High in vitamin E and magnesium.",
    healthScore: 88
  },
  "spinach": {
    foodName: "Spinach",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fats: 0.4,
    insight: "Rich in iron, vitamins, and antioxidants.",
    healthScore: 100
  },
  "sweet potato": {
    foodName: "Sweet Potato",
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fats: 0.1,
    insight: "High in beta-carotene and complex carbs.",
    healthScore: 95
  },
  "greek yogurt": {
    foodName: "Greek Yogurt",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fats: 0.4,
    insight: "Excellent source of protein and probiotics.",
    healthScore: 96
  },
  "quinoa": {
    foodName: "Quinoa",
    calories: 120,
    protein: 4.4,
    carbs: 21.3,
    fats: 1.9,
    insight: "Complete plant-based protein source.",
    healthScore: 97
  },
  "blueberries": {
    foodName: "Blueberries",
    calories: 57,
    protein: 0.7,
    carbs: 14.5,
    fats: 0.3,
    insight: "Packed with antioxidants and vitamin C.",
    healthScore: 98
  },
  "beef": {
    foodName: "Beef (Lean)",
    calories: 250,
    protein: 26,
    carbs: 0,
    fats: 15,
    insight: "Good source of B12 and iron.",
    healthScore: 85
  },
  "tofu": {
    foodName: "Tofu",
    calories: 76,
    protein: 8,
    carbs: 1.9,
    fats: 4.8,
    insight: "Excellent plant-based protein.",
    healthScore: 91
  },
  "pasta": {
    foodName: "Pasta (Cooked)",
    calories: 131,
    protein: 5,
    carbs: 25,
    fats: 1.1,
    insight: "Energy-dense carbohydrate source.",
    healthScore: 65
  },
  "milk": {
    foodName: "Milk (Whole)",
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fats: 3.3,
    insight: "Source of calcium and vitamin D.",
    healthScore: 80
  },
  "orange": {
    foodName: "Orange",
    calories: 47,
    protein: 0.9,
    carbs: 12,
    fats: 0.1,
    insight: "Famous for high Vitamin C content.",
    healthScore: 94
  }
};

export const searchFood = (query: string): Omit<ScanResult, 'id' | 'timestamp' | 'image'> | null => {
    const normalizedQuery = query.toLowerCase().trim();

    // Exact match
    if (FOOD_DATABASE[normalizedQuery]) {
        return FOOD_DATABASE[normalizedQuery];
    }

    // Partial match
    for (const key in FOOD_DATABASE) {
        if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
            return FOOD_DATABASE[key];
        }
    }

    return null;
};
