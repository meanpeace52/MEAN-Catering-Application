'use strict';

import mongoose from 'mongoose';

var OfferSchema = new mongoose.Schema({
  pricePerPerson: Number,
  counter: Number,
  counterReason: String,
  contactInfo: String,
  offerDescription: String,
  includedInPrice: Array,
  eventId: String,
  catererId: String,
  catererName: String,
  date: Date,
  createDate: Date,
  dateAccepted: Date,
  dateConfirmed: Date,
  status: String,
  invoice: {
    pricePerPerson: Number,
    people: Number,
    service: Number,
    tax: Number,
    total: Number,
    commission: {
      type: Number,
      default: 10
    },
    refund: {
      type: Number,
      default: 0
    },
    adjustment: {
      client: {
        type: Number,
        default: 0
      },
      caterer: {
        type: Number,
        default: 0
      },
      chargeOff: {
        type: Number,
        default: 0
      }
    }
  },
  paymentId: String,
  paymentStatus: String
});

export default mongoose.model('Offer', OfferSchema);
