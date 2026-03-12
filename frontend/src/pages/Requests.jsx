import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Plus, X, CheckCircle, XCircle } from 'lucide-react';

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [items, setItems] = useState([]); // For the new request dropdown
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ item_id: '', quantity_requested: 1 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqsRes, itemsRes] = await Promise.all([
        api.get('/requests'),
        api.get('/inventory')
      ]);
      setRequests(reqsRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/requests/${id}/status`, { status });
      fetchData(); // Refresh list to get updated inventory and status
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating request');
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating request');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <span className="badge badge-approved">Approved</span>;
      case 'Rejected': return <span className="badge badge-rejected">Rejected</span>;
      default: return <span className="badge badge-pending">Pending</span>;
    }
  };

  const isManagerOrAdmin = user?.role === 'Admin' || user?.role === 'Manager';

  if (loading && requests.length === 0) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in relative container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="title">Equipment Requests</h1>
          <p className="subtitle" style={{ margin: 0 }}>
            {isManagerOrAdmin ? "Manage team equipment requests" : "View and manage your equipment requests"}
          </p>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> New Request
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              {isManagerOrAdmin && <th>Requester</th>}
              <th>Item</th>
              <th>Quantity</th>
              <th>Status</th>
              {isManagerOrAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td style={{ color: 'var(--text-muted)' }}>
                  {new Date(req.created_at).toLocaleDateString()}
                </td>
                {isManagerOrAdmin && <td>{req.requester_name}</td>}
                <td style={{ fontWeight: 500 }}>{req.item_name}</td>
                <td>{req.quantity_requested}</td>
                <td>{getStatusBadge(req.status)}</td>
                {isManagerOrAdmin && (
                  <td style={{ textAlign: 'right' }}>
                    {req.status === 'Pending' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleStatusUpdate(req.id, 'Approved')} 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(req.id, 'Rejected')} 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={isManagerOrAdmin ? 6 : 4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No equipment requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Request Equipment</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateRequest} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Select Item</label>
                <select 
                  required 
                  value={formData.item_id} 
                  onChange={(e) => setFormData({...formData, item_id: e.target.value})}
                  style={{ width: '100%' }}
                >
                  <option value="" disabled>-- Select an item --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id} disabled={item.quantity === 0}>
                      {item.name} (Available: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity</label>
                <input 
                  required 
                  type="number" 
                  min="1" 
                  value={formData.quantity_requested} 
                  onChange={(e) => setFormData({...formData, quantity_requested: parseInt(e.target.value)})} 
                  style={{ width: '100%' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
