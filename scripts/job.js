/*

Node-Cron Script for Pulling Articles From NewsAPI Source

*/ 

var cron = require('node-cron');
var childProcess = require('child_process');


cron.schedule('30 * * * *', function() {
    proc = childProcess.fork('./article-grabber.js');
    process.on('error', function (err) {
        console.log(err);
    });

    process.on('exit', function(code) {
        var err = code === 0 ? null : new Error('exit code ' + code);
    });
});
