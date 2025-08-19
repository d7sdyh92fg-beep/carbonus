import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted");
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Telefonas",
      details: ["+370 600 12345", "+370 600 54321"],
      description: "24/7 klientų aptarnavimas"
    },
    {
      icon: Mail,
      title: "El. paštas",
      details: ["info@carbonus.lt", "rezervacijos@carbonus.lt"],
      description: "Atsakysime per 2 valandas"
    },
    {
      icon: MapPin,
      title: "Adresas",
      details: ["Gedimino pr. 1", "LT-01103 Vilnius"],
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
      city: "Vilnius",
      address: "Gedimino pr. 1",
      phone: "+370 600 12345",
      hours: "Pr-Pk: 8:00-20:00, Š-S: 9:00-18:00"
    },
    {
      city: "Kaunas",
      address: "Laisvės al. 15",
      phone: "+370 600 23456",
      hours: "Pr-Pk: 8:00-19:00, Š-S: 9:00-17:00"
    },
    {
      city: "Klaipėda",
      address: "Tiltų g. 10",
      phone: "+370 600 34567",
      hours: "Pr-Pk: 8:00-19:00, Š-S: 9:00-17:00"
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Pavardė *</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Jūsų pavardė"
                        required
                        className="mt-1"
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefono numeris</Label>
                      <Input 
                        id="phone" 
                        type="tel"
                        placeholder="+370 600 12345"
                        className="mt-1"
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
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full">
                    Siųsti žinutę
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
                      📞 +370 600 99999
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
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              MŪSŲ BIURAI
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Aplankyti mus galite
            </h2>
            <p className="text-xl text-muted-foreground">
              Turime biurus didžiausiuose Lietuvos miestuose
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {locations.map((location, index) => (
              <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
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
      </section>


      <Footer />
    </div>
  );
};

export default Contact;