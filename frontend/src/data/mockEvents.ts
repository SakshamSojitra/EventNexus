export interface MockEvent {
  _id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  popularity: number;
  attendees: number;
  banner: string;
  dateTime: { startDate: string };
}

export const MOCK_EVENTS: MockEvent[] = [
  {
    _id: '1',
    title: 'AI Summit 2027',
    category: 'ai',
    location: 'San Francisco, CA',
    price: 299,
    popularity: 95,
    attendees: 1500,
    banner: '',
    dateTime: { startDate: '2027-03-15' },
  },
  {
    _id: '2',
    title: 'Tech Conference Global',
    category: 'technology',
    location: 'London, UK',
    price: 599,
    popularity: 92,
    attendees: 3000,
    banner: '',
    dateTime: { startDate: '2027-04-20' },
  },
  {
    _id: '3',
    title: 'Startup Pitch Night',
    category: 'startups',
    location: 'New York, NY',
    price: 49,
    popularity: 88,
    attendees: 500,
    banner: '',
    dateTime: { startDate: '2027-02-10' },
  },
  {
    _id: '4',
    title: 'Gaming Expo 2027',
    category: 'gaming',
    location: 'Tokyo, Japan',
    price: 199,
    popularity: 85,
    attendees: 5000,
    banner: '',
    dateTime: { startDate: '2027-06-05' },
  },
  {
    _id: '5',
    title: 'Music Festival',
    category: 'music',
    location: 'Miami, FL',
    price: 149,
    popularity: 82,
    attendees: 10000,
    banner: '',
    dateTime: { startDate: '2027-05-22' },
  },
  {
    _id: '6',
    title: 'Sports Innovation Forum',
    category: 'sports',
    location: 'Dubai, UAE',
    price: 449,
    popularity: 78,
    attendees: 2000,
    banner: '',
    dateTime: { startDate: '2027-07-10' },
  },
  {
    _id: '7',
    title: 'Business Leadership Summit',
    category: 'business',
    location: 'Singapore',
    price: 399,
    popularity: 80,
    attendees: 1200,
    banner: '',
    dateTime: { startDate: '2027-08-18' },
  },
  {
    _id: '8',
    title: 'Design & Creativity Workshop',
    category: 'design',
    location: 'Paris, France',
    price: 99,
    popularity: 75,
    attendees: 350,
    banner: '',
    dateTime: { startDate: '2027-09-05' },
  },
];

export const CATEGORIES = [
  'all',
  'technology',
  'ai',
  'startups',
  'gaming',
  'music',
  'sports',
  'business',
  'design',
];
