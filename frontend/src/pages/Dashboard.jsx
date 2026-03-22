import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Package, AlertTriangle, Clock, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#ec4899', '#10b981', '#3b82f6', '#8b5cf6'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        setSummary(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>{error}</div>;
  if (!summary) return null;

  return (
    <div className="animate-fade-in">
      <h1 className="title">Dashboard</h1>
      <p className="subtitle">Overview of your inventory and requests</p>

      <div className="grid-cards" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', color: 'var(--accent-primary)' }}>
            <Package size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Items</p>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{summary.totalItems}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', color: 'var(--warning)' }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Low Stock Items</p>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{summary.lowStockItems}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'rgba(236, 72, 153, 0.1)', borderRadius: '50%', color: 'var(--accent-secondary)' }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Pending Requests</p>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>{summary.pendingRequests}</h2>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} className="text-gradient" /> 
            Recent Activity
          </h3>
          
          {summary.recentActivity.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No recent activity.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {summary.recentActivity.map((activity, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '1rem', 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderRadius: 'var(--radius-md)' 
                }}>
                  <span style={{ fontWeight: 500 }}>{activity.type}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {new Date(activity.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '300px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Items by Category</h3>
          {summary.categoryDistribution.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No items yet.</p>
          ) : (
            <div style={{ width: '100%', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.categoryDistribution}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {summary.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {summary.lowStockAlerts && summary.lowStockAlerts.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
            <AlertTriangle size={20} /> Low Stock Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {summary.lowStockAlerts.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '0.5rem' }}>
                <span style={{ fontWeight: 500 }}>{item.name}</span>
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{item.quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
