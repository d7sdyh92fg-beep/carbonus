import bmw3Clean from "@/assets/bmw-3-clean.png";
import chryslerTownCountrySide from "@/assets/chrysler-town-country-side.png";
import vwPassatSideClean from "@/assets/fleet-volkswagen-passat-side-v2.png";
import kiaCeedWagonSideClean from "@/assets/fleet-kia-ceed-wagon-side-v2.png";
import kiaCeedHatchbackSideBrown from "@/assets/fleet-kia-ceed-hatchback-side-v2.png";
import mercedesSlkSide from "@/assets/fleet-mercedes-slk-open-top-v3.png";
import citroenSpacetourerSide from "@/assets/fleet-citroen-spacetourer-side-v2.png";
import hyundaiBayonSide from "@/assets/fleet-hyundai-bayon-white-roof-v3.png";

export interface CatalogCar {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  passengers: number;
  fuel: string;
  transmission: string;
  rating: number;
  year: number;
  features: string[];
}

export const CARS_CATALOG: CatalogCar[] = [
  { id: "6", name: "Mercedes-Benz SLK", price: "nuo 100 EUR", image: mercedesSlkSide, category: "Kabrioletas", passengers: 2, fuel: "Benzinas", transmission: "Automatinė", rating: 4.9, year: 2015, features: ["Atidaromas stogas", "Automatinė pavarų dėžė", "Sportinis dizainas"] },
  { id: "7", name: "Citroën SpaceTourer", price: "nuo 80 EUR", image: citroenSpacetourerSide, category: "Vienatūris", passengers: 8, fuel: "Dyzelinas", transmission: "Automatinė", rating: 4.8, year: 2026, features: ["8 keleivių vietos", "Slankiosios durys", "Erdvus salonas"] },
  { id: "8", name: "Hyundai Bayon Cross", price: "nuo 30 EUR", image: hyundaiBayonSide, category: "Krosoveris", passengers: 5, fuel: "Benzinas", transmission: "Automatinė", rating: 5.0, year: 2026, features: ["Automatinė pavarų dėžė", "Modernus LED apšvietimas", "Naujas automobilis"] },
  { id: "4", name: "KIA CEED Universalas", price: "nuo 30 EUR", image: kiaCeedWagonSideClean, category: "Universalas", passengers: 5, fuel: "Benzinas", transmission: "Mechaninė", rating: 4.5, year: 2013, features: ["Ekonomiškas vairavimas", "Erdvus universalas", "Patikimas automobilis"] },
  { id: "5", name: "KIA CEED Hečbekas", price: "nuo 30 EUR", image: kiaCeedHatchbackSideBrown, category: "Hecbekas", passengers: 5, fuel: "Dyzelinas", transmission: "Mechaninė", rating: 4.6, year: 2020, features: ["Ekonomiškas dyzelinis variklis", "Modernus LED apšvietimas", "Patikimas automobilis"] },
  { id: "3", name: "Volkswagen Passat", price: "nuo 30 EUR", image: vwPassatSideClean, category: "Sedanas", passengers: 5, fuel: "Dyzelinas", transmission: "Mechaninė", rating: 4.7, year: 2012, features: ["Ekonomiškas", "Patogus", "Didelis bagažas"] },
  { id: "1", name: "BMW 3 series", price: "nuo 30 EUR", image: bmw3Clean, category: "Sedanas", passengers: 5, fuel: "Benzinas", transmission: "Automatinė", rating: 4.8, year: 2017, features: ["Kondicionierius", "Bluetooth", "GPS navigacija"] },
  { id: "2", name: "Chrysler Town & Country", price: "nuo 30 EUR", image: chryslerTownCountrySide, category: "Miniautobusas", passengers: 7, fuel: "Benzinas", transmission: "Automatinė", rating: 4.6, year: 2014, features: ["7 vietos", "Bagažinė", "Šeimos automobilis"] },
];

// Sold / hidden from public listings
export const HIDDEN_CAR_IDS = new Set(["1", "2"]);
