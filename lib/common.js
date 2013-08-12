var crypto = require('crypto'),
fs = require('fs');

String.prototype.contains = function(str){
	return this.indexOf(str) !== -1;
}

String.prototype.subreg = function(reg){
	var m = this.match(reg);
	if(m) return m[1]; else return '';
}

String.prototype.sub = function(start, end){
	start = start || '';
	var iStart = (start)? this.indexOf(start) : 0;	
	if(iStart === -1) return '';//not found
	iStart += start.length; //to get the next char
	
	var iTo = this.indexOf(end, iStart);
	if(iTo === -1) return '';//not found
	
	var res = this.substring(iStart, iTo);
	res = res || '';
	return res;
	
}


var common = {};

common.md5 = function (str) {
  return crypto.createHash('md5').update(str).digest('hex')
}
common.mergeObjs = function(obj1, obj2) {
  obj1 = obj1 || {};
  obj2 = obj2 || {};
  var obj3 = {};
  for (var attrname in obj2) obj3[attrname] = obj2[attrname];
  for (var attrname in obj1) obj3[attrname] = obj1[attrname];
  return obj3;
}

common.savecsv = function(obj, options){	
	var filePath = options.path;
	var s = options.s || ',',
	q = options.q || '"',
	e = options.e || '"';
	
	var values = [];
	var keys = [];
	for(var k in obj){
		var value = (obj[k] + "").trim().replace(q, e+q).replace('\r','');
		var key = (k + "").trim().replace(q, e+q);
		values.push(q + value + q);
		keys.push(q+ key + q);
		
	}
	
	if(!fs.existsSync(filePath)){
		//write the header
		fs.appendFileSync(filePath, keys.join(s) + "\r\n");
		
	}
	fs.appendFileSync(filePath, values.join(s) + "\r\n");
	
}

common.range = function (low, high, step) {
  // http://kevin.vanzonneveld.net
  // +   original by: Waldo Malqui Silva
  // *     example 1: range ( 0, 12 );
  // *     returns 1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  // *     example 2: range( 0, 100, 10 );
  // *     returns 2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  // *     example 3: range( 'a', 'i' );
  // *     returns 3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
  // *     example 4: range( 'c', 'a' );
  // *     returns 4: ['c', 'b', 'a']
  var matrix = [];
  var inival, endval, plus;
  var walker = step || 1;
  var chars = false;

  if (!isNaN(low) && !isNaN(high)) {
    inival = low;
    endval = high;
  } else if (isNaN(low) && isNaN(high)) {
    chars = true;
    inival = low.charCodeAt(0);
    endval = high.charCodeAt(0);
  } else {
    inival = (isNaN(low) ? 0 : low);
    endval = (isNaN(high) ? 0 : high);
  }

  plus = ((inival > endval) ? false : true);
  if (plus) {
    while (inival <= endval) {
      matrix.push(((chars) ? String.fromCharCode(inival) : inival));
      inival += walker;
    }
  } else {
    while (inival >= endval) {
      matrix.push(((chars) ? String.fromCharCode(inival) : inival));
      inival -= walker;
    }
  }

  return matrix;
}

module.exports = common;
