import { LanguageLinks } from "@/components/seo/LanguageLinks";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslations } from "@/hooks/use-translations";
import HomeV3 from "./HomeV3";

const Index = () => {
  const { language } = useTranslations();
  const isEn = language === "en";

  return (
    <>
      <SEOHead
        title={isEn ? "Car rental across Lithuania | Carbonus" : "Automobilių nuoma visoje Lietuvoje | Carbonus"}
        description={
          isEn
            ? "Carbonus car rental with delivery across Lithuania. Clear final price before you book, clean and fully serviced cars."
            : "Carbonus automobilių nuoma su pristatymu visoje Lietuvoje. Aiški galutinė kaina prieš rezervuojant, švarūs ir techniškai patikrinti automobiliai."
        }
        canonical="https://carbonus.lt/"
      />
      <LanguageLinks />
      <HomeV3 />
    </>
  );
};

export default Index;
