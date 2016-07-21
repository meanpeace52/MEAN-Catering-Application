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
  dateAccepted: Date,
  dateConfirmed: Date,
  status: String
});

export default mongoose.model('Offer', OfferSchema);
