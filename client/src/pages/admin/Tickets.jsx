import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', eventId: '', page: 1 });
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, total: 0 });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchTickets();
    fetchEvents();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTickets(filters);
      setTickets(response.data.tickets);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await adminAPI.getEvents({ limit: 100 });
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleCheckIn = async (ticketId) => {
    try {
      await adminAPI.checkInTicket(ticketId);
      toast.success('Ticket checked in successfully');
      fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in ticket');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const formatTime = (timeString) =>
    new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ticket Management</h1>
          <p className="text-gray-600">View and manage all event tickets</p>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status"
                name="status"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="used">Used</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-1">Event</label>
              <select
                id="eventId"
                name="eventId"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={filters.eventId}
                onChange={handleFilterChange}
              >
                <option value="">All Events</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>{event.title}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', eventId: '', page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Showing {tickets.length} of {pagination.total} tickets
        </div>

        {/* Tickets Table */}
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500">No tickets match your current filters.</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Ticket ID', 'Event', 'Attendee', 'Seat', 'Price', 'Status', 'Booking Date', 'Actions'].map(th => (
                    <th key={th} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map(ticket => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.paymentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.event.title}</div>
                      <div className="text-sm text-gray-500">{formatDate(ticket.event.date)} at {formatTime(ticket.event.time)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ticket.user.name}</div>
                      <div className="text-sm text-gray-500">{ticket.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.seatNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${ticket.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(ticket.bookingDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {ticket.status === 'active' ? (
                        <button onClick={() => handleCheckIn(ticket._id)} className="text-green-600 hover:text-green-900">Check In</button>
                      ) : ticket.status === 'used' ? (
                        <span className="text-gray-400">Checked In</span>
                      ) : ticket.status === 'cancelled' ? (
                        <span className="text-red-400">Cancelled</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded-md ${page === pagination.currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300'}`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTickets;
