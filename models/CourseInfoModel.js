var mongoose = require('mongoose');
var CourseInfoSchema = new mongoose.Schema({
  id: String,
  code: String,
  name: String,
  description: String,
  division: String,
  department: String,
  prerequisites: String,
  exclusions: String,
  level: Number,
  campus: String,
  term: String,
  year: String
});
module.exports = mongoose.model('Course', CourseInfoSchema);

