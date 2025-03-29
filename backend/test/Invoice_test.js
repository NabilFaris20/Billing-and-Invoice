const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Invoice = require('../models/invoice');
const {
  getInvoice,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  changeInvoiceStatus
} = require('../controllers/invoiceController');

const { expect } = chai;

describe('Invoice Controller', () => {

  afterEach(() => {
    sinon.restore();
  });

  describe('getInvoice', () => {
    it('should return invoices for the user', async () => {
      const userId = new mongoose.Types.ObjectId();
      const req = { user: { id: userId } };
      const mockInvoices = [{ title: 'Invoice 1' }, { title: 'Invoice 2' }];

      const findStub = sinon.stub(Invoice, 'find').resolves(mockInvoices);
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      await getInvoice(req, res);

      expect(findStub.calledWith({ userId })).to.be.true;
      expect(res.json.calledWith(mockInvoices)).to.be.true;
    });

    it('should return 500 on DB error', async () => {
      sinon.stub(Invoice, 'find').throws(new Error('DB Error'));

      const req = { user: { id: new mongoose.Types.ObjectId() } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await getInvoice(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  describe('addInvoice', () => {
    it('should create a new invoice', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { title: 'Test Invoice', description: 'Test Desc', price: 100 }
      };
      const mockInvoice = { ...req.body, userId: req.user.id };

      const createStub = sinon.stub(Invoice, 'create').resolves(mockInvoice);
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await addInvoice(req, res);

      expect(createStub.calledWith({ userId: req.user.id, ...req.body })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(mockInvoice)).to.be.true;
    });

    it('should return 500 if creation fails', async () => {
      sinon.stub(Invoice, 'create').throws(new Error('DB Error'));

      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { title: 'Test', description: 'Test', price: 100 }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await addInvoice(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  describe('updateInvoice', () => {
    it('should update invoice if found and authorized', async () => {
      const userId = new mongoose.Types.ObjectId();
      const req = {
        user: { id: userId.toString() },
        params: { id: new mongoose.Types.ObjectId() },
        body: { title: 'Updated Title', price: 200 }
      };

      const invoice = {
        _id: req.params.id,
        userId: userId.toString(),
        title: 'Old Title',
        price: 100,
        description: 'Old Desc',
        save: function () {
          this.title = req.body.title || this.title;
          this.price = req.body.price || this.price;
          return Promise.resolve(this);
        }
      };

      sinon.stub(Invoice, 'findById').resolves(invoice);
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      await updateInvoice(req, res);

      expect(res.json.calledOnce).to.be.true;
      const updated = res.json.firstCall.args[0];
      expect(updated.title).to.equal('Updated Title');
      expect(updated.price).to.equal(200);
    });

    it('should return 404 if invoice not found', async () => {
      sinon.stub(Invoice, 'findById').resolves(null);

      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        params: { id: new mongoose.Types.ObjectId() },
        body: {}
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateInvoice(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });

    it('should return 403 if unauthorized', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        params: { id: new mongoose.Types.ObjectId() },
        body: {}
      };

      const invoice = { userId: new mongoose.Types.ObjectId().toString() };

      sinon.stub(Invoice, 'findById').resolves(invoice);
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await updateInvoice(req, res);

      expect(res.status.calledWith(403)).to.be.true;
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice if found and authorized', async () => {
      const userId = new mongoose.Types.ObjectId();
      const invoiceId = new mongoose.Types.ObjectId();
      const req = { user: { id: userId.toString() }, params: { id: invoiceId } };

      const invoice = { _id: invoiceId, userId: userId.toString() };

      sinon.stub(Invoice, 'findById').resolves(invoice);
      sinon.stub(Invoice, 'findByIdAndDelete').resolves(invoice);
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteInvoice(req, res);

      expect(res.json.calledOnce).to.be.true;
      expect(res.json.firstCall.args[0].message).to.equal('Invoice deleted');
    });

    it('should return 404 if invoice not found', async () => {
      sinon.stub(Invoice, 'findById').resolves(null);

      const req = { user: { id: 'abc' }, params: { id: '123' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteInvoice(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });

    it('should return 403 if unauthorized', async () => {
      const req = {
        user: { id: 'user1' },
        params: { id: 'invoice1' }
      };
      const invoice = { userId: 'otheruser' };

      sinon.stub(Invoice, 'findById').resolves(invoice);
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await deleteInvoice(req, res);

      expect(res.status.calledWith(403)).to.be.true;
    });
  });

  describe('changeInvoiceStatus', () => {
    it('should update invoice status if valid and authorized', async () => {
      const userId = new mongoose.Types.ObjectId();
      const req = {
        user: { id: userId.toString() },
        params: { id: new mongoose.Types.ObjectId() },
        body: { status: 'Paid' }
      };

      const invoice = {
        _id: req.params.id,
        userId: userId.toString(),
        status: 'Pending',
        save: function () {
          this.status = req.body.status;
          return Promise.resolve(this);
        }
      };

      sinon.stub(Invoice, 'findById').resolves(invoice);
      const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

      await changeInvoiceStatus(req, res);

      expect(res.json.calledOnce).to.be.true;
      const updated = res.json.firstCall.args[0];
      expect(updated.status).to.equal('Paid');
    });

    it('should return 400 for invalid status', async () => {
      const req = {
        user: { id: 'abc' },
        params: { id: '123' },
        body: { status: 'Unknown' }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await changeInvoiceStatus(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Invalid status value' })).to.be.true;
    });

    it('should return 404 if invoice not found', async () => {
      sinon.stub(Invoice, 'findById').resolves(null);

      const req = {
        user: { id: 'abc' },
        params: { id: '123' },
        body: { status: 'Paid' }
      };
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await changeInvoiceStatus(req, res);

      expect(res.status.calledWith(404)).to.be.true;
    });

    it('should return 403 if unauthorized', async () => {
      const req = {
        user: { id: 'user1' },
        params: { id: 'invoice1' },
        body: { status: 'Paid' }
      };
      const invoice = { userId: 'otheruser' };

      sinon.stub(Invoice, 'findById').resolves(invoice);
      const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

      await changeInvoiceStatus(req, res);

      expect(res.status.calledWith(403)).to.be.true;
    });
  });

});
