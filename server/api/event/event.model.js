'use strict';

import mongoose from 'mongoose';

var EventSchema = new mongoose.Schema({
  name: String,
  description: String,
  status: String,
  pricePerPerson: Number,
  people: Number,
  vegetarianMeals: Number,
  specialRequest: String,
  includedInPrice: Object,
  deliveryInstructions: String,
  location: String,
  userId: String,
  showToCaterers: Boolean,
  foodTypes: Object,
  serviceTypes: Object,
  date: String,
  time: String,
  selectedCaterers: Object,
  sentTo: Array,
  rejectedBy: Array,
  confirmedBy: String,
  isUpdated: Boolean
});

export default mongoose.model('Event', EventSchema);
