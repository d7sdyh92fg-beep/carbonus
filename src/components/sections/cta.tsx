import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import carMustang from "@/assets/car-mustang.jpg";
import { useTranslations } from "@/hooks/use-translations";

export function CTA() {
  const navigate = useNavigate();
  const { t } = useTranslations();

  const handleNavigateToCars = () => {
    navigate('/automobiliai');
    // Small delay to ensure navigation completes before scrolling
    setTimeout(() => {
      window.scrollTo({
        top: 300, // Reduced scroll to better show cars section
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <section className="py-10 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-3xl overflow-hidden min-h-[300px] md:min-h-[300px] flex items-center">
          {/* Car Image - Left Side */}
          <div className="absolute left-0 top-0 bottom-0 w-full md:w-1/2 lg:w-3/5 opacity-20 md:opacity-100">
            <img
              src={carMustang}
              alt="Red sports car"
              className="w-full h-full object-cover object-center"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          {/* Content - Mobile: Center, Desktop: Right Side */}
          <div className="relative z-10 w-full flex justify-center md:justify-end">
            <div className="w-full md:w-1/2 lg:w-2/5 p-6 md:p-8 lg:p-12 text-white text-center md:text-left">
              <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4">
                {t('cta.title')}
              </h2>
              
              <p className="text-sm md:text-base lg:text-lg mb-6 md:mb-8 leading-relaxed">
                {t('cta.description')}
              </p>
              
              <Button 
                size="lg" 
                className="bg-black hover:bg-gray-800 text-white font-semibold px-6 md:px-8 py-3 rounded-full transition-all duration-300"
                onClick={handleNavigateToCars}
              >
                {t('cta.button')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}