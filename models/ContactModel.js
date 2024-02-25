const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  numberphone: {
    type: String,
    required: true,
  },
  message:{
    type:String,
  }
});

const ContactModel = mongoose.model('contacts', contactSchema);

module.exports = ContactModel;
