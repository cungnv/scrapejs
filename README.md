scrapejs
========

A web scraping framework for node

## Introduction

Powerful, easy to use web scraping framework, built on top of request, cheerio, and xpath. Support both xpath and jQuery selectors.

## Install

npm install scrapejs

## Samples
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


## License

(The MIT License)

Copyright (c) 2013 Cung Nguyen <cungjava2000@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.