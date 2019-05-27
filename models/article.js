// models/article.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ArticleSchema   = new Schema({
    title: String,
    source: String, 
    url: String, 
    imageUrl: String, 
    summary: String, 
    date: Date,
    sourceId: String,
    description: String,
});
ArticleSchema.index({title: 'text', summary: 'text', description: 'text'});
module.exports = mongoose.model('Article', ArticleSchema);
