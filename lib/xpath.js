/*
provide xpath functions for cheerio object
*/

var xpath = require('xpath')
, dom = require('xmldom').DOMParser


function x(strXpath, node){	
	var xpath = require('xpath');
	var nodes = xpath.select(strXpath, node);
	if(nodes.length > 0){
		return nodes[0].textContent || "";
	}else{
		return "";
	}
}
var q = function(strXpath, node){		
	var nodes = xpath.select(strXpath, node) || [];
	
	nodes.forEach(function(node){
		//adding function for each node
		node.x = function(strXpath){
			return x(strXpath, this);					
		}
		
		node.q = function(strXpath){
			return q(strXpath, this);					
		}		
	});
	
	//adding function to join nodes' values
	nodes.join = function(sep){
		var arr = [];
		nodes.forEach(function(node){
			arr.push(node.textContent.trim());
		});
		return arr.join(sep);
	}
	
	return nodes;
}

exports.q = function(xp){	
	var $ = this;
	
	var doc = new dom(({ errorHandler:{warning:function(err){},error:function(err){},fatalError:function(err){}}}))
	.parseFromString($.html());  
	
	return q(xp, doc);
}

exports.x = function(xp){	
	var $ = this;
	
	var doc = new dom(({ errorHandler:{warning:function(err){},error:function(err){},fatalError:function(err){}}}))
	.parseFromString($.html());  
	
	return x(xp, doc);
}

