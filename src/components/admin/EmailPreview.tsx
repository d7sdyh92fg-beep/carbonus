import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  emailType: string;
  emailData: {
    customerName: string;
    carName: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    depositAmount: number;
    reservationId: string;
  };
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  isOpen,
  onClose,
  emailType,
  emailData,
}) => {
  const getEmailTitle = (type: string): string => {
    const titles: { [key: string]: string } = {
      booking: 'Rezervacijos patvirtinimas',
      paid: 'Apmokėjimo patvirtinimas',
      picked_up: 'Automobilio atsiėmimas',
      completed: 'Nuomos užbaigimas',
      cancelled: 'Rezervacijos atšaukimas',
      'payment-reminder': 'Mokėjimo priminimas',
      'pickup-reminder': 'Atsiėmimo priminimas',
      'return-reminder': 'Grąžinimo priminimas',
      'contract-confirmation': 'Sutarties patvirtinimas',
      feedback: 'Atsiliepimo prašymas',
    };
    return titles[type] || 'El. paštas';
  };

  const getEmailContent = (type: string): string => {
    const commonStyles = `
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    `;

    const headerStyles = `
      background: linear-gradient(135deg, #0a5028 0%, #2d8659 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    `;

    const contentStyles = `
      padding: 30px 20px;
      line-height: 1.6;
      color: #333333;
    `;

    const detailsBoxStyles = `
      background-color: #f8f9fa;
      border-left: 4px solid #0a5028;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    `;

    const buttonStyles = `
      display: inline-block;
      background-color: #0a5028;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: bold;
    `;

    const footerStyles = `
      text-align: center;
      padding: 20px;
      color: #666666;
      font-size: 12px;
      border-top: 1px solid #eeeeee;
      margin-top: 30px;
    `;

    const templates: { [key: string]: string } = {
      booking: `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">Carbonus</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Automobilių nuoma</p>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #0a5028;">Sveiki, ${emailData.customerName}!</h2>
            <p>Dėkojame už rezervaciją! Gavome Jūsų užklausą ir netrukus ją patvirtinsime.</p>
            
            <div style="${detailsBoxStyles}">
              <h3 style="margin-top: 0; color: #0a5028;">Rezervacijos detalės:</h3>
              <p><strong>Rezervacijos nr.:</strong> ${emailData.reservationId}</p>
              <p><strong>Automobilis:</strong> ${emailData.carName}</p>
              <p><strong>Pradžios data:</strong> ${emailData.startDate}</p>
              <p><strong>Pabaigos data:</strong> ${emailData.endDate}</p>
              <p><strong>Suma:</strong> €${emailData.totalAmount}</p>
              <p><strong>Užstatas:</strong> €${emailData.depositAmount}</p>
            </div>

            <p>Netrukus su Jumis susisieksime ir patvirtinsime rezervaciją.</p>
          </div>
          <div style="${footerStyles}">
            <p>Carbonus automobilių nuoma</p>
            <p>El. paštas: info@carbonus.lt | Tel: +370 123 45678</p>
          </div>
        </div>
      `,
      paid: `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">✓ Apmokėjimas patvirtintas</h1>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #0a5028;">Sveiki, ${emailData.customerName}!</h2>
            <p>Puiku! Jūsų apmokėjimas patvirtintas ir rezervacija užregistruota.</p>
            
            <div style="${detailsBoxStyles}">
              <h3 style="margin-top: 0; color: #0a5028;">Rezervacijos informacija:</h3>
              <p><strong>Automobilis:</strong> ${emailData.carName}</p>
              <p><strong>Nuomos laikotarpis:</strong> ${emailData.startDate} - ${emailData.endDate}</p>
              <p><strong>Sumokėta:</strong> €${emailData.totalAmount}</p>
            </div>

            <p>Nuomos sutartis pridėta prie šio el. laiško. Prašome ją atspausdinti ir atsivežti automobilio atsiėmimo dieną.</p>
            
            <a href="#" style="${buttonStyles}">Peržiūrėti sutartį</a>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              <strong>Svarbu:</strong> Automobilio atsiėmimo dieną turėsite pateikti vairuotojo pažymėjimą ir asmens dokumentą.
            </p>
          </div>
          <div style="${footerStyles}">
            <p>Iki greito pasimatymo!</p>
            <p>Carbonus automobilių nuoma</p>
          </div>
        </div>
      `,
      picked_up: `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">🚗 Geros kelionės!</h1>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #0a5028;">Sveiki, ${emailData.customerName}!</h2>
            <p>Dėkojame, kad pasirinkote Carbonus! Linkime saugios ir malonios kelionės su ${emailData.carName}.</p>
            
            <div style="${detailsBoxStyles}">
              <h3 style="margin-top: 0; color: #0a5028;">Primename:</h3>
              <p><strong>Grąžinimo data:</strong> ${emailData.endDate}</p>
              <p><strong>Grąžinimo laikas:</strong> 10:00</p>
              <p><strong>Vieta:</strong> Carbonus biuras</p>
            </div>

            <p>Jei kiltų klausimų ar problemų kelionės metu, nedvejodami susisiekite su mumis.</p>

            <p style="margin-top: 20px;">
              <strong>Kontaktai pagalbai:</strong><br>
              Tel: +370 123 45678<br>
              El. paštas: info@carbonus.lt
            </p>
          </div>
          <div style="${footerStyles}">
            <p>Saugios kelionės!</p>
            <p>Carbonus komanda</p>
          </div>
        </div>
      `,
      completed: `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">✓ Nuoma užbaigta</h1>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #0a5028;">Sveiki, ${emailData.customerName}!</h2>
            <p>Dėkojame, kad pasirinkote Carbonus automobilių nuomą!</p>
            
            <div style="${detailsBoxStyles}">
              <h3 style="margin-top: 0; color: #0a5028;">Nuomos informacija:</h3>
              <p><strong>Automobilis:</strong> ${emailData.carName}</p>
              <p><strong>Nuomos laikotarpis:</strong> ${emailData.startDate} - ${emailData.endDate}</p>
            </div>

            <p>Jūsų užstatas bus grąžintas per 3-5 darbo dienas, jei nebuvo jokių papildomų mokesčių.</p>

            <p style="margin-top: 30px;">Būtume dėkingi už Jūsų atsiliepimą apie mūsų paslaugas!</p>
            
            <a href="#" style="${buttonStyles}">Palikti atsiliepimą</a>
          </div>
          <div style="${footerStyles}">
            <p>Laukiame Jūsų dar kartą!</p>
            <p>Carbonus komanda</p>
          </div>
        </div>
      `,
      cancelled: `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">Rezervacija atšaukta</h1>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #0a5028;">Sveiki, ${emailData.customerName}!</h2>
            <p>Informuojame, kad Jūsų rezervacija buvo atšaukta.</p>
            
            <div style="${detailsBoxStyles}">
              <h3 style="margin-top: 0; color: #0a5028;">Atšauktos rezervacijos duomenys:</h3>
              <p><strong>Rezervacijos nr.:</strong> ${emailData.reservationId}</p>
              <p><strong>Automobilis:</strong> ${emailData.carName}</p>
              <p><strong>Pradžios data:</strong> ${emailData.startDate}</p>
              <p><strong>Pabaigos data:</strong> ${emailData.endDate}</p>
            </div>

            <p>Jei sumokėjote už rezervaciją, pinigai bus grąžinti per 5-7 darbo dienas.</p>

            <p style="margin-top: 20px;">Jei turite klausimų, prašome susisiekti su mumis.</p>
          </div>
          <div style="${footerStyles}">
            <p>Carbonus automobilių nuoma</p>
            <p>El. paštas: info@carbonus.lt | Tel: +370 123 45678</p>
          </div>
        </div>
      `,
      'payment-reminder': `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">⏰ Apmokėjimo priminimas</h1>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #0a5028;">Sveiki, ${emailData.customerName}!</h2>
            <p>Primenama, kad Jūsų rezervacija dar neapmokėta.</p>
            
            <div style="${detailsBoxStyles}">
              <h3 style="margin-top: 0; color: #0a5028;">Rezervacijos detalės:</h3>
              <p><strong>Automobilis:</strong> ${emailData.carName}</p>
              <p><strong>Pradžios data:</strong> ${emailData.startDate}</p>
              <p><strong>Mokėtina suma:</strong> €${emailData.totalAmount}</p>
            </div>

            <p>Prašome apmokėti sąskaitą iki nuomos pradžios, kad užtikrintume Jūsų rezervaciją.</p>
            
            <a href="#" style="${buttonStyles}">Apmokėti dabar</a>
          </div>
          <div style="${footerStyles}">
            <p>Carbonus komanda</p>
          </div>
        </div>
      `,
      'pickup-reminder': `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">🚗 Atsiėmimo priminimas</h1>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #0a5028;">Sveiki, ${emailData.customerName}!</h2>
            <p>Primenama, kad rytoj atsiimsit ${emailData.carName}!</p>
            
            <div style="${detailsBoxStyles}">
              <h3 style="margin-top: 0; color: #0a5028;">Atsiėmimo informacija:</h3>
              <p><strong>Data:</strong> ${emailData.startDate}</p>
              <p><strong>Laikas:</strong> 10:00</p>
              <p><strong>Vieta:</strong> Carbonus biuras, Vilnius</p>
            </div>

            <p><strong>Prašome atsivežti:</strong></p>
            <ul>
              <li>Vairuotojo pažymėjimą</li>
              <li>Asmens dokumentą</li>
              <li>Pasirašytą nuomos sutartį</li>
            </ul>

            <p>Laukiame Jūsų!</p>
          </div>
          <div style="${footerStyles}">
            <p>Carbonus komanda</p>
          </div>
        </div>
      `,
      'return-reminder': `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">🔄 Grąžinimo priminimas</h1>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #0a5028;">Sveiki, ${emailData.customerName}!</h2>
            <p>Primenama, kad rytoj turėtumėte grąžinti ${emailData.carName}.</p>
            
            <div style="${detailsBoxStyles}">
              <h3 style="margin-top: 0; color: #0a5028;">Grąžinimo informacija:</h3>
              <p><strong>Data:</strong> ${emailData.endDate}</p>
              <p><strong>Laikas:</strong> 10:00</p>
              <p><strong>Vieta:</strong> Carbonus biuras, Vilnius</p>
            </div>

            <p><strong>Primename:</strong></p>
            <ul>
              <li>Užpildykite degalų baką iki to paties lygio kaip atsiėmimo metu</li>
              <li>Patikrinkite, ar automobilyje nėra asmeninių daiktų</li>
              <li>Pranešite apie bet kokius pažeidimus ar problemas</li>
            </ul>
          </div>
          <div style="${footerStyles}">
            <p>Ačiū, kad pasirinkote Carbonus!</p>
          </div>
        </div>
      `,
      'contract-confirmation': `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">📄 Nuomos sutartis</h1>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #0a5028;">Sveiki, ${emailData.customerName}!</h2>
            <p>Prie šio laiško rasite nuomos sutartį PDF formatu.</p>
            
            <div style="${detailsBoxStyles}">
              <h3 style="margin-top: 0; color: #0a5028;">Nuomos informacija:</h3>
              <p><strong>Automobilis:</strong> ${emailData.carName}</p>
              <p><strong>Nuomos laikotarpis:</strong> ${emailData.startDate} - ${emailData.endDate}</p>
              <p><strong>Bendra suma:</strong> €${emailData.totalAmount}</p>
            </div>

            <p>Prašome atspausdinti sutartį ir atsivežti ją automobilio atsiėmimo dieną.</p>
            
            <a href="#" style="${buttonStyles}">Atsisiųsti sutartį</a>

            <p style="margin-top: 30px; font-size: 13px; color: #666;">
              Jei negalite atspausdinti, galime tai padaryti už Jus mūsų biure.
            </p>
          </div>
          <div style="${footerStyles}">
            <p>Carbonus komanda</p>
          </div>
        </div>
      `,
      feedback: `
        <div style="${commonStyles}">
          <div style="${headerStyles}">
            <h1 style="margin: 0; font-size: 28px;">⭐ Pasidalinkite savo patirtimi</h1>
          </div>
          <div style="${contentStyles}">
            <h2 style="color: #0a5028;">Sveiki, ${emailData.customerName}!</h2>
            <p>Tikimės, kad mėgavotės kelione su ${emailData.carName}!</p>
            
            <p>Būtume labai dėkingi, jei galėtumėte pasidalinti savo nuomone apie mūsų paslaugas. Jūsų atsiliepimas padės mums tobulėti.</p>

            <a href="#" style="${buttonStyles}">Palikti atsiliepimą</a>

            <p style="margin-top: 30px;">Atsiliepimas užtruks tik minutę, bet mums labai daug reikš!</p>

            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              Dėkojame, kad pasirinkote Carbonus. Laukiame Jūsų dar kartą!
            </p>
          </div>
          <div style="${footerStyles}">
            <p>Su pagarba,</p>
            <p>Carbonus komanda</p>
          </div>
        </div>
      `,
    };

    return templates[type] || '<p>Šablono peržiūra negalima</p>';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{getEmailTitle(emailType)} - Peržiūra</DialogTitle>
          <DialogDescription>
            Taip atrodys el. laiškas klientui
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] w-full rounded-md border">
          <Card className="border-0">
            <div
              dangerouslySetInnerHTML={{ __html: getEmailContent(emailType) }}
              className="p-4"
            />
          </Card>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
