
var path = require('path') 
, fs = require('fs')
, urlUtil = require('url')
, async = require('async')
, Q = require('q')
, _ = require('underscore')
, cheerio = require('cheerio')
, common = require('./lib/common')


/**
* init an instance of the Scraper
*/
module.exports.init = function(options){
	return new Scraper(options);
}
module.exports.common = common;



/**
* Constructor
*/

function Scraper(options){
	var defaultOptions = {
		cc:1, 		
		delay:5, 
		timeout:60*000, 
		proxy: false,
		proxies:[],
		proxy_file: path.resolve(__dirname, 'proxy.txt'), 
		proxy_auth:'',		
		cache: false,
		dir: path.join(__dirname, "../")
	};	
	this.options = options || {}
	if(this.options.proxy_file || this.options.proxy_auth || this.options.proxies){
		//auto enabling the proxies feature when caller provides one of these options
		this.options.proxy = true;
	}
	//override default optiosn with custom options
	this.options = common.mergeObjs(this.options, defaultOptions); 
	
	this.__loadProxies();
	
	this.request = require('request');
	var self = this;
	var worker = function(options, cb){
		self.__doLoad(options.url, options.options).then(function($){			
			cb();//indicate to the queue that this request is done				
			options.handler(null, $); //pass response data to handler
			
		}).fail(function(err){
			cb();//indicate to the queue that this request is done				
			options.handler(err, null); //pass response data to handler
		})
	}
	this.queue = async.queue(worker, options.cc);
}

//*** API ****

//support: load(url), load(options), or load(url, options)
Scraper.prototype.load = function(url, options){
	if(typeof url === 'object'){
		//case: load(options)
		options = url;
		url = options.url;
	}
	options = options || {}
	url = url || '';	
	if(options.form) options.method = options.method || 'POST';		
	if(url.contains('http://localhost') || url.contains('127.0.0.1')) options.no_proxy = true;
	
	var deferred = Q.defer();
	this.queue.push({url:url, options:options, handler: function(err, $){
		if(err) 
			deferred.reject(err);
		else
			deferred.resolve($);
	}})
	
	return deferred.promise;
}

Scraper.prototype.pagin = function(options){
	require('./lib/pager').create({
		sp: this,
		init: options.init, 
		loadedHandler: options.loaded, 
		doneHandler: options.done || function(err){
			if(err) console.log(err);
		}
	}).start();	
}
//***-- end of API ***

/**
* load given url using Mikeal's Request object
*/
Scraper.prototype.__doLoad = function(url, options ){
	
	var deferred = Q.defer();
	
	options.url = url;
	options.headers || (options.headers = {"User-Agent" : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2'} );
	options.strictSSL = false;
	options.followAllRedirects = true;
	options.timeout = options.timeout || this.options.timeout;
	if(this.options.proxy && options.proxy !== false){
		var proxy = this.options.proxies[Math.floor( (Math.random() * this.options.proxies.length) + 1) - 1].trim();
		if(this.options.proxy_auth){
			proxy = 'http://' + this.options.proxy_auth + '@' + proxy;
		}
		options.proxy = proxy;
	}
	var sp = this;
	setTimeout(function(){		
		try{
			sp.request(options, function(err, res, body) {	
				var accept_codes = options.accept_codes || [];
				accept_codes.push(200);
				
				if(err || accept_codes.indexOf(res.statusCode) === -1){				
					deferred.reject(err || new Error("httpcode: " +res.statusCode));				
				}else{
					//success
					if(options.plain_text){
						//simply return body as text file
						deferred.resolve(body);					
					}else{
						//var cheerio = require('cheerio');
						var $ = cheerio.load(body);
						
						//make cheerio object xpath-able
						_.extend($, require('./lib/xpath'));
						
						//resolve all relative links to absolute
						$('a').each(function(i, el){
							var old = $(el).attr('href');
							if(old && old.length && !old.contains('javascript') && !old.contains('mailto:') && old[0] !== '#'){
								$(this).attr('href', urlUtil.resolve(url, old))
							}
							
						})
						$('form').each(function(i, el){
							var old = $(el).attr('action');
							if(old && old.length && !old.contains('javascript') && old[0] !== '#'){
								$(this).attr('action', urlUtil.resolve(url, old))
							}
							
						})
						//if(res.statusCode !== 200) {console.log(res);process.exit();}					
						
						deferred.resolve($);					
					}
				}
			});
		}catch(err){
			deferred.reject(err);
		}
	}, this.options.delay)	
	
	return deferred.promise;
	
 }
 Scraper.prototype.__loadProxies = function(){
	if(!this.options.proxy_file || !fs.existsSync(this.options.proxy_file)) return;
	//reset proxies
	this.options.proxies = [];
	var self = this;	
	fs.readFileSync(this.options.proxy_file).toString().split("\n")
	.forEach(function(proxy){
		self.options.proxies.push(proxy.trim());	
	})
	
}

 
 