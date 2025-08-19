import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function CTA() {
  const navigate = useNavigate();

  const handleNavigateToCars = () => {
    navigate('/automobiliai');
    // Small delay to ensure navigation completes before scrolling
    setTimeout(() => {
      window.scrollTo({
        top: 600, // Scroll past the hero section to show cars
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-green-900 rounded-3xl overflow-hidden min-h-[300px] flex items-center">
          {/* Car Image - Left Side */}
          <div className="absolute left-0 top-0 bottom-0 w-1/2 lg:w-3/5">
            <img
              src="/src/assets/car-mustang.jpg"
              alt="Red sports car"
              className="w-full h-full object-cover object-center"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          {/* Content - Right Side */}
          <div className="relative z-10 w-full flex justify-end">
            <div className="w-1/2 lg:w-2/5 p-8 lg:p-12 text-white">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4">
                Pasiruošę kelionei?
              </h2>
              
              <p className="text-base lg:text-lg mb-8 leading-relaxed">
                Užsisakykite automobilį bet kur esate ir kelkitės su mumis!
              </p>
              
              <Button 
                size="lg" 
                className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300"
                onClick={handleNavigateToCars}
              >
                Užsakyti dabar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}