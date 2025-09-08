import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const response = await eventsAPI.getEvents({ limit: 6 });
        setFeaturedEvents(response.data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const formatTime = (timeString) =>
    new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to EventX Studio</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            Professional event management made simple. Create, manage, and attend amazing events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="px-6 py-3 rounded-md bg-white text-blue-600 font-semibold hover:bg-gray-100 transition"
            >
              Browse Events
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-md border border-white text-white font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose EventX Studio?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
                title: 'Easy Management',
                description: 'Intuitive dashboard for event organizers to create and manage events effortlessly.',
                iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              },
              {
                iconBg: 'bg-green-100',
                iconColor: 'text-green-600',
                title: 'QR Code Tickets',
                description: 'Generate QR codes for easy check-in and secure ticket validation.',
                iconPath: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'
              },
              {
                iconBg: 'bg-purple-100',
                iconColor: 'text-purple-600',
                title: 'Analytics Dashboard',
                description: 'Comprehensive analytics and reports for event performance insights.',
                iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
              }
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className={`w-16 h-16 ${feature.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <svg className={`w-8 h-8 ${feature.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.iconPath} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
            <Link
              to="/events"
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
            >
              View All Events
            </Link>
          </div>

          {featuredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No events available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-gray-500">Event Image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${event.status === 'active' ? 'bg-green-100 text-green-800' : event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : event.status === 'closed' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                        {event.status?.charAt(0).toUpperCase() + event.status?.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{event.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.venue.name}, {event.venue.city}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-blue-600">${event.price}</span>
                      <span className="text-sm text-gray-500">{event.availableSeats} seats left</span>
                    </div>
                    <Link
                      to={`/events/${event._id}`}
                      className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of event organizers and attendees using EventX Studio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-6 py-3 rounded-md bg-white text-blue-600 font-semibold hover:bg-gray-100 transition"
            >
              Create Account
            </Link>
            <Link
              to="/events"
              className="px-6 py-3 rounded-md border border-white text-white font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
