var mongoose = require('mongoose');
var ReviewLogSchema = new mongoose.Schema({
  cid: String,
  user_ip: String,
  status: Number,
  errmsg: String,
  review_id: String,
  updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('ReviewLog', ReviewLogSchema);

