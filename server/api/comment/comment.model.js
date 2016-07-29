'use strict';

import mongoose from 'mongoose';

var CommentSchema = new mongoose.Schema({
  name: String,
  text: String,
  createDate: Date,
  userId: String,
  userName: String,
  offerId: String,
  level: Number,
  replyTo: String
});

export default mongoose.model('Comment', CommentSchema);
