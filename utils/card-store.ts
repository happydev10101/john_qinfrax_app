import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CardState {
  firstName: string;
  lastName: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  lastSubmit: number;

  // Setters
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setStreetAddress: (value: string) => void;
  setCity: (value: string) => void;
  setZipCode: (value: string) => void;
  setCountry: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  setLastSubmit: (value: number) => void;
}

export const useCardStore = create<CardState>()(
  persist(
    (set) => ({
      firstName: '',
      lastName: '',
      streetAddress: '',
      city: '',
      zipCode: '',
      country: '',
      phoneNumber: '',
      lastSubmit: 0,

      setFirstName: (value) => set({ firstName: value }),
      setLastName: (value) => set({ lastName: value }),
      setStreetAddress: (value) => set({ streetAddress: value }),
      setCity: (value) => set({ city: value }),
      setZipCode: (value) => set({ zipCode: value }),
      setCountry: (value) => set({ country: value }),
      setPhoneNumber: (value) => set({ phoneNumber: value }),
      setLastSubmit: (value) => set({ lastSubmit: value }),
    }),
    { name: 'card-store' }
  )
);
