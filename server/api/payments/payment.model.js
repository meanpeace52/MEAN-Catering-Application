'use strict';

import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  from: {
    ref: 'User'
  },
  to: {
    ref: 'User'
  },
  amount: Number,
  status: String
});

export default mongoose.model('Payment', PaymentSchema);
