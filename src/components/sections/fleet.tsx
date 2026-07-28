import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Fuel, Settings, Star, Calendar, ArrowRight } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCarSlugFromId } from "@/utils/carSlugs";
import vwPassatSideClean from "@/assets/vw-passat-side-clean.png";
import kiaCeedHatchbackSideCleanGray from "@/assets/kia-ceed-hatchback-side-khaki.png";
import mercedesSlkSide from "@/assets/mercedes-slk-side-clean.png";
import citroenSpacetourerSide from "@/assets/citroen-spacetourer-side-clean.png";
import hyundaiBayonSide from "@/assets/hyundai-bayon-side-clean.png";

interface Car {
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
}

export function Fleet() {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const { data: dbCars } = useQuery({
    queryKey: ['cars-premium-status'],
    queryFn: async () => {
      const { data } = await supabase.from('cars').select('id, is_premium, price_tier1, price_tier3');
      return data || [];
    },
  });
  const getCarDbPrice = (carId: string) => {
    const dbCar = (dbCars || []).find(c => c.id === carId);
    if (dbCar?.price_tier3) return `${dbCar.price_tier3} €`;
    return null;
  };

  const normalize = (t: string) => t.toLowerCase()
    .replace(/ė/g, 'e').replace(/ą/g, 'a').replace(/į/g, 'i')
    .replace(/ų/g, 'u').replace(/ū/g, 'u').replace(/č/g, 'c')
    .replace(/š/g, 's').replace(/ž/g, 'z');

  const cars: Car[] = [
    { id: "6", name: "Mercedes-Benz SLK", price: "100 €", image: mercedesSlkSide, category: "Kabrioletas", passengers: 2, fuel: "Benzinas", transmission: "Automatinė", rating: 4.9, year: 2015 },
    { id: "7", name: "Citroën SpaceTourer", price: "80 €", image: citroenSpacetourerSide, category: "Vienatūris", passengers: 8, fuel: "Dyzelinas", transmission: "Automatinė", rating: 4.8, year: 2026 },
    { id: "8", name: "Hyundai Bayon Cross", price: "50 €", image: hyundaiBayonSide, category: "Krosoveris", passengers: 5, fuel: "Benzinas", transmission: "Automatinė", rating: 4.7, year: 2026 },
    { id: "3", name: "Volkswagen Passat", price: "30 €", image: vwPassatSideClean, category: "Sedanas", passengers: 5, fuel: "Dyzelinas", transmission: "Mechaninė", rating: 4.7, year: 2012 },
    { id: "5", name: "KIA CEED", price: "30 €", image: kiaCeedHatchbackSideCleanGray, category: "Hečbekas", passengers: 5, fuel: "Dyzelinas", transmission: "Mechaninė", rating: 4.6, year: 2020 },
  ];

  const openCar = (id: string) => {
    const slug = getCarSlugFromId(id, 'lt');
    if (slug) {
      navigate(`/automobiliai/${slug}`);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }
  };

  return (
    <section id="cars" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14">
          <div>
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em] mb-3">
              Populiariausi automobiliai
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-[38px] font-bold text-foreground leading-tight">
              Rinkitės iš mūsų geriausių pasiūlymų
            </h2>
          </div>
          <button
            onClick={() => { navigate('/automobiliai'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
            className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1.5 shrink-0"
          >
            Peržiūrėti visus automobilius <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Cars Grid — 5 in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {cars.map((car) => (
            <div
              key={car.id}
              className="group bg-white rounded-2xl border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
            >
              <div className="relative pt-4 px-3">
                <div className="flex items-start justify-between mb-2">
                  <span className="inline-flex items-center rounded-full bg-[#0E1512] text-white text-[11px] font-medium px-3 py-1">
                    {car.category}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-2 py-1 text-[11px] font-semibold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {car.rating}
                  </span>
                </div>
                <div className="relative h-28 md:h-32 flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#fff 0%,#f6f7f8 100%)' }}>
                  <img
                    src={car.image}
                    alt={car.name}
                    loading="lazy"
                    data-allow-save="true"
                    onLoad={() => setLoadedImages(prev => new Set(prev).add(car.id))}
                    className={`max-h-full max-w-full object-contain mix-blend-multiply transition-all duration-300 group-hover:scale-105 ${loadedImages.has(car.id) ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>
              </div>

              <div className="p-4 pt-3 flex flex-col flex-1">
                <h3 className="text-[15px] font-semibold text-foreground mb-3 leading-tight">{car.name}</h3>

                <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[12px] text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /><span>{car.passengers}</span></div>
                  <div className="flex items-center gap-1.5"><Fuel className="h-3.5 w-3.5" /><span>{t(`car.${normalize(car.fuel)}`)}</span></div>
                  <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /><span>{car.year}</span></div>
                  <div className="flex items-center gap-1.5"><Settings className="h-3.5 w-3.5" /><span>{t(`car.${normalize(car.transmission)}`)}</span></div>
                </div>

                <div className="flex items-end justify-between mt-auto pt-3 border-t border-black/5">
                  <div>
                    <div className="text-[10px] text-muted-foreground leading-none mb-0.5">nuo</div>
                    <div className="text-[17px] font-bold text-primary leading-none">
                      {getCarDbPrice(car.id) || car.price} <span className="text-[12px] font-medium text-muted-foreground">/d.</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openCar(car.id)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-8 px-4 text-xs font-semibold"
                  >
                    Rinktis
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View more */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => { navigate('/automobiliai'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
            className="rounded-full border-primary/30 text-foreground hover:bg-primary/5 hover:text-primary px-8 gap-2"
          >
            Žiūrėti daugiau automobilių <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
