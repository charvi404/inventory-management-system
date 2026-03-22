import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { Plus, X, ArrowRightLeft } from 'lucide-react';

const Allocations = () => {
  const [allocations, setAllocations] = useState([]);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    item_id: '',
    target_user_id: '',
    department: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, itemsRes, usersRes] = await Promise.all([
        api.get('/allocations'),
        api.get('/inventory'),
        api.get('/auth/users')
      ]);
      setAllocations(allocRes.data);
      setItems(itemsRes.data.filter(i => i.quantity > 0)); // Only items in stock
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturn = async (id) => {
    if (window.confirm('Mark this asset as returned?')) {
      try {
        await api.put(`/allocations/${id}/transfer`, { action: 'return' });
        fetchData();
      } catch (err) {
        alert(err.response?.data?.error || 'Error returning item');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/allocations', formData);
      setIsModalOpen(false);
      setFormData({ item_id: '', target_user_id: '', department: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error assigning item');
    }
  };

  if (loading && allocations.length === 0) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in relative container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="title">Allocations</h1>
          <p className="subtitle" style={{ margin: 0 }}>Manage inventory assignments</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Assign Item
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Item</th>
              <th>Assigned To</th>
              <th>Department</th>
              <th>Date Assigned</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map(alloc => (
              <tr key={alloc.id}>
                <td style={{ color: 'var(--text-muted)' }}>#{alloc.id}</td>
                <td style={{ fontWeight: 500 }}>{alloc.item_name}</td>
                <td>{alloc.user_name}</td>
                <td>{alloc.department || '-'}</td>
                <td>{new Date(alloc.assigned_date).toLocaleDateString()}</td>
                <td>
                  <span className="badge" style={{ 
                    backgroundColor: alloc.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)',
                    color: alloc.status === 'Active' ? 'var(--success)' : 'var(--text-secondary)'
                  }}>
                    {alloc.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {alloc.status === 'Active' && (
                    <button onClick={() => handleReturn(alloc.id)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ArrowRightLeft size={16} /> Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {allocations.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No allocations found.
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
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Assign Asset</h2>
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
                  <option value="">Select an Item in stock</option>
                  {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.quantity} available)</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Assign To User</label>
                <select 
                  required 
                  value={formData.target_user_id} 
                  onChange={(e) => setFormData({...formData, target_user_id: e.target.value})} 
                  style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)' }}
                >
                  <option value="">Select User</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Department</label>
                <input 
                  type="text" 
                  value={formData.department} 
                  onChange={(e) => setFormData({...formData, department: e.target.value})} 
                  placeholder="e.g. IT, HR, Marketing"
                  style={{ width: '100%' }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Assign Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allocations;
