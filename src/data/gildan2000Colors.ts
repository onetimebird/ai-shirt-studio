// Gildan 2000 Ultra Cotton T-Shirt Colors - Real Product Data
export interface Gildan2000Color {
  name: string;
  label: string;
  value: string; // Hex color for UI display
  frontImage: string;
  backImage: string;
  available: boolean;
}

export const GILDAN_2000_COLORS: Gildan2000Color[] = [
  {
    name: "cherry-red",
    label: "Cherry Red",
    value: "#DC143C",
    frontImage: "/lovable-uploads/3851f8cf-1f20-45e3-ab85-d7a359385550.png",
    backImage: "/lovable-uploads/ae7310e8-e1a0-4784-a7da-9be679d6ba34.png",
    available: true,
  },
  {
    name: "forest-green",
    label: "Forest Green",
    value: "#228B22",
    frontImage: "/lovable-uploads/93d42c03-4c14-4bbe-b681-cbc56236478a.png",
    backImage: "/lovable-uploads/f973c009-4928-4f05-87d2-704d535ecddc.png",
    available: true,
  },
  {
    name: "royal-blue",
    label: "Royal Blue",
    value: "#4169E1",
    frontImage: "/lovable-uploads/826c245a-4fee-48aa-a58e-8b2a284b5f38.png",
    backImage: "/lovable-uploads/e95f088c-404a-4172-955a-2385bf727e9e.png",
    available: true,
  },
  {
    name: "sport-grey",
    label: "Sport Grey",
    value: "#C0C0C0",
    frontImage: "/lovable-uploads/664c1e90-2d8f-485f-bb73-6b323d11e69b.png",
    backImage: "/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png",
    available: true,
  },
  {
    name: "light-pink",
    label: "Light Pink",
    value: "#FFB6C1",
    frontImage: "/lovable-uploads/b6a4745c-848d-4882-a574-c7d02c4d9a03.png",
    backImage: "/lovable-uploads/c6edff31-bd65-4bb0-9df2-5396a76b8f71.png",
    available: true,
  },
  // Placeholder entries for future colors (to be added as more images are uploaded)
  {
    name: "white",
    label: "White",
    value: "#FFFFFF",
    frontImage: "/placeholder-white-front.png",
    backImage: "/placeholder-white-back.png",
    available: false,
  },
  {
    name: "black",
    label: "Black", 
    value: "#000000",
    frontImage: "/placeholder-black-front.png",
    backImage: "/placeholder-black-back.png",
    available: false,
  },
  {
    name: "navy",
    label: "Navy",
    value: "#000080",
    frontImage: "/placeholder-navy-front.png",
    backImage: "/placeholder-navy-back.png", 
    available: false,
  },
];

export const getColorByName = (name: string): Gildan2000Color | undefined => {
  return GILDAN_2000_COLORS.find(color => color.name === name);
};

export const getAvailableColors = (): Gildan2000Color[] => {
  return GILDAN_2000_COLORS.filter(color => color.available);
};