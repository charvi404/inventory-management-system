import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Bell, CheckCircle } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  if (loading && notifications.length === 0) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in relative container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="title">Notifications</h1>
          <p className="subtitle" style={{ margin: 0 }}>Your recent alerts</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No notifications found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map(notif => (
              <div key={notif.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1.5rem', 
                backgroundColor: notif.read_status ? 'var(--bg-secondary)' : 'rgba(99, 102, 241, 0.05)', 
                border: notif.read_status ? '1px solid transparent' : '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '0.5rem',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ 
                    padding: '0.75rem', 
                    backgroundColor: notif.read_status ? 'rgba(0,0,0,0.05)' : 'rgba(99, 102, 241, 0.1)', 
                    borderRadius: '50%', 
                    color: notif.read_status ? 'var(--text-muted)' : 'var(--accent-primary)' 
                  }}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: notif.read_status ? 500 : 600, color: notif.read_status ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      New Update
                    </h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {notif.message}
                    </p>
                    <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                {!notif.read_status && (
                  <button 
                    onClick={() => markAsRead(notif.id)} 
                    className="btn-secondary" 
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <CheckCircle size={16} /> Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
