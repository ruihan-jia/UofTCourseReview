var mongoose = require('mongoose');
var CourseSchema = new mongoose.Schema({
  cid: String,
  hard: Number,
  useful: Number,
  interest: Number,
  description: String,
  updated_at: { type: Date, default: Date.now },
});
module.exports = mongoose.model('CourseModel', CourseSchema);

