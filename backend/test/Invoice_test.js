const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Invoice = require('../models/invoice'); // Import Invoice model
const { addInvoice, updateInvoice, deleteInvoice, changeInvoiceStatus, getInvoice } = require('../controllers/invoiceController'); // Import functions
const { expect } = chai;

describe('Invoice Controller', () => {

    afterEach(() => {
        sinon.restore(); // ✅ Restore stubs after each test
    });

    // ✅ Test Case 1: Successfully Create an Invoice
    it('should create a new invoice successfully', async () => {
        const req = { user: { id: new mongoose.Types.ObjectId() }, body: { title: "Invoice 001", description: "Test Invoice", price: 200 } };
        const createdInvoice = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

        const createStub = sinon.stub(Invoice, 'create').resolves(createdInvoice);
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await addInvoice(req, res);

        expect(createStub.calledOnce).to.be.true;
        expect(createStub.firstCall.args[0]).to.deep.equal({ userId: req.user.id, ...req.body });
        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith(createdInvoice)).to.be.true;
    });

    // ✅ Test Case 2: Error when creating an invoice
    it('should return 500 if an error occurs while creating an invoice', async () => {
        sinon.stub(Invoice, 'create').throws(new Error('DB Error'));

        const req = { user: { id: new mongoose.Types.ObjectId() }, body: { title: "Invoice 001", description: "Test Invoice", price: 200 } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await addInvoice(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });

    // ✅ Test Case 3: Successfully Update an Invoice
    it('should update an existing invoice successfully', async () => {
        const req = { params: { id: new mongoose.Types.ObjectId() }, body: { title: "Updated Invoice", price: 300 } };
        const invoice = { _id: req.params.id, title: "Invoice 001", description: "Old Description", price: 200, save: sinon.stub().resolvesThis() };

        sinon.stub(Invoice, 'findById').resolves(invoice);
        const res = { json: sinon.spy() };

        await updateInvoice(req, res);

        expect(invoice.title).to.equal("Updated Invoice");
        expect(invoice.price).to.equal(300);
        expect(res.json.calledWith(invoice)).to.be.true;
    });

    // ✅ Test Case 4: Error when updating an invoice
    it('should return 500 if an error occurs while updating an invoice', async () => {
        sinon.stub(Invoice, 'findById').throws(new Error('DB Error'));

        const req = { params: { id: new mongoose.Types.ObjectId() }, body: { title: "Updated Invoice", price: 300 } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await updateInvoice(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });

    // ✅ Test Case 5: Successfully Delete an Invoice
    it('should delete an invoice successfully', async () => {
        const req = { params: { id: new mongoose.Types.ObjectId() } };
        const invoice = { _id: req.params.id };

        sinon.stub(Invoice, 'findById').resolves(invoice);
        sinon.stub(Invoice, 'findByIdAndDelete').resolves(invoice);
        const res = { json: sinon.spy() };

        await deleteInvoice(req, res);

        expect(res.json.calledWith({ message: 'Invoice deleted' })).to.be.true;
    });

    // ✅ Test Case 6: Error when deleting an invoice
    it('should return 500 if an error occurs while deleting an invoice', async () => {
        sinon.stub(Invoice, 'findById').throws(new Error('DB Error'));

        const req = { params: { id: new mongoose.Types.ObjectId() } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await deleteInvoice(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });

    // ✅ Test Case 7: Successfully Change Invoice Status
    it('should update the invoice status successfully', async () => {
        const req = { params: { id: new mongoose.Types.ObjectId() }, body: { status: "Paid" } };
        const invoice = { _id: req.params.id, title: "Invoice 001", description: "Test Invoice", price: 200, status: "Pending", save: sinon.stub().resolvesThis() };

        sinon.stub(Invoice, 'findById').resolves(invoice);
        const res = { json: sinon.spy() };

        await changeInvoiceStatus(req, res);

        expect(invoice.status).to.equal("Paid");
        expect(res.json.calledWith(invoice)).to.be.true;
    });

    // ✅ Test Case 8: Error when changing invoice status
    it('should return 500 if an error occurs while changing the invoice status', async () => {
        sinon.stub(Invoice, 'findById').throws(new Error('DB Error'));

        const req = { params: { id: new mongoose.Types.ObjectId() }, body: { status: "Paid" } };
        const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

        await changeInvoiceStatus(req, res);

        expect(res.status.calledWith(500)).to.be.true;
        expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });

});
