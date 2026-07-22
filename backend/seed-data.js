const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/eventnexus');
  console.log('Connected to MongoDB\n');

  const Event = require('./src/models/Event');
  const User = require('./src/models/User');
  const Booking = require('./src/models/Booking');
  const Category = require('./src/models/Category');

  // 1. Fix user roles - change 'user' to 'attendee'
  console.log('1. Fixing user roles...');
  const fixedUsers = await User.updateMany(
    { role: 'user' },
    { $set: { role: 'attendee' } }
  );
  console.log(`   Fixed ${fixedUsers.modifiedCount} users`);

  // 2. Create categories if they don't exist
  console.log('\n2. Creating categories...');
  const categoryNames = ['Technology', 'AI', 'Startups', 'Gaming', 'Music', 'Sports', 'Business', 'Design'];
  for (const name of categoryNames) {
    const slug = name.toLowerCase();
    const existing = await Category.findOne({ slug });
    if (!existing) {
      await Category.create({
        name,
        slug,
        description: `${name} events category`,
        sortOrder: categoryNames.indexOf(name) + 1,
      });
      console.log(`   Created category: ${name}`);
    } else {
      console.log(`   Already exists: ${name}`);
    }
  }

  // 3. Get admin user for organizer
  const admin = await User.findOne({ email: 'admin@eventnexus.com' });
  if (!admin) {
    console.log('   ERROR: Admin user not found!');
    process.exit(1);
  }

  // 4. Create events from mock data
  console.log('\n3. Creating events...');
  const mockEvents = [
    {
      title: 'AI Summit 2027',
      description: 'Join the world\'s leading AI researchers and practitioners for a deep dive into artificial intelligence, machine learning, and their real-world applications.',
      category: 'ai',
      tags: ['ai', 'machine-learning', 'deep-learning'],
      organizer: admin._id,
      venue: { name: 'Namma Bengaluru Convention Centre', address: 'MG Road, Ashok Nagar', city: 'Bengaluru', country: 'India' },
      dateTime: { startDate: new Date('2027-03-15'), endDate: new Date('2027-03-17'), startTime: '09:00 AM', endTime: '06:00 PM' },
      capacity: 1500,
      status: 'published',
      featured: true,
      popularity: 95,
      tickets: [
        { type: 'general', name: 'General Admission', price: 299, quantity: 1000, sold: 0 },
        { type: 'vip', name: 'VIP Pass', price: 599, quantity: 500, sold: 0 },
      ],
    },
    {
      title: 'Tech Conference Global',
      description: 'The biggest technology conference of the year featuring keynote speakers from top tech companies.',
      category: 'technology',
      tags: ['technology', 'innovation', 'future'],
      organizer: admin._id,
      venue: { name: 'Hyderabad International Convention Centre', address: 'HITEC City', city: 'Hyderabad', country: 'India' },
      dateTime: { startDate: new Date('2027-04-20'), endDate: new Date('2027-04-22'), startTime: '09:00 AM', endTime: '06:00 PM' },
      capacity: 3000,
      status: 'published',
      featured: true,
      popularity: 92,
      tickets: [
        { type: 'general', name: 'General Admission', price: 599, quantity: 2000, sold: 0 },
        { type: 'vip', name: 'VIP Pass', price: 999, quantity: 1000, sold: 0 },
      ],
    },
    {
      title: 'Startup Pitch Night',
      description: 'Watch the most promising startups pitch their ideas to top venture capitalists and angel investors.',
      category: 'startups',
      tags: ['startups', 'pitch', 'investing'],
      organizer: admin._id,
      venue: { name: 'Pune Startup Hub', address: 'Koregaon Park', city: 'Pune', country: 'India' },
      dateTime: { startDate: new Date('2027-02-10'), endDate: new Date('2027-02-10'), startTime: '06:00 PM', endTime: '10:00 PM' },
      capacity: 500,
      status: 'published',
      featured: true,
      popularity: 88,
      tickets: [
        { type: 'general', name: 'General Admission', price: 49, quantity: 400, sold: 0 },
        { type: 'vip', name: 'VIP Pass', price: 149, quantity: 100, sold: 0 },
      ],
    },
    {
      title: 'Gaming Expo 2027',
      description: 'The ultimate gaming experience with the latest releases, esports tournaments, and industry panels.',
      category: 'gaming',
      tags: ['gaming', 'esports', 'entertainment'],
      organizer: admin._id,
      venue: { name: 'Mumbai Exhibition Centre', address: 'Goregaon East', city: 'Mumbai', country: 'India' },
      dateTime: { startDate: new Date('2027-06-05'), endDate: new Date('2027-06-08'), startTime: '10:00 AM', endTime: '08:00 PM' },
      capacity: 5000,
      status: 'published',
      featured: true,
      popularity: 85,
      tickets: [
        { type: 'general', name: 'General Admission', price: 199, quantity: 4000, sold: 0 },
        { type: 'vip', name: 'VIP Pass', price: 399, quantity: 1000, sold: 0 },
      ],
    },
    {
      title: 'Music Festival',
      description: 'A spectacular music festival featuring top artists from around the world across multiple genres.',
      category: 'music',
      tags: ['music', 'festival', 'live'],
      organizer: admin._id,
      venue: { name: 'Goa Beach Arena', address: 'Calangute Beach', city: 'Goa', country: 'India' },
      dateTime: { startDate: new Date('2027-05-22'), endDate: new Date('2027-05-25'), startTime: '12:00 PM', endTime: '11:00 PM' },
      capacity: 10000,
      status: 'published',
      featured: true,
      popularity: 82,
      tickets: [
        { type: 'general', name: 'General Admission', price: 149, quantity: 8000, sold: 0 },
        { type: 'vip', name: 'VIP Pass', price: 349, quantity: 2000, sold: 0 },
      ],
    },
    {
      title: 'Sports Innovation Forum',
      description: 'Exploring the future of sports through technology, data analytics, and innovative training methods.',
      category: 'sports',
      tags: ['sports', 'innovation', 'technology'],
      organizer: admin._id,
      venue: { name: 'Narendra Modi Stadium', address: 'Motera', city: 'Ahmedabad', country: 'India' },
      dateTime: { startDate: new Date('2027-07-10'), endDate: new Date('2027-07-12'), startTime: '09:00 AM', endTime: '06:00 PM' },
      capacity: 2000,
      status: 'published',
      featured: true,
      popularity: 78,
      tickets: [
        { type: 'general', name: 'General Admission', price: 449, quantity: 1500, sold: 0 },
        { type: 'vip', name: 'VIP Pass', price: 799, quantity: 500, sold: 0 },
      ],
    },
    {
      title: 'Business Leadership Summit',
      description: 'A premier gathering of business leaders, entrepreneurs, and executives discussing leadership strategies.',
      category: 'business',
      tags: ['business', 'leadership', 'networking'],
      organizer: admin._id,
      venue: { name: 'Delhi Convention Centre', address: 'Connaught Place', city: 'New Delhi', country: 'India' },
      dateTime: { startDate: new Date('2027-08-18'), endDate: new Date('2027-08-20'), startTime: '09:00 AM', endTime: '06:00 PM' },
      capacity: 1200,
      status: 'published',
      featured: true,
      popularity: 80,
      tickets: [
        { type: 'general', name: 'General Admission', price: 399, quantity: 800, sold: 0 },
        { type: 'vip', name: 'VIP Pass', price: 699, quantity: 400, sold: 0 },
      ],
    },
    {
      title: 'Design & Creativity Workshop',
      description: 'An immersive workshop exploring design thinking, creative processes, and the latest design tools.',
      category: 'design',
      tags: ['design', 'creativity', 'workshop'],
      organizer: admin._id,
      venue: { name: 'Jaipur Design Studio', address: 'MI Road', city: 'Jaipur', country: 'India' },
      dateTime: { startDate: new Date('2027-09-05'), endDate: new Date('2027-09-07'), startTime: '09:00 AM', endTime: '05:00 PM' },
      capacity: 350,
      status: 'published',
      featured: true,
      popularity: 75,
      tickets: [
        { type: 'general', name: 'General Admission', price: 99, quantity: 250, sold: 0 },
        { type: 'vip', name: 'VIP Pass', price: 199, quantity: 100, sold: 0 },
      ],
    },
  ];

  const createdEvents = [];
  for (const eventData of mockEvents) {
    const existing = await Event.findOne({ title: eventData.title });
    if (!existing) {
      const event = await Event.create(eventData);
      createdEvents.push(event);
      console.log(`   Created event: ${event.title}`);
    } else {
      // UPDATE existing event with correct Indian venue data
      existing.venue = eventData.venue;
      existing.category = eventData.category;
      existing.description = eventData.description;
      existing.tags = eventData.tags;
      existing.capacity = eventData.capacity;
      existing.popularity = eventData.popularity;
      existing.tickets = eventData.tickets;
      await existing.save();
      createdEvents.push(existing);
      console.log(`   Updated venue for: ${existing.title}`);
    }
  }

  // 5. Link bookings to events
  console.log('\n4. Linking bookings to events...');
  const bookings = await Booking.find({ event: null });
  console.log(`   Found ${bookings.length} bookings with null event`);
  
  // Assign events to bookings in round-robin fashion
  for (let i = 0; i < bookings.length; i++) {
    const eventIndex = i % createdEvents.length;
    bookings[i].event = createdEvents[eventIndex]._id;
    await bookings[i].save();
    console.log(`   Linked booking ${bookings[i].bookingId?.slice(0, 10)} to event ${createdEvents[eventIndex].title}`);
  }

  // 6. Update tickets sold count
  console.log('\n5. Updating ticket counts...');
  for (const event of createdEvents) {
    const count = await Booking.countDocuments({ event: event._id });
    if (count > 0) {
      // Update ticket tiers sold count
      for (const tier of event.tickets) {
        const tierCount = await Booking.countDocuments({ event: event._id, ticketType: tier.type });
        tier.sold = tierCount;
      }
      await event.save();
      console.log(`   ${event.title}: ${count} tickets sold`);
    }
  }

  console.log('\n=== SEEDING COMPLETE ===');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});