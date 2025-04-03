const Invoice = require('../models/invoice');

const getInvoice = async (req, res) => {
    try {
        const invoices = await Invoice.find({ userId: req.user.id });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addInvoice = async (req, res) => {
    const { title, description, price } = req.body;
    try {
        const invoice = await Invoice.create({ userId: req.user.id, title, description, price });
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateInvoice = async (req, res) => {
    const { title, description, price } = req.body;
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        // 
        if (invoice.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to update this invoice" });
        }

        invoice.title = title || invoice.title;
        invoice.description = description || invoice.description;
        invoice.price = price || invoice.price;

        const updatedInvoice = await invoice.save();
        res.json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        // 
        if (invoice.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to delete this invoice" });
        }

        await Invoice.findByIdAndDelete(req.params.id);
        res.json({ message: 'Invoice deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const changeInvoiceStatus = async (req, res) => {
    const { status } = req.body; 

    if (!['Pending', 'Paid', 'Overdue'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }

    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        if (invoice.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized to change this invoice status" });
        }

        invoice.status = status;
        const updatedInvoice = await invoice.save();
        res.json(updatedInvoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getInvoice, addInvoice, updateInvoice, deleteInvoice, changeInvoiceStatus };

//example for demonstration
