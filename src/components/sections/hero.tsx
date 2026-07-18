import { useNavigate } from "react-router-dom";
import { useTranslations } from "@/hooks/use-translations";
import { trackEvent } from "@/lib/analytics";
import CarbonusHero from "@/components/CarbonusHero";

export function Hero(_: { carImage?: string }) {
  const navigate = useNavigate();
  const { language } = useTranslations();

  const handleSearch = ({ pickupDate, returnDate }: { pickupDate: string; returnDate: string }) => {
    const days = Math.max(
      1,
      Math.ceil(
        (new Date(returnDate + "T12:00:00").getTime() -
          new Date(pickupDate + "T12:00:00").getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    trackEvent("search_availability", { start: pickupDate, end: returnDate, days });
    const path = language === "en" ? "/cars" : "/automobiliai";
    navigate(`${path}?start=${pickupDate}&end=${returnDate}`);
  };

  return <CarbonusHero heroImage="/images/carbonus-hero-druskininkai.webp" onSearch={handleSearch} />;
}
