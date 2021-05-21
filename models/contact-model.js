const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactModelSchema = new Schema({
    contactId: String,
    firstname: String,
    lastname: String,
    mobile: String,
    email: String,
    facebook: String,
    imageUrl: String
});

module.exports = mongoose.model('Contacts', contactModelSchema);