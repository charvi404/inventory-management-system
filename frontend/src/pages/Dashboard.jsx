import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Package, AlertTriangle, Clock, Activity } from 'lucide-react';

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

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Items by Category</h3>
          {summary.categoryDistribution.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No items yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {summary.categoryDistribution.map((cat, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{cat.category}</span>
                  <span style={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
