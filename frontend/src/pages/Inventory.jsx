import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const Inventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: 0,
    category: '',
    price: 0
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        category: item.category,
        price: item.price
      });
      setEditingId(item.id);
    } else {
      setFormData({ name: '', description: '', quantity: 0, category: '', price: 0 });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/inventory/${editingId}`, formData);
      } else {
        await api.post('/inventory', formData);
      }
      closeModal();
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/inventory/${id}`);
        fetchItems();
      } catch (err) {
        alert(err.response?.data?.error || 'Error deleting item');
      }
    }
  };

  const canEdit = user?.role === 'Admin' || user?.role === 'Manager';
  const canDelete = user?.role === 'Admin';

  if (loading && items.length === 0) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in relative container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="title">Inventory</h1>
          <p className="subtitle" style={{ margin: 0 }}>Manage your equipment and assets</p>
        </div>
        {canEdit && (
          <button onClick={() => handleOpenModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Add Item
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ color: 'var(--text-muted)' }}>#{item.id}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.description}</div>
                </td>
                <td>
                  <span className="badge" style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0,0,0,0.1)' }}>
                    {item.category}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    color: item.quantity < 10 ? 'var(--warning)' : 'inherit',
                    fontWeight: item.quantity < 10 ? '600' : 'normal'
                  }}>
                    {item.quantity}
                  </span>
                </td>
                <td>${Number(item.price).toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {canEdit && (
                      <button onClick={() => handleOpenModal(item)} className="btn-secondary" style={{ padding: '0.4rem', borderRadius: '4px' }}>
                        <Edit2 size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDelete(item.id)} className="btn-danger" style={{ padding: '0.4rem', borderRadius: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{editingId ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={closeModal} style={{ background: 'none', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} style={{ width: '100%', minHeight: '80px' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
                  <input required type="text" name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Quantity</label>
                  <input required type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="0" style={{ width: '100%' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Price ($)</label>
                <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} min="0" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                  {editingId ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
