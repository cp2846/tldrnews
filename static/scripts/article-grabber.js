// scripts/article-grabber.js


//var Article     = require('../models/article.js');
var summary = require('node-tldr');
var request = require('request');


function summarizeArticle(article) { 
    summary.summarize(article.url, function(result, failure) {
        if (failure) {
            console.log("An error occured! " + result.error);
        }
        addArticle(article, result);
        
    });
}

function addArticle(article, summary) {
    if (summary && summary.words >= 50 && summary.words <= 400) {
        summarizedArticles["articles"].push({title: article.title, source: article.source.name, date: article.publishedAt, url: article.url, urlToImage: article.urlToImage, summary: summary.summary.join("\n"), compressFactor: summary.compressFactor});
    }
    
}

var jsonfeed = "";
var summarizedArticles = { articles: [] };
request({
  uri: "https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=26114bdd1617422094750b21ffde01cc",
  method: "GET",
}, function(error, response, body) {
    jsonfeed = JSON.parse(body);
    for (var i = 0; i < jsonfeed["articles"].length; i++) {
        summarizeArticle(jsonfeed["articles"][i]);

        
    }
    
});
setTimeout(function(){ console.log(summarizedArticles) }, 10000);

