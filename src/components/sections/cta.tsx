import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function CTA() {
  const navigate = useNavigate();

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
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-black rounded-3xl overflow-hidden min-h-[400px] flex items-center">
          {/* Car Image - Right Side */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-3/5">
            <img
              src="/src/assets/car-mustang.jpg"
              alt="Premium sports car"
              className="w-full h-full object-cover object-center opacity-90"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
          </div>
          
          {/* Content - Left Side */}
          <div className="relative z-10 w-full flex justify-start">
            <div className="w-full lg:w-3/5 p-8 lg:p-16 text-white">
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
                Rezervuokite savo
                <br />
                <span className="text-primary">svajonių automobilį</span>
                <br />
                šiandien
              </h2>
              
              <p className="text-lg lg:text-xl mb-8 leading-relaxed text-gray-300 max-w-lg">
                Patirti geriausią kelionės patirtį su mūsų premium automobilių parku. 
                Pradėkite savo nepamirštamą kelionę jau šiandien.
              </p>
              
              <Button 
                size="lg" 
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-4 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                onClick={handleNavigateToCars}
              >
                Rezervuoti dabar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}