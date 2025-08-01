// Gildan 18500 Heavy Blend Hoodie Colors - Complete Product Data
export interface Gildan18500Color {
  name: string;
  label: string;
  value: string; // Hex color for UI display
  frontImage: string;
  backImage: string;
  available: boolean;
}

export const GILDAN_18500_COLORS: Gildan18500Color[] = [
  // Row 1 - Basic and Popular Colors
  { name: "white", label: "White", value: "#FFFFFF", frontImage: "/gildan-18500/white-front.jpg", backImage: "/gildan-18500/white-back.jpg", available: true },
  { name: "black", label: "Black", value: "#000000", frontImage: "/gildan-18500/black-front.jpg", backImage: "/gildan-18500/black-back.jpg", available: true },
  { name: "antique-cherry-red", label: "Antique Cherry Red", value: "#8B0000", frontImage: "/gildan-18500/antique-cherry-red-front.jpg", backImage: "/gildan-18500/antique-cherry-red-back.jpg", available: true },
  { name: "antique-sapphire", label: "Antique Sapphire", value: "#082567", frontImage: "/gildan-18500/antique-sapphire-front.jpg", backImage: "/gildan-18500/antique-sapphire-back.jpg", available: true },
  { name: "ash", label: "Ash", value: "#B2BEB5", frontImage: "/gildan-18500/ash-front.jpg", backImage: "/gildan-18500/ash-back.jpg", available: true },
  { name: "cardinal-red", label: "Cardinal Red", value: "#C41E3A", frontImage: "/gildan-18500/cardinal-red-front.jpg", backImage: "/gildan-18500/cardinal-red-back.jpg", available: true },
  { name: "carolina-blue", label: "Carolina Blue", value: "#56A0D3", frontImage: "/gildan-18500/carolina-blue-front.jpg", backImage: "/gildan-18500/carolina-blue-back.jpg", available: true },
  { name: "charcoal", label: "Charcoal", value: "#36454F", frontImage: "/gildan-18500/charcoal-front.jpg", backImage: "/gildan-18500/charcoal-back.jpg", available: true },
  { name: "cherry-red", label: "Cherry Red", value: "#DE3163", frontImage: "/gildan-18500/cherry-red-front.jpg", backImage: "/gildan-18500/cherry-red-back.jpg", available: true },
  { name: "dark-chocolate", label: "Dark Chocolate", value: "#3C2415", frontImage: "/gildan-18500/dark-chocolate-front.jpg", backImage: "/gildan-18500/dark-chocolate-back.jpg", available: true },
  { name: "dark-heather", label: "Dark Heather", value: "#616161", frontImage: "/gildan-18500/dark-heather-front.jpg", backImage: "/gildan-18500/dark-heather-back.jpg", available: true },
  { name: "forest-green", label: "Forest Green", value: "#013220", frontImage: "/gildan-18500/forest-green-front.jpg", backImage: "/gildan-18500/forest-green-back.jpg", available: true },
  { name: "garnet", label: "Garnet", value: "#733635", frontImage: "/gildan-18500/garnet-front.jpg", backImage: "/gildan-18500/garnet-back.jpg", available: true },
  { name: "gold", label: "Gold", value: "#FFD700", frontImage: "/gildan-18500/gold-front.jpg", backImage: "/gildan-18500/gold-back.jpg", available: true },
  { name: "graphite-heather", label: "Graphite Heather", value: "#4A4A4A", frontImage: "/gildan-18500/graphite-heather-front.jpg", backImage: "/gildan-18500/graphite-heather-back.jpg", available: true },

  // Row 2 - Heather and Special Colors
  { name: "heather-dark-green", label: "Heather Dark Green", value: "#2D5016", frontImage: "/gildan-18500/heather-dark-green-front.jpg", backImage: "/gildan-18500/heather-dark-green-back.jpg", available: true },
  { name: "heather-navy", label: "Heather Navy", value: "#2F394D", frontImage: "/gildan-18500/heather-navy-front.jpg", backImage: "/gildan-18500/heather-navy-back.jpg", available: true },
  { name: "heather-sport-dark-maroon", label: "Heather Sport Dark Maroon", value: "#722F37", frontImage: "/gildan-18500/heather-sport-dark-maroon-front.jpg", backImage: "/gildan-18500/heather-sport-dark-maroon-back.jpg", available: true },
  { name: "heliconia", label: "Heliconia", value: "#FF5F8D", frontImage: "/gildan-18500/heliconia-front.jpg", backImage: "/gildan-18500/heliconia-back.jpg", available: true },
  { name: "indigo-blue", label: "Indigo Blue", value: "#4B0082", frontImage: "/gildan-18500/indigo-blue-front.jpg", backImage: "/gildan-18500/indigo-blue-back.jpg", available: true },
  { name: "irish-green", label: "Irish Green", value: "#009A49", frontImage: "/gildan-18500/irish-green-front.jpg", backImage: "/gildan-18500/irish-green-back.jpg", available: true },
  { name: "light-blue", label: "Light Blue", value: "#ADD8E6", frontImage: "/gildan-18500/light-blue-front.jpg", backImage: "/gildan-18500/light-blue-back.jpg", available: true },
  { name: "light-pink", label: "Light Pink", value: "#FFB6C1", frontImage: "/gildan-18500/light-pink-front.jpg", backImage: "/gildan-18500/light-pink-back.jpg", available: true },
  { name: "maroon", label: "Maroon", value: "#800000", frontImage: "/gildan-18500/maroon-front.jpg", backImage: "/gildan-18500/maroon-back.jpg", available: true },
  { name: "military-green", label: "Military Green", value: "#4B5320", frontImage: "/gildan-18500/military-green-front.jpg", backImage: "/gildan-18500/military-green-back.jpg", available: true },
  { name: "navy", label: "Navy", value: "#000080", frontImage: "/gildan-18500/navy-front.jpg", backImage: "/gildan-18500/navy-back.jpg", available: true },
  { name: "orange", label: "Orange", value: "#FFA500", frontImage: "/gildan-18500/orange-front.jpg", backImage: "/gildan-18500/orange-back.jpg", available: true },
  { name: "purple", label: "Purple", value: "#800080", frontImage: "/gildan-18500/purple-front.jpg", backImage: "/gildan-18500/purple-back.jpg", available: true },
  { name: "red", label: "Red", value: "#FF0000", frontImage: "/gildan-18500/red-front.jpg", backImage: "/gildan-18500/red-back.jpg", available: true },
  { name: "royal", label: "Royal", value: "#4169E1", frontImage: "/gildan-18500/royal-front.jpg", backImage: "/gildan-18500/royal-back.jpg", available: true },

  // Row 3 - Safety and Special Colors
  { name: "safety-green", label: "Safety Green", value: "#CCFF00", frontImage: "/gildan-18500/safety-green-front.jpg", backImage: "/gildan-18500/safety-green-back.jpg", available: true },
  { name: "safety-orange", label: "Safety Orange", value: "#FF6600", frontImage: "/gildan-18500/safety-orange-front.jpg", backImage: "/gildan-18500/safety-orange-back.jpg", available: true },
  { name: "sand", label: "Sand", value: "#F4A460", frontImage: "/gildan-18500/sand-front.jpg", backImage: "/gildan-18500/sand-back.jpg", available: true },
  { name: "sapphire", label: "Sapphire", value: "#0F52BA", frontImage: "/gildan-18500/sapphire-front.jpg", backImage: "/gildan-18500/sapphire-back.jpg", available: true },
  { name: "sport-grey", label: "Sport Grey", value: "#9E9E9E", frontImage: "/gildan-18500/sport-grey-front.jpg", backImage: "/gildan-18500/sport-grey-back.jpg", available: true },
  { name: "tan", label: "Tan", value: "#D2B48C", frontImage: "/gildan-18500/tan-front.jpg", backImage: "/gildan-18500/tan-back.jpg", available: true },
  { name: "tennessee-orange", label: "Tennessee Orange", value: "#FF8200", frontImage: "/gildan-18500/tennessee-orange-front.jpg", backImage: "/gildan-18500/tennessee-orange-back.jpg", available: true },
  { name: "texas-orange", label: "Texas Orange", value: "#BF5700", frontImage: "/gildan-18500/texas-orange-front.jpg", backImage: "/gildan-18500/texas-orange-back.jpg", available: true },
  { name: "turf-green", label: "Turf Green", value: "#2E5D3E", frontImage: "/gildan-18500/turf-green-front.jpg", backImage: "/gildan-18500/turf-green-back.jpg", available: true },
  { name: "vintage-heather", label: "Vintage Heather", value: "#8B8680", frontImage: "/gildan-18500/vintage-heather-front.jpg", backImage: "/gildan-18500/vintage-heather-back.jpg", available: true },
  { name: "yellow", label: "Yellow", value: "#FFFF00", frontImage: "/gildan-18500/yellow-front.jpg", backImage: "/gildan-18500/yellow-back.jpg", available: true }
];

// Utility functions to access the color data
export const getColorByName = (name: string): Gildan18500Color | undefined => {
  return GILDAN_18500_COLORS.find(color => color.name === name);
};

export const getAvailableColors = (): Gildan18500Color[] => {
  return GILDAN_18500_COLORS.filter(color => color.available);
};

export const getAllColors = (): Gildan18500Color[] => {
  return GILDAN_18500_COLORS;
};

export const getTotalColorCount = (): number => {
  return GILDAN_18500_COLORS.length;
};

export const getAvailableColorCount = (): number => {
  return GILDAN_18500_COLORS.filter(color => color.available).length;
};