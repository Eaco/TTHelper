/**
 * Created by Ben on 8/24/2015.
 */
// app/models/message.js
// load the things we need
var mongoose = require('mongoose');
// define the schema for our user model
var messageSchema = mongoose.Schema({
    message          : {
        text         :String,
        user         :String
    }
});
module.exports = mongoose.model('Message', messageSchema);