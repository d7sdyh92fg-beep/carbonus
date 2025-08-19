import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-background text-foreground py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Newsletter Section */}
          <div className="lg:col-span-1">
            <h3 className="text-3xl font-bold text-foreground mb-2">
              Don't Miss
            </h3>
            <h3 className="text-3xl font-bold text-foreground mb-4">
              a Thing
            </h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter for exclusive deals and updates.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 rounded-full border-border"
              />
              <Button 
                className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6"
              >
                Submit
              </Button>
            </div>
          </div>

          {/* Quick Link */}
          <div>
            <h4 className="font-semibold text-foreground mb-6">Quick Link</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* The Cars */}
          <div>
            <h4 className="font-semibold text-foreground mb-6">The Cars</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cars
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-muted-foreground text-sm">
            Copyright © 2023 GoCar. All rights reserved.
          </p>
        </div>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </footer>
  );
}