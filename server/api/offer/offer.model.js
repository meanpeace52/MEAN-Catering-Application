'use strict';

import mongoose from 'mongoose';

var OfferSchema = new mongoose.Schema({
  pricePerPerson: String,
  counter: String,
  counterReason: String,
  contactInfo: String,
  offerDescription: String,
  includedInPrice: Array,
  eventId: String,
  catererId: String,
  status: String,
  isUpdated: Boolean
});

export default mongoose.model('Offer', OfferSchema);
