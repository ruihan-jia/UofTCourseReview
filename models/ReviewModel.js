var mongoose = require('mongoose');
var ReviewSchema = new mongoose.Schema({
  cid: String,
  year: Number,
  hard: Number,
  useful: Number,
  interest: Number,
  prof: String,
  comment: String,
  user_ip: String,
  updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Review', ReviewSchema);

