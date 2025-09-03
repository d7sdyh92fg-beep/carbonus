import { useEffect, useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Car, 
  Calendar,
  Headphones
} from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    // Set page title and meta tags
    document.title = "Kontaktai - Carbonus | Susisiekite dėl automobilių nuomos +370 698 18 781";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Susisiekite su Carbonus dėl automobilių nuomos. Tel: +370 698 18 781, El. paštas: info@carbonus.lt. Biuras Druskininkuose. Darbo laikas 8-17h.');
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://carbonus.lt/kontaktai');
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Kontaktai - Carbonus');
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://carbonus.lt/kontaktai');
    }
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
        toast({
          title: "Klaida",
          description: "Prašome užpildyti visus privalomus laukus (*)",
          variant: "destructive",
        });
        return;
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) {
        throw error;
      }

      // Success
      toast({
        title: "Žinutė išsiųsta!",
        description: "Ačiū už jūsų žinutę. Susisieksime su jumis kuo greičiau.",
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko išsiųsti žinutės. Bandykite dar kartą arba susisiekite telefonu.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Telefonas",
      details: ["+370 698 18 781"],
      description: "8:00-17:00 klientų aptarnavimas"
    },
    {
      icon: Mail,
      title: "El. paštas",
      details: ["info@carbonus.lt"],
      description: "24/7 atsakysime per 2 valandas"
    },
    {
      icon: MapPin,
      title: "Adresas",
      details: ["Druskininkai"],
      description: "Centrinė būstinė"
    },
    {
      icon: Clock,
      title: "Darbo laikas",
      details: ["Pr-Pk: 8:00-20:00", "Š-S: 9:00-18:00"],
      description: "Automobilio atsiėmimas 24/7"
    }
  ];

  const locations = [
    {
      city: "Druskininkai",
      address: "Druskininkai",
      phone: "+370 698 18 781",
      hours: "Pr-Pk: 8:00-20:00, Š-S: 9:00-18:00"
    }
  ];

  const services = [
    {
      icon: Car,
      title: "Automobilio rezervacija",
      description: "Rezervuokite automobilį telefonu arba užpildykite žemiau esančią formą"
    },
    {
      icon: Headphones,
      title: "Klientų aptarnavimas",
      description: "Mūsų specialistai padės išspręsti visus klausimus 24/7"
    },
    {
      icon: Calendar,
      title: "Konsultacijos",
      description: "Gaukite individualų pasiūlymą pagal jūsų poreikius"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              SUSISIEKITE SU MUMIS
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Kontaktai
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Turite klausimų? Norite rezervuoti automobilį? Mūsų komanda 
              visada pasiruošusi jums padėti. Susisiekite bet kuriuo jums 
              patogiu būdu.
            </p>
          </div>

          {/* Contact Info Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {contactInfo.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className="text-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-4">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {item.title}
                    </h3>
                    <div className="space-y-1 mb-3">
                      {item.details.map((detail, idx) => (
                        <p key={idx} className="font-medium text-foreground">
                          {detail}
                        </p>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-muted/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  <h2 className="text-3xl font-bold text-foreground">Parašykite mums</h2>
                </div>
                <p className="text-muted-foreground mb-8">
                  Užpildykite formą ir mes susisieksime su jumis kuo greičiau. 
                  Taip pat galite tiesiogiai skambinti arba rašyti el. paštu.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Vardas *</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Jūsų vardas"
                        required
                        className="mt-1"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Pavardė *</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Jūsų pavardė"
                        required
                        className="mt-1"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">El. paštas *</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="jusu@email.lt"
                        required
                        className="mt-1"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefono numeris</Label>
                      <Input 
                        id="phone" 
                        type="tel"
                        placeholder="+370 612 34 567"
                        className="mt-1"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Tema *</Label>
                    <Input 
                      id="subject" 
                      placeholder="Automobilio rezervacija"
                      required
                      className="mt-1"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Žinutė *</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Parašykite savo klausimą arba prašymą..."
                      required
                      rows={6}
                      className="mt-1"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Siunčiama...' : 'Siųsti žinutę'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Services & Additional Info */}
            <div className="space-y-8">
              {/* Services */}
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    Kaip galime padėti?
                  </h3>
                  <div className="space-y-6">
                    {services.map((service, index) => {
                      const IconComponent = service.icon;
                      return (
                        <div key={index} className="flex gap-4">
                          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">
                              {service.title}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="shadow-lg bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Phone className="w-6 h-6 text-red-600" />
                    <h3 className="text-xl font-bold text-red-800">
                      Skubūs atvejai
                    </h3>
                  </div>
                  <p className="text-red-700 mb-4">
                    Avarijų, gedimų ar kitų skubių situacijų atveju:
                  </p>
                    <div className="space-y-2">
                      <p className="font-bold text-red-800 text-lg">
                        📞 +370 698 18 781
                      </p>
                    <p className="text-red-700 text-sm">
                      Veikia 24/7 • Atsakysime per 5 minutes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4">
              MŪSŲ BIURAI
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-12">
              Mūsų biuras randasi
            </h2>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {locations.map((location, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <MapPin className="w-6 h-6 text-primary" />
                      <h3 className="text-2xl font-bold text-foreground">
                        {location.city}
                      </h3>
                    </div>
                    <div className="space-y-3 text-muted-foreground">
                      <p>
                        <strong>Adresas:</strong><br />
                        {location.address}
                      </p>
                      <p>
                        <strong>Telefonas:</strong><br />
                        {location.phone}
                      </p>
                      <p>
                        <strong>Darbo laikas:</strong><br />
                        {location.hours}
                      </p>
                    </div>
                    <Button variant="outline" className="w-full mt-6">
                      Maršrutas
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default Contact;