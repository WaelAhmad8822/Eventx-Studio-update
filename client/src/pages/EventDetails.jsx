import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, ticketsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState('');
  const [showSeatSelection, setShowSeatSelection] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEvent(id);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTicket = async () => {
    if (!user) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }
    if (!selectedSeat) {
      toast.error('Please select a seat');
      return;
    }

    setBookingLoading(true);
    try {
      await ticketsAPI.bookTicket({ eventId: id, seatNumber: selectedSeat });
      toast.success('Ticket booked successfully!');
      navigate('/my-tickets');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to book ticket';
      toast.error(message);
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const formatTime = (timeString) =>
    new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      conference: 'bg-purple-100 text-purple-800',
      workshop: 'bg-orange-100 text-orange-800',
      seminar: 'bg-blue-100 text-blue-800',
      concert: 'bg-pink-100 text-pink-800',
      sports: 'bg-green-100 text-green-800',
      exhibition: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            {/* Event Image */}
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-6 overflow-hidden">
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <span className="text-gray-500 text-lg">Event Image</span>
              )}
            </div>

            {/* Event Info */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
                  {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

              <div className="space-y-4 text-gray-600">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg">{formatDate(event.date)} at {formatTime(event.time)}</span>
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">{event.venue.name}</div>
                    <div>{event.venue.address}, {event.venue.city}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{event.availableSeats} of {event.totalSeats} seats available</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">About this event</h3>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>

            {/* Tags */}
            {event.tags?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {event.requirements?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {event.requirements.map((req, index) => <li key={index}>{req}</li>)}
                </ul>
              </div>
            )}

            {/* Organizer Info */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Organizer</h3>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">{event.organizer?.name?.charAt(0) || 'O'}</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{event.organizer?.name || 'Event Organizer'}</div>
                  <div className="text-gray-600 text-sm">{event.organizer?.email || ''}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-1 bg-white shadow rounded-lg p-6 sticky top-8">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">${event.price}</div>
              <div className="text-gray-600">per ticket</div>
            </div>

            {event.status === 'cancelled' ? (
              <div className="text-center py-4 text-red-600 font-semibold">Event Cancelled</div>
            ) : event.availableSeats === 0 ? (
              <div className="text-center py-4 text-red-600 font-semibold">Sold Out</div>
            ) : event.status === 'closed' ? (
              <div className="text-center py-4 text-gray-600 font-semibold">Event Closed</div>
            ) : (
              <div>
                {!showSeatSelection ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="text-lg font-semibold text-gray-900 mb-2">Available Seats</div>
                      <div className="text-2xl font-bold text-blue-600">{event.availableSeats}</div>
                      <div className="text-gray-600 text-sm">out of {event.totalSeats} total seats</div>
                    </div>
                    <button
                      onClick={() => setShowSeatSelection(true)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition mb-4"
                    >
                      Select Seat & Book
                    </button>
                  </>
                ) : (
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Select Seat Number</label>
                      <input
                        type="text"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter seat number (e.g., A1, B5, C12)"
                        value={selectedSeat}
                        onChange={(e) => setSelectedSeat(e.target.value.toUpperCase())}
                      />
                      <p className="text-sm text-gray-500 mt-1">Available seats: {event.availableSeats}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowSeatSelection(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBookTicket}
                        disabled={!selectedSeat || bookingLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {bookingLoading ? 'Booking...' : 'Book Ticket'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-6 border-t text-center text-sm text-gray-500">
              Need help? Contact us at waeeel989@gmail.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
