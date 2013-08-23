scrapejs
========

a web scraping framework for node

# Introduction
Powerful, easy to use web scraping framework, built on top of request, cheerio, and xpath. Support both xpath and jQuery selectors.

# Install
npm install scrapejs

# Samples
```javascript
var sp = require('scrapejs').init({
	cc: 2, // up to 2 concurrent requests
	delay: 5 * 1000 // delay 5 seconds before each request
});

sp.load('https://www.google.com/search?q=scraping')
.then(function($){
	$.q("//h3[@class='r']/a").forEach(function(node){
		var res = {
			title: node.textContent,
			url: node.x("./@href")
		}
		console.log(res);
	})
})
.fail(function(err){
	console.log(err);
})

```
