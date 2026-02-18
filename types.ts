
export interface Room {
  id: string;
  name: string;
  capacity: number;
  location: string; // New field for floor/location
  isAvailable: boolean;
}

export interface Student {
  name: string;
  nim: string;
  pdbClass: string;
  subject: string; // New field for Mata Kuliah
  contact: string;
}

export type BookingStatus = 'APPROVED'; // Simplified as student picks room

export interface Booking {
  id: string;
  room: Room; // Room is now required immediately
  student: Student;
  date: string;
  timeSlot: string;
  timestamp: number;
  status: BookingStatus;
  aiMessage?: string;
}

export enum AppState {
  HOME = 'HOME',
  BOOKING = 'BOOKING',
  TICKET = 'TICKET'
}

export type UserRole = 'GUEST' | 'STUDENT' | 'ADMIN';
