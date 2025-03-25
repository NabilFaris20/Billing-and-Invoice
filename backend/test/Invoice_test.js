const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Invoice = require('../models/invoice');
const {
  addInvoice,
  updateInvoice,
  deleteInvoice,
  changeInvoiceStatus,
  getInvoice
} = require('../controllers/invoiceController');
const { expect } = chai;

describe('Invoice Controller', () => {

  afterEach(() => {
    sinon.restore();
  });

  // ✅ Add Invoice
  it('should create a new invoice successfully', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "Test Invoice", description: "Test Desc", price: 200 }
    };
    const createdInvoice = { ...req.body, userId: req.user.id };

    sinon.stub(Invoice, 'create').resolves(createdInvoice);
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await addInvoice(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdInvoice)).to.be.true;
  });

  it('should return 500 if an error occurs while creating an invoice', async () => {
    sinon.stub(Invoice, 'create').throws(new Error('DB Error'));

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: { title: "Test Invoice", description: "Test Desc", price: 200 }
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await addInvoice(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });

  // ✅ Get Invoices
  it('should return invoices for the logged-in user', async () => {
    const userId = new mongoose.Types.ObjectId();
    const req = { user: { id: userId } };
    const mockInvoices = [{ title: 'Invoice 1', userId }, { title: 'Invoice 2', userId }];

    sinon.stub(Invoice, 'find').resolves(mockInvoices);
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await getInvoice(req, res);

    expect(res.json.calledWith(mockInvoices)).to.be.true;
  });

  it('should return 500 if an error occurs while fetching invoices', async () => {
    sinon.stub(Invoice, 'find').throws(new Error('DB Error'));

    const req = { user: { id: new mongoose.Types.ObjectId() } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await getInvoice(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });

  // ✅ Update Invoice
  it('should update an invoice successfully', async () => {
    const userId = new mongoose.Types.ObjectId();
    const req = {
      user: { id: userId },
      params: { id: new mongoose.Types.ObjectId() },
      body: { title: "Updated Title", price: 300 }
    };

    const invoice = {
      _id: req.params.id,
      userId,
      title: "Old Title",
      description: "Old Desc",
      price: 100,
      save: sinon.stub().resolvesThis()
    };

    sinon.stub(Invoice, 'findById').resolves(invoice);
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await updateInvoice(req, res);

    expect(invoice.title).to.equal("Updated Title");
    expect(invoice.price).to.equal(300);
    expect(res.json.calledWith(invoice)).to.be.true;
  });

  it('should return 404 if invoice is not found during update', async () => {
    sinon.stub(Invoice, 'findById').resolves(null);

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId() },
      body: { title: "Test", price: 100 }
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateInvoice(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it('should return 403 if user is unauthorized to update', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId() },
      body: { title: "Test", price: 100 }
    };

    const invoice = {
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId().toString(), // different user
    };

    sinon.stub(Invoice, 'findById').resolves(invoice);
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updateInvoice(req, res);

    expect(res.status.calledWith(403)).to.be.true;
  });

  // ✅ Delete Invoice
  it('should delete an invoice successfully', async () => {
    const userId = new mongoose.Types.ObjectId();
    const invoiceId = new mongoose.Types.ObjectId();
    const req = { user: { id: userId }, params: { id: invoiceId } };

    const invoice = { _id: invoiceId, userId: userId.toString() };

    sinon.stub(Invoice, 'findById').resolves(invoice);
    sinon.stub(Invoice, 'findByIdAndDelete').resolves(invoice);

    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await deleteInvoice(req, res);

    expect(res.json.calledWith({ message: 'Invoice deleted' })).to.be.true;
  });

  it('should return 403 if user is unauthorized to delete invoice', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId() }
    };

    const invoice = {
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId().toString() // different user
    };

    sinon.stub(Invoice, 'findById').resolves(invoice);
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteInvoice(req, res);

    expect(res.status.calledWith(403)).to.be.true;
  });

  it('should return 404 if invoice is not found during delete', async () => {
    sinon.stub(Invoice, 'findById').resolves(null);

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId() }
    };

    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deleteInvoice(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  // ✅ Change Status
  it('should update invoice status successfully', async () => {
    const userId = new mongoose.Types.ObjectId();
    const req = {
      user: { id: userId },
      params: { id: new mongoose.Types.ObjectId() },
      body: { status: 'Paid' }
    };

    const invoice = {
      _id: req.params.id,
      userId: userId.toString(),
      status: 'Pending',
      save: sinon.stub().resolvesThis()
    };

    sinon.stub(Invoice, 'findById').resolves(invoice);
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await changeInvoiceStatus(req, res);

    expect(invoice.status).to.equal('Paid');
    expect(res.json.calledWith(invoice)).to.be.true;
  });

  it('should return 400 if invalid status is given', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId() },
      body: { status: 'InvalidStatus' }
    };

    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await changeInvoiceStatus(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'Invalid status value' })).to.be.true;
  });

  it('should return 404 if invoice is not found during status update', async () => {
    sinon.stub(Invoice, 'findById').resolves(null);

    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId() },
      body: { status: 'Paid' }
    };

    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await changeInvoiceStatus(req, res);

    expect(res.status.calledWith(404)).to.be.true;
  });

  it('should return 403 if unauthorized to change status', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      params: { id: new mongoose.Types.ObjectId() },
      body: { status: 'Paid' }
    };

    const invoice = {
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId().toString() // different user
    };

    sinon.stub(Invoice, 'findById').resolves(invoice);
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await changeInvoiceStatus(req, res);

    expect(res.status.calledWith(403)).to.be.true;
  });

});
