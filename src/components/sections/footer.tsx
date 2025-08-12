import { Button } from "@/components/ui/button";

export function Footer() {
  const sponsors = [
    "logoipsum",
    "logoipsum", 
    "logoipsum",
    "Logoipsum",
    "Logoipsum",
    "Logoipsum"
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Sponsors Section */}
      <div className="border-b border-background/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {sponsors.map((sponsor, index) => (
              <div
                key={index}
                className="text-center opacity-60 hover:opacity-100 transition-opacity duration-200"
              >
                <span className="text-lg font-medium">{sponsor}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4">CARBONUS.</h3>
            <p className="text-background/80 mb-6 max-w-md">
              Experience the ultimate freedom of choice with premium car rentals. 
              Your journey, your car, your way.
            </p>
            <Button variant="outline" className="text-background border-background hover:bg-background hover:text-foreground">
              Get Started
            </Button>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "Cars", "About", "Contact", "FAQ"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-background/80 hover:text-background transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {["Help Center", "Safety", "Terms", "Privacy", "Sitemap"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-background/80 hover:text-background transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/60 text-sm">
            © 2024 Carbonus. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-background/60 hover:text-background text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <a href="#" className="text-background/60 hover:text-background text-sm transition-colors duration-200">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}