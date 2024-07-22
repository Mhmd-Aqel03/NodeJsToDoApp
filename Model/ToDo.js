const mongoose = require('mongoose')

const TaskSchema = mongoose.Schema({
  task: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true
  },
  user_id: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('ToDoList', TaskSchema)