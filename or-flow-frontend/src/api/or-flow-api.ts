import axios from 'axios';
import { ORBooking } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

export const fetchAllSlots = () => api.get('/slots');
export const createBooking = (slotId: number, patientId: number) => api.post<{ message: string, booking: ORBooking }>('/bookings', { slotId, patientId });
export const getBookingStatus = (bookingId: number) => api.get<{ status: string, id: number }>(`/bookings/${bookingId}`);
export const seedDatabase = () => api.post('/seed');
export const fetchAllBookings = () => api.get('/admin/bookings');
export const createSlot = (data: any) => api.post('/admin/slots', data);

export default api;