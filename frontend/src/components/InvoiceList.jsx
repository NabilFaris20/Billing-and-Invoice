import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const InvoiceList = ({ invoices, setInvoices, setEditingInvoice }) => {
  const { user } = useAuth();

  const handleDelete = async (invoiceId) => {
    try {
      await axiosInstance.delete(`/api/invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setInvoices(invoices.filter((invoice) => invoice._id !== invoiceId));
    } catch (error) {
      alert('Failed to delete invoice.');
    }
  };

  return (
    <div>
      {invoices.map((invoice) => (
        <div key={invoice._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{invoice.title}</h2>
          <p>{invoice.description}</p>
          <p className="text-sm text-gray-700">Price: ${invoice.price}</p>
          <p className="text-sm text-gray-500">Status: {invoice.status || 'Pending'}</p>
          <div className="mt-2">
            <button
              onClick={() => setEditingInvoice(invoice)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(invoice._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvoiceList;
