// Car slug mappings for SEO-friendly URLs
// Maps slugs to car IDs and vice versa

export interface CarSlugMapping {
  id: string;
  slug: string;
  slugEn: string;
  name: string;
  category: string;
}

export const CAR_SLUGS: CarSlugMapping[] = [
  {
    id: "1",
    slug: "bmw-3-series-nuoma",
    slugEn: "bmw-3-series-rental",
    name: "BMW 3 series",
    category: "Sedanas"
  },
  {
    id: "2",
    slug: "chrysler-town-country-nuoma",
    slugEn: "chrysler-town-country-rental",
    name: "Chrysler Town & Country",
    category: "Miniautobusas"
  },
  {
    id: "3",
    slug: "volkswagen-passat-nuoma",
    slugEn: "volkswagen-passat-rental",
    name: "Volkswagen Passat",
    category: "Sedanas"
  },
  {
    id: "4",
    slug: "kia-ceed-universalas-nuoma",
    slugEn: "kia-ceed-wagon-rental",
    name: "KIA CEED Universalas",
    category: "Universalas"
  },
  {
    id: "5",
    slug: "kia-ceed-hecbekas-nuoma",
    slugEn: "kia-ceed-hatchback-rental",
    name: "KIA CEED Hečbekas",
    category: "Hecbekas"
  },
  {
    id: "6",
    slug: "mercedes-benz-slk-nuoma",
    slugEn: "mercedes-benz-slk-rental",
    name: "Mercedes-Benz SLK",
    category: "Kabrioletas"
  },
  {
    id: "7",
    slug: "citroen-spacetourer-nuoma",
    slugEn: "citroen-spacetourer-rental",
    name: "Citroën SpaceTourer",
    category: "Vienatūris"
  },
  {
    id: "8",
    slug: "hyundai-bayon-cross-nuoma",
    slugEn: "hyundai-bayon-cross-rental",
    name: "Hyundai Bayon Cross",
    category: "Krosoveris"
  }
];

// Get car ID from slug (Lithuanian or English)
export const getCarIdFromSlug = (slug: string): string | null => {
  const car = CAR_SLUGS.find(c => c.slug === slug || c.slugEn === slug);
  return car ? car.id : null;
};

// Get slug from car ID
export const getCarSlugFromId = (id: string, language: 'lt' | 'en' = 'lt'): string | null => {
  const car = CAR_SLUGS.find(c => c.id === id);
  if (!car) return null;
  return language === 'en' ? car.slugEn : car.slug;
};

// Get car slug mapping by ID
export const getCarSlugMapping = (id: string): CarSlugMapping | null => {
  return CAR_SLUGS.find(c => c.id === id) || null;
};

// Check if a slug is valid
export const isValidCarSlug = (slug: string): boolean => {
  return CAR_SLUGS.some(c => c.slug === slug || c.slugEn === slug);
};
