import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

export type TicketType = 'free' | 'premium' | 'vip';
export type BookingPhase = 'idle' | 'loading' | 'payment' | 'success' | 'error';

export interface Booking {
  _id: string;
  bookingId: string;
  ticketNumber: string;
  ticketType: TicketType;
  price: number;
  paymentStatus: string;
  paymentMethod: string;
  transactionId: string;
  bookingStatus: string;
  qrCode: string;
  createdAt: string;
  eventDate?: string;
  expiresAt?: string;
  event: {
    _id: string;
    title: string;
    banner: string;
    dateTime: { startDate: string; startTime: string };
    venue: { name: string; city: string; country: string };
    category: string;
  };
  user: { name: string; email: string; phone?: string };
}

const FREE_STEPS = ['Booking your ticket...', 'Confirming...', 'Generating Ticket...', 'Almost Done...'];
const PAID_STEPS = ['Preparing Booking...', 'Processing Payment...', 'Generating Ticket...', 'Almost Done...'];

export function useBooking() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<BookingPhase>('idle');
  const [loadingText, setLoadingText] = useState('');
  const [progress, setProgress] = useState(0);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');

  const runLoadingSequence = async (steps: string[], totalMs: number) => {
    const stepMs = totalMs / steps.length;
    for (let i = 0; i < steps.length; i++) {
      setLoadingText(steps[i]);
      setProgress(Math.round(((i + 1) / steps.length) * 100));
      await new Promise((r) => setTimeout(r, stepMs));
    }
  };

  const bookTicket = async (eventId: string, ticketType: TicketType) => {
    setError('');
    if (ticketType === 'free') {
      setPhase('loading');
      await runLoadingSequence(FREE_STEPS, 2000);
    } else {
      setPhase('payment');
      await runLoadingSequence(PAID_STEPS, 2800);
    }

    try {
      const { data } = await API.post<Booking>('/book-ticket', { eventId, ticketType });
      setBooking(data);
      setPhase('success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
      setPhase('error');
    }
  };

  const goToTicket = () => {
    setPhase('idle');
    navigate('/my-tickets');
  };

  const reset = () => {
    setPhase('idle');
    setError('');
    setProgress(0);
    setLoadingText('');
  };

  return { phase, loadingText, progress, booking, error, bookTicket, goToTicket, reset };
}
