import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import InvoiceForm from '../components/InvoiceForm';
import InvoiceList from '../components/InvoiceList';
import { useAuth } from '../context/AuthContext';

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [editingInvoice, setEditingInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axiosInstance.get('/api/invoices', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setInvoices(response.data);
      } catch (error) {
        alert('Failed to fetch invoices.');
      }
    };

    fetchInvoices();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <InvoiceForm
        invoices={invoices}
        setInvoices={setInvoices}
        editingInvoice={editingInvoice}
        setEditingInvoice={setEditingInvoice}
      />
      <InvoiceList
        invoices={invoices}
        setInvoices={setInvoices}
        setEditingInvoice={setEditingInvoice}
      />
    </div>
  );
};

export default Invoices;
