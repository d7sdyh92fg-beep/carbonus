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
import { useTranslations } from "@/hooks/use-translations";
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
  const { t } = useTranslations();
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
    document.title = "Kontaktai - Carbonus | Automobilių nuoma Druskininkuose +370 698 18 781";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Susisiekite su Carbonus dėl automobilių nuomos Druskininkuose ir visoje Lietuvoje. Tel: +370 698 18 781, El. paštas: info@carbonus.lt. Pagrindinis biuras Druskininkuose.');
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
          title: t('contact.errorTitle'),
          description: t('contact.errorDesc'),
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
        title: t('contact.successTitle'),
        description: t('contact.successDesc'),
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
        title: t('contact.errorTitle'),
        description: error.message || t('contact.errorNetwork'),
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
      title: t('contact.info.phone.title'),
      details: ["+370 698 18 781"],
      description: t('contact.info.phone.description')
    },
    {
      icon: Mail,
      title: t('contact.info.email.title'),
      details: ["info@carbonus.lt"],
      description: t('contact.info.email.description')
    },
    {
      icon: MapPin,
      title: t('contact.info.address.title'),
      details: [t('contact.info.address.location')],
      description: t('contact.info.address.description')
    },
    {
      icon: Clock,
      title: t('contact.info.hours.title'),
      details: [
        t('contact.info.hours.weekdays'),
        t('contact.info.hours.weekends')
      ],
      description: t('contact.info.hours.description')
    }
  ];

  const locations = [
    {
      city: t('contact.locations.city'),
      address: t('contact.info.address.location'),
      phone: "+370 698 18 781",
      hours: `${t('contact.info.hours.weekdays')}, ${t('contact.info.hours.weekends')}`
    }
  ];

  const services = [
    {
      icon: Car,
      title: t('contact.services.booking.title'),
      description: t('contact.services.booking.description')
    },
    {
      icon: Headphones,
      title: t('contact.services.support.title'),
      description: t('contact.services.support.description')
    },
    {
      icon: Calendar,
      title: t('contact.services.consultation.title'),
      description: t('contact.services.consultation.description')
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
              {t('contact.badge')}
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('contact.subtitle')}
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
                  <h2 className="text-3xl font-bold text-foreground">{t('contact.form.title')}</h2>
                </div>
                <p className="text-muted-foreground mb-8">
                  {t('contact.form.description')}
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">{t('contact.form.firstName')}</Label>
                      <Input 
                        id="firstName" 
                        placeholder={t('contact.form.placeholders.firstName')}
                        required
                        className="mt-1"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">{t('contact.form.lastName')}</Label>
                      <Input 
                        id="lastName" 
                        placeholder={t('contact.form.placeholders.lastName')}
                        required
                        className="mt-1"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">{t('contact.form.email')}</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder={t('contact.form.placeholders.email')}
                        required
                        className="mt-1"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t('contact.form.phone')}</Label>
                      <Input 
                        id="phone" 
                        type="tel"
                        placeholder={t('contact.form.placeholders.phone')}
                        className="mt-1"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">{t('contact.form.subject')}</Label>
                    <Input 
                      id="subject" 
                      placeholder={t('contact.form.placeholders.subject')}
                      required
                      className="mt-1"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">{t('contact.form.message')}</Label>
                    <Textarea 
                      id="message" 
                      placeholder={t('contact.form.placeholders.message')}
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
                    {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
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
                    {t('contact.services.title')}
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
                      {t('contact.emergency.title')}
                    </h3>
                  </div>
                  <p className="text-red-700 mb-4">
                    {t('contact.emergency.description')}
                  </p>
                    <div className="space-y-2">
                      <p className="font-bold text-red-800 text-lg">
                        📞 +370 698 18 781
                      </p>
                    <p className="text-red-700 text-sm">
                      {t('contact.emergency.availability')}
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
              {t('contact.locations.badge')}
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-12">
              {t('contact.locations.title')}
            </h2>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-4xl space-y-6">
              {/* Quick Contact Buttons */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 text-base font-medium"
                  onClick={() => window.open('https://wa.me/37069818781', '_blank')}
                >
                  <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                  WhatsApp žinutė
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 text-base font-medium"
                  onClick={() => window.open('tel:+37069818781')}
                >
                  <Phone className="h-5 w-5 mr-2 text-blue-600" />
                  Skambinti dabar
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 text-base font-medium"
                  onClick={() => window.open('mailto:info@carbonus.lt')}
                >
                  <Mail className="h-5 w-5 mr-2 text-orange-600" />
                  El. paštas
                </Button>
              </div>
              
              {/* Location Card */}
              {locations.map((location, index) => (
                <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-0">
                    {/* Google Maps Embed */}
                    <div className="w-full h-96 rounded-t-lg overflow-hidden">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d148840.77893341!2d23.7739!3d54.0165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46e0243f0ebefebf%3A0x71e8f0c8a6c6a6a!2sDruskininkai!5e0!3m2!1sen!2slt!4v1234567890123!5m2!1sen!2slt"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Carbonus Druskininkai Location"
                      />
                    </div>
                    
                    {/* Location Info */}
                    <div className="p-8 text-center">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <MapPin className="w-6 h-6 text-primary" />
                        <h3 className="text-2xl font-bold text-foreground">
                          {location.city}
                        </h3>
                      </div>
                      <div className="space-y-3 text-muted-foreground mb-6">
                        <p>
                          <strong>{t('contact.locations.addressLabel')}</strong><br />
                          {location.address}
                        </p>
                        <p>
                          <strong>{t('contact.locations.phoneLabel')}</strong><br />
                          <a href="tel:+37069818781" className="text-primary hover:underline">
                            {location.phone}
                          </a>
                        </p>
                        <p>
                          <strong>{t('contact.locations.hoursLabel')}</strong><br />
                          {location.hours}
                        </p>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => window.open('https://www.google.com/maps/dir//Druskininkai', '_blank')}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {t('contact.locations.routeButton')}
                      </Button>
                    </div>
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