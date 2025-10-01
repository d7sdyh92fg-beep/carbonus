import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface InsuranceOption {
  id: string;
  title: string;
  description: string;
  pricePerDay: number;
  excess: number;
}

export interface AdditionalService {
  id: string;
  title: string;
  description: string;
  price: number;
  unit: 'perDay' | 'oneTime';
  icon?: any;
}

export interface BookingData {
  carId: string;
  carName: string;
  startDate: string;
  endDate: string;
  rentalDays: number;
  basePrice: number;
  insurance?: InsuranceOption;
  services: AdditionalService[];
}

interface BookingContextType {
  bookingData: BookingData | null;
  setBookingData: (data: BookingData) => void;
  updateInsurance: (insurance: InsuranceOption) => void;
  toggleService: (service: AdditionalService) => void;
  getTotalPrice: () => number;
  clearBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bookingData, setBookingDataState] = useState<BookingData | null>(() => {
    const saved = localStorage.getItem('bookingData');
    return saved ? JSON.parse(saved) : null;
  });

  const setBookingData = (data: BookingData) => {
    setBookingDataState(data);
    localStorage.setItem('bookingData', JSON.stringify(data));
  };

  const updateInsurance = (insurance: InsuranceOption) => {
    if (bookingData) {
      const updated = { ...bookingData, insurance };
      setBookingData(updated);
    }
  };

  const toggleService = (service: AdditionalService) => {
    if (bookingData) {
      const exists = bookingData.services.find(s => s.id === service.id);
      const services = exists
        ? bookingData.services.filter(s => s.id !== service.id)
        : [...bookingData.services, service];
      
      const updated = { ...bookingData, services };
      setBookingData(updated);
    }
  };

  const getTotalPrice = () => {
    if (!bookingData) return 0;

    let total = bookingData.basePrice;

    // Add insurance cost
    if (bookingData.insurance) {
      total += bookingData.insurance.pricePerDay * bookingData.rentalDays;
    }

    // Add services cost
    bookingData.services.forEach(service => {
      if (service.unit === 'perDay') {
        total += service.price * bookingData.rentalDays;
      } else {
        total += service.price;
      }
    });

    return total;
  };

  const clearBooking = () => {
    setBookingDataState(null);
    localStorage.removeItem('bookingData');
  };

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        setBookingData,
        updateInsurance,
        toggleService,
        getTotalPrice,
        clearBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
