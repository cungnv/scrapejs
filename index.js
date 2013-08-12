
var path = require('path') 
, fs = require('fs')
, urlUtil = require('url')
, async = require('async')
, Q = require('q')
, _ = require('underscore')
, cheerio = require('cheerio')
, common = require('./lib/common')


/**
* create an and init an instance of the Scraper
*/
module.exports.init = function(options){
	return new Scraper(options);
}

/**
* Constructor
*/

function Scraper(options){
	var defaultOptions = {
		cc:1, 
		plain_text: false, 
		delay:5, 
		timeout:60, 
		proxies:[],
		proxy_file: path.resolve(__dirname, 'proxy.txt'), 
		proxy_auth:'',
		proxy_enabled: false	
	};	
	options = options || {}
	if(options.proxy_file || options.proxy_auth || options.proxies){
		//auto enabling the proxies feature when caller provides one of these options
		options.proxy_enabled = true;
	}
	//override default optiosn with custom options
	this.options = options = common.mergeObjs(options, defaultOptions); 
	
	this.loadProxies();
	
	this.request = require('request');
	var self = this;
	var worker = function(options, cb){
		self.doLoad(options.url, options.options).then(function($){			
			cb();//indicate to the queue that this request is done				
			options.handler(null, $); //pass response data to handler
			
		}).fail(function(err){
			cb();//indicate to the queue that this request is done				
			options.handler(err, null); //pass response data to handler
		})
	}
	this.queue = async.queue(worker, options.cc);
}
Scraper.prototype.loadProxies = function(){
	if(!this.options.proxy_file || !fs.existsSync(this.options.proxy_file)) return;
	//reset proxies
	this.options.proxies = [];
	var self = this;	
	fs.readFileSync(this.options.proxy_file).toString().split("\n")
	.forEach(function(proxy){
		self.options.proxies.push(proxy.trim());	
	})
	
}


Scraper.prototype.load = function(url, options){
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

/**
* load given url using Mikeal's Request object
*/
Scraper.prototype.doLoad = function(url, options ){
	//console.log(url);
	
	var deferred = Q.defer();
	
	options.url = url;
	options.headers || (options.headers = {"User-Agent" : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2'} );
	options.strictSSL = false;
	options.followAllRedirects = true;
	if(!options.no_proxy && this.options.proxy_enabled){
		var proxy = this.options.proxies[Math.floor( (Math.random() * this.options.proxies.length) + 1) - 1].trim();
		if(this.options.proxy_auth){
			proxy = 'http://' + this.options.proxy_auth + '@' + proxy;
		}
		options.proxy = proxy;
	}
	
	
	try{
		this.request(options, function(err, res, body) {	
			var accept_codes = options.accept_codes || [200];
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
	
	return deferred.promise;
	
 }
 