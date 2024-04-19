require('dotenv').config();
const mongoose = require('mongoose');

const blogAppSchema = new mongoose.Schema({
  tittle: {
    type: String,
    minLength: 8,
    required: [true, 'Tittle required'],
  },
  author: {
    type: String,
    required: [true, 'Author name required'],
  },
  url: {
    type: String,
  },
  likes: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

blogAppSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    const objectReturned = returnedObject;
    objectReturned.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('BlogApp', blogAppSchema);
