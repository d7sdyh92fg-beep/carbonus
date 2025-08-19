import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with car image */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-black/40"></div>
        <img
          src="/src/assets/car-mustang.jpg"
          alt="Sports car"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          Ready to Go?
        </h2>
        
        <p className="text-lg lg:text-xl mb-8 max-w-2xl mx-auto">
          Book your car wherever you are and ride with us now!
        </p>
        
        <Button 
          size="lg" 
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full"
        >
          Book Now
        </Button>
      </div>
    </section>
  );
}