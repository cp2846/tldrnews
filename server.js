// /server.js

/* 
Main Express server file.
Pretty much defines the overall setup for the application including API routes, etc.

*/
var express = require("express");
var app = express();
var path = require("path");
var summarizer = require('node-tldr');
var bodyParser = require('body-parser');
var url = require('url');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tldrnews'); // connect to our database
var Article  = require('./models/article.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; 


var apiRouter = express.Router();


apiRouter.get('/', function(req, res) {
    res.json({ message: 'API working!'});
});




// filter top headlines by sources
apiRouter.get('/top', function(req, res) {
    
    
    var parsedUrl = url.parse(req.url, true);
    var query = parsedUrl.query;
    var search = "";
    if (query.search) {
        search = query.search;
    }
    
    querySources = [];
    if (query.sources) {
        sources = query.sources.split(","); 
        for (var i = 0; i < sources.length; i++) {
            querySources.push({'sourceId': sources[i].toLowerCase()}); 
        }
    }
    
    var timeBefore = new Date().toISOString();
    if (query.timeBefore) {
        timeBefore = query.timeBefore;
        
    } 
    
    
    if (query.timeAfter) {
        timeAfter = query.timeAfter;
        
    }  else {
        timeAfter = 0;
    }
    
    
    formattedParams = [];
    if (search) {
        formattedParams.push({ $text : {$search: search} });
    }
    if (query.sources) {
        formattedParams.push({ $or : querySources });
    }
    if (query.timeBefore || query.timeAfter) {
        formattedParams.push({ date: {  $lt: timeBefore, $gt: timeAfter}});
    }
    if (formattedParams.length === 0) {
        formattedParams.push({});
    }
    

    Article.find({ $and: formattedParams }, 
    {'_id': 0, 'title' :1, 'source': 1, 'url': 1, 'imageUrl': 1, 'summary': 1, 'date': 1}) 
    .sort({'date': -1})
    .limit(7)
    .exec(
        function(err, articles) {
            if (err) res.send(err);
            res.json(articles);
    });
});


// filter top headlines by text search
apiRouter.get('/search/:searchString', function(req, res) {

    
    Article.find({ $text : {$search: req.params.searchString} }, 
    {'_id': 0, 'title' :1, 'source': 1, 'url': 1, 'imageUrl': 1, 'summary': 1, 'date': 1}) 
    .sort({'date': -1})
    .limit(20)
    .exec(
        function(err, articles) {
            if (err) res.send(err);
            res.json(articles);
    });
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/home.html'));
});

app.get('/about', function(req, res) {
    res.sendFile(path.join(__dirname + '/templates/about.html'));
});



app.use(express.static('static'));

app.listen(port);
app.use('/api', apiRouter);

