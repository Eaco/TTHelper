/**
 * Created by Ben on 8/24/2015.
 */
//-----setup variables----

var express     = require('express');
var app         = express();
var server      = require('http').createServer(app);
var io          = require('socket.io').listen(server);
var port        = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var ip_address  = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var mongoose    = require('mongoose');
var passport    = require('passport');
var flash       = require('connect-flash');

var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var session         = require('express-session');

var configDB        = require('./config/database.js');
var connection_string = configDB.url;

if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
     connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;
}

//------configuration begins here--------

mongoose.connect(connection_string);         //DB connection
app.use(express.static(__dirname + '/views'));

require('./config/passport')(passport); // pass passport for configuration


//following is for the express application to work, may end up not using EJS in the end, but for now why not?
app.use(morgan('dev'));                 //logging
app.use(cookieParser());                //cookie reading
app.use(bodyParser());

app.set('view engine', 'ejs');              //sets express up for ejs, but I'll end up changing this.


//passport stuff

app.use(session({secret:'ottersarethebestdancers'})); //session secret
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//routes

require('./app/routes.js')(app, passport);
require('./app/socket.js')(io);                     //adds all that sweet sweet socket logic we all love
server.listen(port, ip_address);
console.log('listening on port ' + port);


