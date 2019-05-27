// scripts/article-grabber.js

var summary = require('node-tldr');
var request = require('request');
var mongoose = require('mongoose');
var async = require('async');
var LanguageDetect = require('languagedetect');

mongoose.connect('mongodb://localhost:27017/tldrnews'); // connect to our database
var Article  = require('../models/article.js');

var languageDetector = new LanguageDetect();

function summarizeArticle(article) { 
  
    summary.summarize(article.url, function(result, failure) {
        if (failure) {
            console.log("An error occured! " + result.error);
        }
        
        addArticle(article, result);
        
    });
}

function addArticle(article, summary) {
    if (article.urlToImage && summary && summary.words >= 30 && summary.words <= 200 && isEnglish(summary.summary.join("\n"))) {
        newArticleJSON = {title: article.title, description: article.description, source: article.source.name.trim(), sourceId: article.source.name.trim().toLowerCase(), date: new Date(), url: article.url, imageUrl: article.urlToImage, summary: summary.summary.join("\n\n"), compressFactor: summary.compressFactor};
        summarizedArticles["articles"].push(newArticleJSON);
        
        Article.findOneAndUpdate({title: newArticleJSON.title}, newArticleJSON, {upsert: true}, 
        function() {
            console.log(newArticleJSON);
        });

    }
}

function isEnglish(words) {
    console.log(languageDetector.detect(words, 1));
    return languageDetector.detect(words, 1)[0][0] == 'english';
}
var sources = ["cbs-news","ars-technica","engadget","techradar","abc-news"]
var jsonfeed = "";
var summarizedArticles = { articles: [] };
var articleNum = 0;

function fetchArticlesFromSources(sources) {
    for (var i = 0; i < sources.length; i++) {
        fetchArticlesFromSource(sources[i]);
    }
}

function fetchArticlesFromSource(source) {
    request({
      uri: "https://newsapi.org/v2/top-headlines?sources="+source+"&apiKey=[removed]",
      method: "GET",
    }, function(error, response, body) {
        var jsonfeed = JSON.parse(body);
        if (jsonfeed) {
            feedArticles(jsonfeed, 0);
        }
    });
}



                   

function feedArticles (jsonfeed, i) {          
   setTimeout(function () {    
      console.log("feeding article...");
      summarizeArticle(jsonfeed["articles"][i]);
      i++;                     
      if (i < jsonfeed["articles"].length) {            
         feedArticles(jsonfeed, i);            
      }                        
   }, 2000);
}

fetchArticlesFromSources(sources);

setTimeout(function () {    
  process.exit();                    
}, 100000);


