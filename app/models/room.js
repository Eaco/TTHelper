// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var roomSchema = mongoose.Schema({
    name            : String,
    characters      : Array,
    messages        : Array,
    posts           : Array
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Room', roomSchema);
