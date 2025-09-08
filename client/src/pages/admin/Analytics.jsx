import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics();
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to load analytics</h2>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
          <p className="text-gray-600">Detailed insights into your event performance</p>
        </div>

        {/* Demographics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gender Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendee Demographics - Gender</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.attendeeDemographics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="_id"
                  >
                    {analyticsData.attendeeDemographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age Groups */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.ageGroups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Event Categories and Top Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Popular Categories */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Event Categories</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.popularCategories} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="_id" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Events by Sales */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Events by Ticket Sales</h3>
            <div className="space-y-4">
              {analyticsData.topEvents.slice(0, 5).map((event, index) => (
                <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{event.event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(event.event.date)} • {event.event.venue?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{event.ticketCount} tickets</p>
                    <p className="text-xs text-gray-600">${event.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location Distribution */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendee Location Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.locationDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {analyticsData.attendeeDemographics.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <p className="text-gray-600">Total Attendees</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {analyticsData.popularCategories.length}
            </div>
            <p className="text-gray-600">Event Categories</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analyticsData.topEvents.length}
            </div>
            <p className="text-gray-600">Active Events</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export default AdminAnalytics;
