const Invoice = require('../models/Invoice');
const getInvoice = async (
req,
res) => {
try {
const invoices = await Invoice.find({ userId: req.user.id });
res.json(invoices);
} catch (error) {
res.status(500).json({ message: error.message });

}
};

const addInvoice = async (
    req,
    res) => {
    const { title, description, price } = req.body;
    try {
    const task = await Task.create({ userId: req.user.id, title, description, price });
    res.status(201).json(invoice);
    } catch (error) {
    res.status(500).json({ message: error.message });
    }
    };

const updateInvoice = async (
        req,
        res) => {
        const { title, description, price } = req.body;
        try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'invoice not found' });
        invoice.title = title || invoice.title;
        invoice.description = description || invoice.description;
        invoice.price = price || invoice.price;
        const updatedInvoice = await invoice.save();
        res.json(updatedInvoice);
        } catch (error) {
        res.status(500).json({ message: error.message });
        }
        };

        const deleteInvoice = async (
            req,
            res) => {
            try {
            const invoice = await Invoice.findById(req.params.id);
            if (!invoice) return res.status(404).json({ message: 'invoice not found' });
            await invoice.remove();
            res.json({ message: 'Invoice deleted' });
            } catch (error) {
            res.status(500).json({ message: error.message });
            }
            };
            module.exports = { getInvoice, addInvoice, updateInvoice, deleteInvoice };
