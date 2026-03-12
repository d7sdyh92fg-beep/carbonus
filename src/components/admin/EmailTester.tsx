import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, Eye, FileText } from 'lucide-react';
import { EmailPreview } from './EmailPreview';

export const EmailTester: React.FC = () => {
  const { toast } = useToast();
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingContract, setIsGeneratingContract] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewEmailType, setPreviewEmailType] = useState('');
  const [language, setLanguage] = useState<'lt' | 'en'>('lt');

  const sendTestEmail = async (emailType: string) => {
    if (!testEmail) {
      toast({
        title: "Klaida",
        description: "Įveskite el. pašto adresą",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      let response;
      
      // Test data for emails
      const testData = {
        reservationId: 'test-' + Date.now(),
        customerEmail: testEmail,
        customerName: language === 'lt' ? 'Testas Testavicius' : 'John Testman',
        carName: 'BMW 3 serija',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        totalAmount: 350,
        depositAmount: 300,
        language: language,
      };

      switch (emailType) {
        case 'booking':
          response = await supabase.functions.invoke('send-booking-email', {
            body: {
              ...testData,
              to: testEmail,
            }
          });
          break;
          
        case 'paid':
          response = await supabase.functions.invoke('send-status-email', {
            body: {
              ...testData,
              status: 'paid',
              contractPdfUrl: 'https://example.com/contract.pdf',
            }
          });
          break;
          
        case 'cancelled':
          response = await supabase.functions.invoke('send-status-email', {
            body: {
              ...testData,
              status: 'cancelled',
            }
          });
          break;
          
        case 'completed':
          response = await supabase.functions.invoke('send-status-email', {
            body: {
              ...testData,
              status: 'completed',
            }
          });
          break;
          
        case 'picked_up':
          response = await supabase.functions.invoke('send-status-email', {
            body: {
              ...testData,
              status: 'picked_up',
            }
          });
          break;
          
        case 'payment-reminder':
          response = await supabase.functions.invoke('send-payment-reminder', {
            body: testData
          });
          break;
          
        case 'pickup-reminder':
          response = await supabase.functions.invoke('send-pickup-reminder', {
            body: {
              ...testData,
              pickupDate: testData.startDate,
              pickupTime: '10:00',
            }
          });
          break;
          
        case 'return-reminder':
          response = await supabase.functions.invoke('send-return-reminder', {
            body: {
              ...testData,
              returnDate: testData.endDate,
              returnTime: '10:00',
            }
          });
          break;
          
        case 'feedback':
          response = await supabase.functions.invoke('send-feedback-request', {
            body: testData
          });
          break;
          
        default:
          throw new Error('Unknown email type');
      }

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "El. paštas išsiųstas",
        description: `Testas "${emailType}" el. paštas išsiųstas į ${testEmail}`,
      });
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko išsiųsti el. pašto: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const testData = {
    customerName: language === 'lt' ? 'Testas Testavicius' : 'John Testman',
    carName: 'BMW 3 serija',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalAmount: 350,
    depositAmount: 300,
    reservationId: 'test-' + Date.now(),
    language: language,
  };

  const handlePreview = (emailType: string) => {
    setPreviewEmailType(emailType);
    setShowPreview(true);
  };

  const emailTypes = [
    { id: 'booking', label: 'Rezervacijos patvirtinimas', description: 'Pirminis rezervacijos el. paštas' },
    { id: 'paid', label: 'Apmokėta', description: 'Kai rezervacija apmokėta' },
    { id: 'picked_up', label: 'Atsiimta', description: 'Kai automobilis atsiimtas' },
    { id: 'completed', label: 'Baigta', description: 'Kai nuoma baigta' },
    { id: 'cancelled', label: 'Atšaukta', description: 'Kai rezervacija atšaukta' },
    { id: 'payment-reminder', label: 'Mokėjimo priminimas', description: 'Priminimas apmokėti' },
    { id: 'pickup-reminder', label: 'Atsiėmimo priminimas', description: 'Priminimas atsiimti automobilį' },
    { id: 'return-reminder', label: 'Grąžinimo priminimas', description: 'Priminimas grąžinti automobilį' },
    { id: 'feedback', label: 'Atsiliepimo prašymas', description: 'Po nuomos pabaigos' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          El. pašto testavimas
        </CardTitle>
        <CardDescription>
          Išbandykite visus el. pašto tipus siųsdami testinį el. laišką sau
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Testuojamo el. pašto adresas</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="jusu@pastas.lt"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Įveskite el. pašto adresą, į kurį norite siųsti testinius laiškus
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Kalba / Language</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'lt' | 'en')}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="lt">🇱🇹 Lietuvių kalba</option>
              <option value="en">🇬🇧 English</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Pasirinkite testavimo el. laiškų kalbą
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emailTypes.map((type) => (
            <Card key={type.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{type.label}</h4>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handlePreview(type.id)}
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      Peržiūra
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => sendTestEmail(type.id)}
                      disabled={isSending || !testEmail}
                    >
                      <Send className="h-3 w-3 mr-2" />
                      Siųsti
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <EmailPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        emailType={previewEmailType}
        emailData={testData}
        language={language}
      />
    </Card>
  );
};
