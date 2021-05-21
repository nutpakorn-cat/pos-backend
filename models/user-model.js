const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userModelSchema = new Schema({
    username: String,
    password: String
});

module.exports = mongoose.model('Users', userModelSchema);