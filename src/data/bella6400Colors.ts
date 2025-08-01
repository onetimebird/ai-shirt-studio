// Bella 6400 Women's Relaxed Tee Colors - Complete Product Data
export interface Bella6400Color {
  name: string;
  label: string;
  value: string; // Hex color for UI display
  frontImage: string;
  backImage: string;
  available: boolean;
}

export const BELLA_6400_COLORS: Bella6400Color[] = [
  // Row 1
  { name: "white", label: "White", value: "#FFFFFF", frontImage: "/bella-6400/white-front.jpg", backImage: "/bella-6400/white-back.jpg", available: true },
  { name: "black", label: "Black", value: "#000000", frontImage: "/bella-6400/black-front.jpg", backImage: "/bella-6400/black-back.jpg", available: true },
  { name: "asphalt", label: "Asphalt", value: "#4B4B4D", frontImage: "/bella-6400/asphalt-front.jpg", backImage: "/bella-6400/asphalt-back.jpg", available: true },
  { name: "berry", label: "Berry", value: "#8B008B", frontImage: "/bella-6400/berry-front.jpg", backImage: "/bella-6400/berry-back.jpg", available: true },
  { name: "charity-pink", label: "Charity Pink", value: "#FFB6C1", frontImage: "/bella-6400/charity-pink-front.jpg", backImage: "/bella-6400/charity-pink-back.jpg", available: true },
  { name: "dark-grey", label: "Dark Grey", value: "#A9A9A9", frontImage: "/bella-6400/dark-grey-front.jpg", backImage: "/bella-6400/dark-grey-back.jpg", available: true },
  { name: "dusty-blue", label: "Dusty Blue", value: "#6495ED", frontImage: "/bella-6400/dusty-blue-front.jpg", backImage: "/bella-6400/dusty-blue-back.jpg", available: true },
  { name: "forest", label: "Forest", value: "#013220", frontImage: "/bella-6400/forest-front.jpg", backImage: "/bella-6400/forest-back.jpg", available: true },
  { name: "leaf", label: "Leaf", value: "#8FBC8F", frontImage: "/bella-6400/leaf-front.jpg", backImage: "/bella-6400/leaf-back.jpg", available: true },
  { name: "light-violet", label: "Light Violet", value: "#DDA0DD", frontImage: "/bella-6400/light-violet-front.jpg", backImage: "/bella-6400/light-violet-back.jpg", available: true },
  { name: "maroon", label: "Maroon", value: "#800000", frontImage: "/bella-6400/maroon-front.jpg", backImage: "/bella-6400/maroon-back.jpg", available: true },
  { name: "military-green", label: "Military Green", value: "#4B5320", frontImage: "/bella-6400/military-green-front.jpg", backImage: "/bella-6400/military-green-back.jpg", available: true },
  { name: "natural", label: "Natural", value: "#F5F5DC", frontImage: "/bella-6400/natural-front.jpg", backImage: "/bella-6400/natural-back.jpg", available: true },
  { name: "navy", label: "Navy", value: "#000080", frontImage: "/bella-6400/navy-front.jpg", backImage: "/bella-6400/navy-back.jpg", available: true },
  { name: "pink", label: "Pink", value: "#FFC0CB", frontImage: "/bella-6400/pink-front.jpg", backImage: "/bella-6400/pink-back.jpg", available: true },
  { name: "pink-gravel", label: "Pink Gravel", value: "#D2B48C", frontImage: "/bella-6400/pink-gravel-front.jpg", backImage: "/bella-6400/pink-gravel-back.jpg", available: true },
  { name: "poppy", label: "Poppy", value: "#E25822", frontImage: "/bella-6400/poppy-front.jpg", backImage: "/bella-6400/poppy-back.jpg", available: true },
  { name: "purple-storm", label: "Purple Storm", value: "#663399", frontImage: "/bella-6400/purple-storm-front.jpg", backImage: "/bella-6400/purple-storm-back.jpg", available: true },
  { name: "red", label: "Red", value: "#FF0000", frontImage: "/bella-6400/red-front.jpg", backImage: "/bella-6400/red-back.jpg", available: true },
  { name: "true-royal", label: "True Royal", value: "#1F4E79", frontImage: "/bella-6400/true-royal-front.jpg", backImage: "/bella-6400/true-royal-back.jpg", available: true },

  // Row 2
  { name: "vintage-black", label: "Vintage Black", value: "#2C2C2C", frontImage: "/bella-6400/vintage-black-front.jpg", backImage: "/bella-6400/vintage-black-back.jpg", available: true },
  { name: "vintage-brown", label: "Vintage Brown", value: "#8B4513", frontImage: "/bella-6400/vintage-brown-front.jpg", backImage: "/bella-6400/vintage-brown-back.jpg", available: true },
  { name: "vintage-denim", label: "Vintage Denim", value: "#6F8FAF", frontImage: "/bella-6400/vintage-denim-front.jpg", backImage: "/bella-6400/vintage-denim-back.jpg", available: true },
  { name: "vintage-white", label: "Vintage White", value: "#F8F8FF", frontImage: "/bella-6400/vintage-white-front.jpg", backImage: "/bella-6400/vintage-white-back.jpg", available: true }
];

// Utility functions to access the color data
export const getColorByName = (name: string): Bella6400Color | undefined => {
  return BELLA_6400_COLORS.find(color => color.name === name);
};

export const getAvailableColors = (): Bella6400Color[] => {
  return BELLA_6400_COLORS.filter(color => color.available);
};

export const getAllColors = (): Bella6400Color[] => {
  return BELLA_6400_COLORS;
};

export const getTotalColorCount = (): number => {
  return BELLA_6400_COLORS.length;
};

export const getAvailableColorCount = (): number => {
  return BELLA_6400_COLORS.filter(color => color.available).length;
};