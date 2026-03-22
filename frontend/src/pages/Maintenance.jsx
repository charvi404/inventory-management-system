import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Plus, X, Wrench, CheckCircle } from 'lucide-react';

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    item_id: '',
    issue_description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintRes, itemsRes] = await Promise.all([
        api.get('/maintenance'),
        api.get('/inventory')
      ]);
      setRequests(maintRes.data);
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
      await api.put(`/maintenance/${id}`, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', formData);
      setIsModalOpen(false);
      setFormData({ item_id: '', issue_description: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error reporting issue');
    }
  };

  if (loading && requests.length === 0) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in relative container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="title">Maintenance</h1>
          <p className="subtitle" style={{ margin: 0 }}>Track and update maintenance requests</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Report Issue
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Item</th>
              <th>Reported By</th>
              <th>Description</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td style={{ color: 'var(--text-muted)' }}>#{req.id}</td>
                <td style={{ fontWeight: 500 }}>{req.item_name}</td>
                <td>{req.reported_by_name}</td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.issue_description}</td>
                <td>
                  <span className="badge" style={{ 
                    backgroundColor: req.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : req.status === 'In Progress' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: req.status === 'Completed' ? 'var(--success)' : req.status === 'In Progress' ? 'var(--accent-primary)' : 'var(--warning)'
                  }}>
                    {req.status}
                  </span>
                </td>
                <td>{new Date(req.created_at).toLocaleDateString()}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {req.status === 'Pending' && (
                      <button onClick={() => handleStatusUpdate(req.id, 'In Progress')} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Wrench size={16} /> Start
                      </button>
                    )}
                    {(req.status === 'Pending' || req.status === 'In Progress') && (
                      <button onClick={() => handleStatusUpdate(req.id, 'Completed')} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)' }}>
                        <CheckCircle size={16} /> Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No maintenance requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Report Maintenance Issue</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Item</label>
                <select 
                  required 
                  value={formData.item_id} 
                  onChange={(e) => setFormData({...formData, item_id: e.target.value})} 
                  style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
                >
                  <option value="">Select an Item</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Issue Description</label>
                <textarea 
                  required
                  value={formData.issue_description} 
                  onChange={(e) => setFormData({...formData, issue_description: e.target.value})} 
                  placeholder="Describe the problem..."
                  style={{ width: '100%', minHeight: '100px', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
