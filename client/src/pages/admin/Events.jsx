import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    total: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getEvents(filters);
      setEvents(response.data.events);
      setPagination({
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await adminAPI.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete event';
      toast.error(message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatTime = (timeString) => new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Events</h1>
            <p className="text-gray-600">Create, edit, and manage your events</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Create Event
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                id="search"
                name="search"
                type="text"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search events..."
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>
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
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ search: '', status: '', page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Showing {events.length} of {pagination.total} events
        </div>

        {/* Events Table */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 mb-6">Create your first event to get started.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Create Event
            </button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Event', 'Date & Time', 'Venue', 'Price', 'Seats', 'Status', 'Actions'].map((th) => (
                    <th key={th} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">IMG</div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          <div className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(event.category)}`}>{event.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(event.date)}</div>
                      <div className="text-sm text-gray-500">{formatTime(event.time)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.venue.name}</div>
                      <div className="text-sm text-gray-500">{event.venue.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${event.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.availableSeats}/{event.totalSeats}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                      <button onClick={() => setEditingEvent(event)} className="text-blue-600 hover:text-blue-900">Edit</button>
                      <Link to={`/events/${event._id}`} className="text-green-600 hover:text-green-900">View</Link>
                      <button onClick={() => handleDeleteEvent(event._id)} className="text-red-600 hover:text-red-900">Delete</button>
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
            {[...Array(pagination.totalPages)].map((_, index) => {
              const page = index + 1;
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

        {/* Create/Edit Event Modal */}
        {(showCreateModal || editingEvent) && (
          <EventModal
            event={editingEvent}
            onClose={() => { setShowCreateModal(false); setEditingEvent(null); }}
            onSave={() => { setShowCreateModal(false); setEditingEvent(null); fetchEvents(); }}
          />
        )}
      </div>
    </div>
  );
};

// Event Modal Component
const EventModal = ({ event, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', time: '',
    venue: { name: '', address: '', city: '' },
    price: '', totalSeats: '', category: 'conference', status: 'upcoming', image: '',
    tags: '', requirements: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        time: event.time || '',
        venue: { name: event.venue?.name || '', address: event.venue?.address || '', city: event.venue?.city || '' },
        price: event.price || '',
        totalSeats: event.totalSeats || '',
        category: event.category || 'conference',
        status: event.status || 'upcoming',
        image: event.image || '',
        tags: event.tags?.join(', ') || '',
        requirements: event.requirements?.join(', ') || ''
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('venue.')) {
      const venueField = name.split('.')[1];
      setFormData({ ...formData, venue: { ...formData.venue, [venueField]: value } });
    } else setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = { ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        requirements: formData.requirements ? formData.requirements.split(',').map(r => r.trim()).filter(Boolean) : []
      };
      if (event) await adminAPI.updateEvent(event._id, submitData);
      else await adminAPI.createEvent(submitData);
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">{event ? 'Edit Event' : 'Create Event'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" name="title" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.title} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select name="category" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.category} onChange={handleChange} required>
                  {['conference','workshop','seminar','concert','sports','exhibition','other'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select name="status" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.status} onChange={handleChange} required>
                  {['upcoming','active','closed','cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="url" name="image" placeholder="https://..." className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.image} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.description} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" name="date" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.date} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                <input type="time" name="time" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.time} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['name','address','city'].map((v, i) => (
                <div key={v}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue {v.charAt(0).toUpperCase()+v.slice(1)} *</label>
                  <input type="text" name={`venue.${v}`} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.venue[v]} onChange={handleChange} required />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <input type="number" name="price" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.price} onChange={handleChange} min="0" step="0.01" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats *</label>
                <input type="number" name="totalSeats" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData.totalSeats} onChange={handleChange} min="1" required />
              </div>
            </div>

            {['tags','requirements'].map(f => (
              <div key={f}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.charAt(0).toUpperCase()+f.slice(1)} (comma-separated)</label>
                <input type="text" name={f} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={formData[f]} onChange={handleChange} placeholder={`e.g., example1, example2`} />
              </div>
            ))}

            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
                {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
