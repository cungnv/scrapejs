module.exports.create = function(options){
	return new Pager(options);
}

function Pager(options){
	this.sp = options.sp;
	this.init = options.init;
	this.loadedHandler = options.loadedHandler;
	this.doneHandler = options.doneHandler;
	this.page = 0;
	
}

Pager.prototype.process = function(options){
	var pager = this;
	
	if(!options) return pager.doneHandler();
	if(typeof options === 'string') options = {url: options};
	if(!options.url) return pager.doneHandler();
		
	pager.sp.load(options.url, options)
	.then(function($){
		pager.page++;
		$.stats = {page: pager.page};
		
		//success, call the data handler and wait for next action
		var next = function(options){
			pager.process(options);
		}
		return pager.loadedHandler($, next);
	})
	.fail(function(err){
		return pager.doneHandler(err);
	})
}

Pager.prototype.start = function(){
	this.process(this.init);
}
 