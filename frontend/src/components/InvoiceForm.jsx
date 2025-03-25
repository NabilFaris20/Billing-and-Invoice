import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const InvoiceForm = ({ invoices, setInvoices, editingInvoice, setEditingInvoice }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', description: '', price: '' });

  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        title: editingInvoice.title,
        description: editingInvoice.description,
        price: editingInvoice.price,
      });
    } else {
      setFormData({ title: '', description: '', price: '' });
    }
  }, [editingInvoice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvoice) {
        const response = await axiosInstance.put(`/api/invoices/${editingInvoice._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setInvoices(invoices.map((invoice) =>
          invoice._id === response.data._id ? response.data : invoice
        ));
      } else {
        const response = await axiosInstance.post('/api/invoices', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setInvoices([...invoices, response.data]);
      }
      setEditingInvoice(null);
      setFormData({ title: '', description: '', price: '' });
    } catch (error) {
      alert('Failed to save invoice.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">
        {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
      </h1>

      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        step="0.01"
        min="0"
      />

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
      </button>
    </form>
  );
};

export default InvoiceForm;
