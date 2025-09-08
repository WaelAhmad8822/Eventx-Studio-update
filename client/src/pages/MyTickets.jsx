import React, { useState, useEffect } from 'react';
import { ticketsAPI } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getMyTickets();
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket?')) return;

    try {
      await ticketsAPI.cancelTicket(ticketId);
      toast.success('Ticket cancelled successfully');
      fetchTickets();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel ticket';
      toast.error(message);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatTime = (timeString) =>
    new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'used':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
      case 'cancelled':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-gray-600">Manage your event tickets and check-in QR codes</p>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500 mb-6">You haven't booked any tickets yet.</p>
            <a href="/events" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Browse Events
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="bg-white p-0 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                {ticket.event?.image && (
                  <div className="w-full h-40 bg-gray-100 overflow-hidden">
                    <img src={ticket.event.image} alt={ticket.event.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{ticket.event.title}</h3>
                      <p className="text-gray-600 text-sm">Seat: {ticket.seatNumber}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        <span className="capitalize">{ticket.status}</span>
                      </span>
                      {ticket.event?.status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.event.status === 'active' ? 'bg-green-100 text-green-800' : ticket.event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : ticket.event.status === 'closed' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                          Event: {ticket.event.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div><strong>Date:</strong> {formatDate(ticket.event.date)} at {formatTime(ticket.event.time)}</div>
                    <div><strong>Venue:</strong> {ticket.event.venue.name}, {ticket.event.venue.city}</div>
                    <div><strong>Price:</strong> ${ticket.price}</div>
                    <div><strong>Booked on:</strong> {formatDate(ticket.bookingDate)}</div>
                    {ticket.checkInTime && <div><strong>Checked in:</strong> {formatDate(ticket.checkInTime)}</div>}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-sm font-bold text-blue-600">Payment ID: {ticket.paymentId}</span>
                    <div className="flex space-x-2">
                      <button onClick={() => setSelectedTicket(ticket)} className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 text-sm">
                        View QR Code
                      </button>
                      {ticket.status === 'active' && (
                        <button onClick={() => handleCancelTicket(ticket._id)} className="px-3 py-1 border border-red-600 text-red-600 rounded hover:bg-red-50 text-sm">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QR Code Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-1">{selectedTicket.event.title}</h4>
                <p className="text-sm text-gray-600 mb-4">Seat: {selectedTicket.seatNumber}</p>

                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                    {selectedTicket.qrCode ? (
                      <QRCodeSVG value={selectedTicket.qrCode} size={200} level="M" includeMargin />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <p className="text-sm">QR Code not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <div><strong>Event Date:</strong> {formatDate(selectedTicket.event.date)}</div>
                  <div><strong>Event Time:</strong> {formatTime(selectedTicket.event.time)}</div>
                  <div><strong>Venue:</strong> {selectedTicket.event.venue.name}</div>
                  <div><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</span></div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  Show this QR code at the event entrance for check-in.
                </div>
                
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-xs text-gray-600">
                    <strong>Debug Info:</strong><br/>
                    QR Code exists: {selectedTicket.qrCode ? 'Yes' : 'No'}<br/>
                    QR Code length: {selectedTicket.qrCode ? selectedTicket.qrCode.length : 0}<br/>
                    QR Code preview: {selectedTicket.qrCode ? selectedTicket.qrCode.substring(0, 50) + '...' : 'None'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
