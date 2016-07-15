'use strict';

import mongoose from 'mongoose';

var OfferSchema = new mongoose.Schema({
  pricePerPerson: String,
  counter: Number,
  counterReason: String,
  contactInfo: String,
  offerDescription: String,
  includedInPrice: Array,
  eventId: String,
  catererId: String,
  catererName: String,
  status: String
});

export default mongoose.model('Offer', OfferSchema);
