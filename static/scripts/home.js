var requestLock = false;
var addTo = true;
function openArticle(event) {
    article = event.target.parentNode;
    article.classList.remove("unopened");
    event.target.classList.add("no-display");
}

function loadArticles(arguments) {
   var url = '/api/top?';
   addTo = false;
   
   //format the URL with query parameters
   if (arguments.sources) {
        url +=  "&sources=" + arguments.sources;
   } else {
        vueArticles.articles = [];
        return;
   }    
   
   if (arguments.timeBefore) {
        url += "&timeBefore=" + arguments.timeBefore;
   }
   if (arguments.timeAfter) {
        url += "&timeAfter=" + arguments.timeAfter;
   }
   if (arguments.search) {
        url += "&search=" + arguments.search;
   }
   if (arguments.addTo) {
        addTo = true;
   }
   var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        
        if (!addTo) {
            vueArticles.articles = JSON.parse(this.responseText);
            
        } else { // merge lists instead of replacing
            
           vueArticles.mergeArticles(JSON.parse(this.responseText));
           
            
        }

        
    }
    requestLock = false;
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

var articles = [];

var vueArticles = new Vue({
    el: '#articles',
    data: {
        articles: [],
        fetched: false,
    },
    computed: {
        articlesLength: function() {
            return this.articles.length
        }
    },
    methods: {
        getIconLink: function(article) {
            
            icons = { "cbs news" : "icons/icon-cbs.png",
                      "ars technica" : "icons/icon-ars.png" ,
                      "techradar" : "icons/icon-tr.png",
                      "abc news" : "icons/icon-abc.png" ,
                      "engadget" : "icons/icon-engadget.png" }
            return  icons[article.source.toLowerCase()];
        },
        getImageUrl: function(article) {
            
            
            return article.imageUrl;
        },
        getLastTime: function() {
            if (this.articles.length > 0)
                return this.articles[this.articles.length-1].date;
        },
        mergeArticles: function(newArticles) {
            for (var i = 0; i < newArticles.length; i++) {
                if (!this.containsSummary(newArticles[i].summary)) {
                    this.articles.push(newArticles[i]);
                }
            }
        },        
        containsSummary: function(summary) {
            for (var i = 0; i < this.articles.length; i++) {
                if (this.articles[i].summary == summary) return true;
            }
        }
    },
});


var vueSources = new Vue({
    el: '#sources',
    data: {
        sources: [],
        fetched: false,
    },
    computed: {
        numSources: function() {
            return this.sources.length;
        }
    },
    methods: {
        getIconLink: function(source) {
            
            icons = { "cbs news" : "icons/icon-cbs.png",
                      "ars technica" : "icons/icon-ars.png" ,
                      "techradar" : "icons/icon-tr.png",
                      "abc news" : "icons/icon-abc.png" ,
                      "engadget" : "icons/icon-engadget.png" }
            return  icons[source.id];
        },
        toggleSource: function(source) {
            source.disabled = !source.disabled;
            loadArticles({sources: this.getEnabledSources().join(",")});
        },
        getEnabledSources: function() {
            enabledSources = [];
            for (var i = 0; i < this.sources.length; i++) {
                if (!sources[i].disabled) enabledSources.push(sources[i].id);
            }
            return enabledSources;
        }

    },
});
var sources = [
            { id: "cbs news", disabled: false }, 
            { id: "ars technica", disabled: false }, 
            { id: "techradar", disabled: false }, 
            { id: "abc news", disabled: false } , 
            { id: "engadget", disabled: false }
        ]
vueSources.sources = sources;

loadArticles({sources: vueSources.getEnabledSources().join(",")});



window.onscroll = function (ev) {
    var docHeight = document.body.offsetHeight;
    docHeight = docHeight == undefined ? window.document.documentElement.scrollHeight : docHeight;

    var winheight = window.innerHeight;
    winheight = winheight == undefined ? document.documentElement.clientHeight : winheight;

    var scrollpoint = window.scrollY;
    scrollpoint = scrollpoint == undefined ? window.document.documentElement.scrollTop : scrollpoint;

    if ((scrollpoint + winheight) >= docHeight && !requestLock) {
        loadArticles({sources: vueSources.getEnabledSources().join(","), timeBefore: vueArticles.getLastTime(), addTo: true });
        requestLock = true;
    }
};