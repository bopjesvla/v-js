module.exports = {
    stdfn: {
        CONCAT: function (){
	return Array.prototype.slice.call(arguments).join('');
},
        REGEXP_LIKE: function (a,b,c) {

	return (a||'').search(RegExp(b,c))>-1;
},
        CONCAT_WS: function () {
    args = Array.prototype.slice.call(arguments);
    return args.slice(1, args.length).join(args[0]);
},
        REPLACE: function (target,pattern,replacement) {
    return (target||'').split(pattern).join(replacement);
},
        GEN_RANDOM_UUID: function () {
    var d0 = Math.random()*0xffffffff|0;
    var d1 = Math.random()*0xffffffff|0;
    var d2 = Math.random()*0xffffffff|0;
    var d3 = Math.random()*0xffffffff|0;
    return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
      lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
      lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
      lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
},
        UUID: function () {
    var d0 = Math.random()*0xffffffff|0;
    var d1 = Math.random()*0xffffffff|0;
    var d2 = Math.random()*0xffffffff|0;
    var d3 = Math.random()*0xffffffff|0;
    return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
      lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
      lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
      lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
},
        NEWID: function () {
    var d0 = Math.random()*0xffffffff|0;
    var d1 = Math.random()*0xffffffff|0;
    var d2 = Math.random()*0xffffffff|0;
    var d3 = Math.random()*0xffffffff|0;
    return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
      lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
      lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
      lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
},
        CONVERT: function (value, args) {
	var val = value;

	if(args.style) {
		// TODO 9,109, 20,120,21,121,126,130,131 conversions
		var t;
		if(/\d{8}/.test(val)){
			t = new Date(+val.substr(0,4),+val.substr(4,2)-1,+val.substr(6,2));		
		} else{
			t = new Date(val);
		}
		switch(args.style){
			case 1: // mm/dd/yy
				val =  ("0"+(t.getMonth()+1)).substr(-2)+'/'+("0"+t.getDate()).substr(-2)+'/'+("0"+t.getYear()).substr(-2);
				break;
			case 2: 	// yy.mm.dd
				val =  ("0"+t.getYear()).substr(-2)+'.'+("0"+(t.getMonth()+1)).substr(-2)+'.'+("0"+t.getDate()).substr(-2);
				break;
			case 3: 	// dd/mm/yy
				val =  ("0"+t.getDate()).substr(-2)+'/'+("0"+(t.getMonth()+1)).substr(-2)+'/'+("0"+t.getYear()).substr(-2);
				break;
			case 4: 	// dd.mm.yy
				val =  ("0"+t.getDate()).substr(-2)+'.'+("0"+(t.getMonth()+1)).substr(-2)+'.'+("0"+t.getYear()).substr(-2);
				break;
			case 5: 	// dd-mm-yy
				val =  ("0"+t.getDate()).substr(-2)+'-'+("0"+(t.getMonth()+1)).substr(-2)+'-'+("0"+t.getYear()).substr(-2);
				break;
			case 6: 	// dd mon yy
				val =  ("0"+t.getDate()).substr(-2)+' '+t.toString().substr(4,3).toLowerCase()+' '+("0"+t.getYear()).substr(-2);
				break;
			case 7: 	// Mon dd,yy
				val =  t.toString().substr(4,3)+' '+("0"+t.getDate()).substr(-2)+','+("0"+t.getYear()).substr(-2);
				break;
			case 8 : 	// hh:mm:ss
			case 108 : 	// hh:mm:ss
				val =  ("0"+t.getHours()).substr(-2)+':'+("0"+(t.getMinutes())).substr(-2)+':'+("0"+t.getSeconds()).substr(-2);
				break;
			case 10: 	// mm-dd-yy
				val =  ("0"+(t.getMonth()+1)).substr(-2)+'-'+("0"+t.getDate()).substr(-2)+'-'+("0"+t.getYear()).substr(-2);
					break;
			case 11: 	// yy/mm/dd
				val =  ("0"+t.getYear()).substr(-2)+'/'+("0"+(t.getMonth()+1)).substr(-2)+'/'+("0"+t.getDate()).substr(-2);
				break;
			case 12: 	// yymmdd
				val =  ("0"+t.getYear()).substr(-2)+("0"+(t.getMonth()+1)).substr(-2)+("0"+t.getDate()).substr(-2);
				break;
			case 101: 	// mm/dd/yyyy
				val =  ("0"+(t.getMonth()+1)).substr(-2)+'/'+("0"+t.getDate()).substr(-2)+'/'+t.getFullYear();
				break;
			case 102: 	// yyyy.mm.dd
				val =  t.getFullYear()+'.'+("0"+(t.getMonth()+1)).substr(-2)+'.'+("0"+t.getDate()).substr(-2);
				break;
			case 103: 	// dd/mm/yyyy
				val =  ("0"+t.getDate()).substr(-2)+'/'+("0"+(t.getMonth()+1)).substr(-2)+'/'+t.getFullYear();
				break;
			case 104: 	// dd.mm.yyyy
				val =  ("0"+t.getDate()).substr(-2)+'.'+("0"+(t.getMonth()+1)).substr(-2)+'.'+t.getFullYear();
				break;
			case 105: 	// dd-mm-yyyy
				val =  ("0"+t.getDate()).substr(-2)+'-'+("0"+(t.getMonth()+1)).substr(-2)+'-'+t.getFullYear();
				break;
			case 106: 	// dd mon yyyy
				val =  ("0"+t.getDate()).substr(-2)+' '+t.toString().substr(4,3).toLowerCase()+' '+t.getFullYear();
				break;
			case 107: 	// Mon dd,yyyy
				val =  t.toString().substr(4,3)+' '+("0"+t.getDate()).substr(-2)+','+t.getFullYear();
				break;
			case 110: 	// mm-dd-yyyy
				val =  ("0"+(t.getMonth()+1)).substr(-2)+'-'+("0"+t.getDate()).substr(-2)+'-'+t.getFullYear();
				break;
			case 111: 	// yyyy/mm/dd
				val =  t.getFullYear()+'/'+("0"+(t.getMonth()+1)).substr(-2)+'/'+("0"+t.getDate()).substr(-2);
				break;

			case 112: 	// yyyymmdd
				val =  t.getFullYear()+("0"+(t.getMonth()+1)).substr(-2)+("0"+t.getDate()).substr(-2);
				break;
			default:
				throw new Error('The CONVERT style '+args.style+' is not realized yet.');
		}
	};

	var udbtypeid = args.dbtypeid.toUpperCase();

	if(args.dbtypeid == 'Date') {
		return new Date(val);
	} else if(udbtypeid == 'DATE') {
		var d = new Date(val);
		var s = d.getFullYear()+"."+("0"+(d.getMonth()+1)).substr(-2)+"."+("0"+d.getDate()).substr(-2);
		return s;
	} else if(udbtypeid == 'DATETIME' || udbtypeid == 'DATETIME2') {
		var d = new Date(val);
		var s = d.getFullYear()+"."+("0"+(d.getMonth()+1)).substr(-2)+"."+("0"+d.getDate()).substr(-2);
		s += " "+("0"+d.getHours()).substr(-2)+":"+("0"+d.getMinutes()).substr(-2)+":"+("0"+d.getSeconds()).substr(-2);
		s += '.'+("00"+d.getMilliseconds()).substr(-3)
		return s;
	} else if(['MONEY'].indexOf(udbtypeid)>-1) {
		var m = +val;
		return (m|0)+((m*100)%100)/100;
	} else if(['BOOLEAN'].indexOf(udbtypeid)>-1) {
		return !!val;
	} else if(['INT','INTEGER','SMALLINT','BIGINT','SERIAL','SMALLSERIAL','BIGSERIAL'].indexOf(args.dbtypeid.toUpperCase())>-1) {
		return val|0;
	} else if(['STRING','VARCHAR','NVARCHAR', 'CHARACTER VARIABLE'].indexOf(args.dbtypeid.toUpperCase())>-1) {
		if(args.dbsize) return (""+val).substr(0,args.dbsize);
		else return ""+val;
	} else if(['CHAR','CHARACTER', 'NCHAR'].indexOf(udbtypeid)>-1) {
		return (val+(new Array(args.dbsize+1).join(" "))).substr(0,args.dbsize);
		//else return ""+val.substr(0,1);
	} else if(['NUMBER','FLOAT'].indexOf(udbtypeid)>-1) {
		if(typeof args.dbprecision != 'undefined') {
			var m = +val;
			var fxd = Math.pow(10,args.dbprecision);
			return (m|0)+((m*fxd)%fxd)/fxd;
		} else {
			return +val;
		}
	} else if((['DECIMAL','NUMERIC'].indexOf(udbtypeid)>-1)) {
		var m = +val;
		var fxd = Math.pow(10,args.dbprecision);
		return (m|0)+((m*fxd)%fxd)/fxd;
	} else if(['JSON'].indexOf(udbtypeid)>-1) {
		if(typeof val == 'object') return val;
		try {
			return JSON.parse(val);
		} catch(err) { throw new Error('Cannot convert string to JSON');};
	}
	return val;
},
        EXTEND: function extend(a,b){
    a = a || {};
    for(var key in b) {
        if(b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }
    return a;
},
        CHAR: function (x) { return String.fromCharCode(x) },
        ASCII: function (a) {
    return a.charCodeAt(0);
},
        COALESCE: function () {
	for(var i=0;i<arguments.length;i++) {
		if(typeof arguments[i] == 'undefined') continue;
		if(typeof arguments[i] == "number" && isNaN(arguments[i]) ) continue;
		return arguments[i];
	}
	return undefined;
},
        USER: function (){
	return 'alasql';
},
        OBJECT_ID: function (name,type) {
	if(typeof type == 'undefined') type = 'T';
	type = type.toUpperCase();

	var sname = name.split('.');
	var dbid = alasql.useid;
	var objname = sname[0];
	if(sname.length == 2) {
		dbid = sname[0];
		objname = sname[1];
	}

	var tables = alasql.databases[dbid].tables;
	dbid = 	alasql.databases[dbid].databaseid;
	for(var tableid in tables) {
		if(tableid == objname) {
			// TODO: What OBJECT_ID actually returns

			if(tables[tableid].view && type == 'V') return dbid+'.'+tableid;
			if(!tables[tableid].view && type == 'T') return dbid+'.'+tableid;
			return undefined;
		}
	}

	return undefined;
},
        DATE: function (d) {
	if(/\d{8}/.test(d)) return new Date(+d.substr(0,4),+d.substr(4,2)-1,+d.substr(6,2));
	return new Date(d);
},
        NOW: function (){
	var d = new Date();
	var s = d.getFullYear()+"."+("0"+(d.getMonth()+1)).substr(-2)+"."+("0"+d.getDate()).substr(-2);
	s += " "+("0"+d.getHours()).substr(-2)+":"+("0"+d.getMinutes()).substr(-2)+":"+("0"+d.getSeconds()).substr(-2);
	s += '.'+("00"+d.getMilliseconds()).substr(-3)
	return s;
},
        GETDATE: function (){
	var d = new Date();
	var s = d.getFullYear()+"."+("0"+(d.getMonth()+1)).substr(-2)+"."+("0"+d.getDate()).substr(-2);
	s += " "+("0"+d.getHours()).substr(-2)+":"+("0"+d.getMinutes()).substr(-2)+":"+("0"+d.getSeconds()).substr(-2);
	s += '.'+("00"+d.getMilliseconds()).substr(-3)
	return s;
},
        CURRENT_TIMESTAMP: function (){
	var d = new Date();
	var s = d.getFullYear()+"."+("0"+(d.getMonth()+1)).substr(-2)+"."+("0"+d.getDate()).substr(-2);
	s += " "+("0"+d.getHours()).substr(-2)+":"+("0"+d.getMinutes()).substr(-2)+":"+("0"+d.getSeconds()).substr(-2);
	s += '.'+("00"+d.getMilliseconds()).substr(-3)
	return s;
},
        SECOND: function (d){
	var d = new Date(d);
	return d.getSeconds();
},
        MINUTE: function (d){
	var d = new Date(d);
	return d.getMinutes();
},
        HOUR: function (d){
	var d = new Date(d);
	return d.getHours();
},
        WEEKDAY: function (d){
	var d = new Date(d);
	return d.getDay();
},
        DAYOFWEEK: function (d){
	var d = new Date(d);
	return d.getDay();
},
        DAYOFMONTH: function (d){
	var d = new Date(d);
	return d.getDate();
},
        DAY: function (d){
	var d = new Date(d);
	return d.getDate();
},
        MONTH: function (d){
	var d = new Date(d);
	return d.getMonth()+1;
},
        YEAR: function (d){
	var d = new Date(d);
	return d.getFullYear();
},
        DATEDIFF: function (period, d1, d2) {
  var interval = (new Date(d2)).getTime() - (new Date(d1)).getTime();
  return interval / PERIODS[period.toLowerCase()];
},
        DATEADD: function (period, interval, d) {
  var nd = (new Date(d)).getTime() + interval*PERIODS[period.toLowerCase()];
  return new Date(nd);
},
        INTERVAL: function (interval, period) {
  return interval*PERIODS[period.toLowerCase()];
},
        ADDDATE: function (d, interval) {
  var nd = (new Date(d)).getTime() + interval;
  return new Date(nd);
},
        DATE_ADD: function (d, interval) {
  var nd = (new Date(d)).getTime() + interval;
  return new Date(nd);
},
        SUBDATE: function (d,interval) {
  var nd = (new Date(d)).getTime() - interval;
  return new Date(nd);
},
        DATE_SUB: function (d,interval) {
  var nd = (new Date(d)).getTime() - interval;
  return new Date(nd);
}
    },
    utils: {
        escapeq: function (s) {

  return ('' + s).replace(/["'\\\n\r\u2028\u2029]/g, function (character) {
    // Escape all characters not included in SingleStringCharacters and
    // DoubleStringCharacters on
    // http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
    switch (character) {
      case '"':
      case "'":
      case '\\':
        return '\\' + character
        // Four possible LineTerminator characters need to be escaped:
      case '\n':
        return '\\n'
      case '\r':
        return '\\r'
      case '\u2028':
        return '\\u2028'
      case '\u2029':
        return '\\u2029'
    }
  })
},
        undoubleq: function (s) {
    return s.replace(/(\')/g,'\'\'');
},
        doubleq: function (s) {
    return s.replace(/(\'\')/g,'\\\'');
},
        doubleqq: function (s) {
    return s.replace(/\'/g,"\'");
},
        global: null,
        isNativeFunction: function (fn){
  return typeof fn === "function" && !!~(fn.toString().indexOf("[native code]"));
},
        isWebWorker: false,
        isNode: true,
        isBrowser: false,
        isBrowserify: false,
        isRequireJS: false,
        isMeteor: false,
        isMeteorClient: false,
        isMeteorServer: false,
        isCordova: false,
        hasIndexedDB: false,
        isArray: function (obj){
	return "[object Array]"===Object.prototype.toString.call(obj);
},
        hash: function (str){
  var hash = 5381,
      i    = str.length

  while(i)
    hash = (hash * 33) ^ str.charCodeAt(--i)

  return hash;
},
        arrayUnion: function (a,b) {
    var r = b.slice(0);
    a.forEach(function(i){
                            if (r.indexOf(i) < 0){
                                r.push(i);
                            }
                        });
    return r;
},
        arrayDiff: function (a,b) {
    return a.filter(function(i) {return b.indexOf(i) < 0;});
},
        arrayIntersect: function (a,b) {
    var r = [];
    a.forEach(function(ai) {
        var found = false;

        b.forEach(function(bi){
            found = found || (ai===bi);
        });

        if(found) {
            r.push(ai);
        }
    });
    return r;
},
        arrayUnionDeep: function (a,b) {
    var r = b.slice(0);
    a.forEach(function(ai) {
        var found = false;

        r.forEach(function(ri){

            found = found || deepEqual(ai, ri);
        });

        if(!found) {
            r.push(ai);
        }
    });
    return r;
},
        arrayExceptDeep: function (a,b) {
    var r = [];
    a.forEach(function(ai) {
        var found = false;

        b.forEach(function(bi){

            found = found || deepEqual(ai, bi);
        });

        if(!found) {
            r.push(ai);
        }
    });
    return r;
},
        arrayIntersectDeep: function (a,b) {
    var r = [];
    a.forEach(function(ai) {
        var found = false;

        b.forEach(function(bi){

            found = found || deepEqual(ai, bi, true);
        });

        if(found) {
            r.push(ai);
        }
    });
    return r;
},
        cloneDeep: function cloneDeep(obj) {
    if(null === obj || typeof(obj) !== 'object'){
        return obj;
    }

    if(obj instanceof Date) {
	return new Date(obj);
    }

    var temp = obj.constructor(); // changed

    for(var key in obj) {
        if(obj.hasOwnProperty(key)) {
            temp[key] = cloneDeep(obj[key]);
        }
    }
    return temp;
},
        deepEqual: function (x, y) {
    if (typeof x === "object" && null !== x && (typeof y === "object" && null !== y)) {
        if (Object.keys(x).length !== Object.keys(y).length) {
            return false;
        }
        for (var prop in x) {
            if (y.hasOwnProperty(prop)) {
                if (!deepEqual(x[prop], y[prop])) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    } else {
        if (x !== y) {
            return false;
        } else {
            return true;
        }
    }
},
        distinctArray: function (data) {
    var uniq = {};
    // TODO: Speedup, because Object.keys is slow
    for(var i=0,ilen=data.length;i<ilen;i++) {
        var uix;
        if(typeof data[i] === 'object') {
            uix = Object.keys(data[i]).sort().map(function(k){return k+'`'+data[i][k];}).join('`');
        } else {
            uix = data[i];
        }
        uniq[uix] = data[i];
    }
    var res = [];
    for(var key in uniq){
        res.push(uniq[key]);
    }
    return res;
},
        extend: function extend(a,b){
    a = a || {};
    for(var key in b) {
        if(b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }
    return a;
},
        flatArray: function (a) {

    if(!a || 0 === a.length){
        return [];
    }

    // For recordsets
    if(typeof a === 'object' && a instanceof alasql.Recordset) {
        return a.data.map(function(ai){return ai[a.columns[0].columnid];});
    }
    // Else for other arrays
    var key = Object.keys(a[0])[0];
    if(key === undefined){
        return [];
    }
    return a.map(function(ai) {return ai[key];});
},
        arrayOfArrays: function (a) {
    return a.map(function(aa){
        var ar = [];
        for(var key in aa){
            ar.push(aa[key]);
        }
        return ar;
    });
},
        xlsnc: function (i) {
    var addr = String.fromCharCode(65+i%26);
    if(i>=26) {
        i=((i/26)|0)-1;
        addr = String.fromCharCode(65+i%26)+addr;
        if(i>26) {
            i=((i/26)|0)-1;
            addr = String.fromCharCode(65+i%26)+addr;
        }
    }
    return addr;
},
        xlscn: function (s) {
    var n = s.charCodeAt(0)-65;
    if(s.length>1) {
        n = (n+1)*26+s.charCodeAt(1)-65;

        if(s.length>2) {
            n = (n+1)*26+s.charCodeAt(2)-65;
        }
    }
    return n;
},
        domEmptyChildren: function (container){
  var len = container.childNodes.length;
  while (len--) {
    container.removeChild(container.lastChild);
  }
},
        like: function (pattern,value,escape) {
    // Verify escape character
    if(!escape) escape = '';

    var i=0;
    var s = '^';

    while(i<pattern.length) {
      var c = pattern[i], c1 = '';
      if(i<pattern.length-1) c1 = pattern[i+1];

      if(c === escape) {
        s += '\\'+c1;
        i++;
      } else if(c==='[' && c1 === '^') {
        s += '[^';
        i++;
      } else if(c==='[' || c===']' ) {
        s += c;
      } else if(c==='%') {
        s += '.*';
      } else if(c === '_') {
        s += '.';
      } else if('/.*+?|(){}'.indexOf(c)>-1) {
        s += '\\'+c;
      } else {
        s += c;
      }
      i++;
    }

    s += '$';

    return (''+(value||'')).toUpperCase().search(RegExp(s.toUpperCase()))>-1;
   },
        glob: function (value,pattern) {

    var i=0;
    var s = '^';

    while(i<pattern.length) {
      var c = pattern[i], c1 = '';
      if(i<pattern.length-1) c1 = pattern[i+1];

      if(c==='[' && c1 === '^') {
        s += '[^';
        i++;
      } else if(c==='[' || c===']' ) {
        s += c;
      } else if(c==='*') {
        s += '.*';
      } else if(c === '?') {
        s += '.';
      } else if('/.*+?|(){}'.indexOf(c)>-1) {
        s += '\\'+c;
      } else {
        s += c;
      }
      i++;
    }

    s += '$';
    return (''+(value||'')).toUpperCase().search(RegExp(s.toUpperCase()))>-1;
   },
        findAlaSQLPath: function () {
	/** type {string} Path to alasql library and plugins */

	if (utils.isWebWorker) {
		return '';
		/** @todo Check how to get path in worker */

	} else if(utils.isMeteorClient) {
		return '/packages/dist/';

	} else if(utils.isMeteorServer) {
		return 'assets/packages/dist/';

	} else if(utils.isNode) {
		return __dirname;

	} else if(utils.isBrowser) {
		var sc = document.getElementsByTagName('script');

		for(var i=0;i<sc.length;i++) {
			if (sc[i].src.substr(-16).toLowerCase() === 'alasql-worker.js') {
				return sc[i].src.substr(0,sc[i].src.length-16);

			} else if (sc[i].src.substr(-20).toLowerCase() === 'alasql-worker.min.js') {
				return sc[i].src.substr(0,sc[i].src.length-20);

			} else if (sc[i].src.substr(-9).toLowerCase() === 'alasql.js') {
				return sc[i].src.substr(0,sc[i].src.length-9);

			} else if (sc[i].src.substr(-13).toLowerCase() === 'alasql.min.js') {
				return sc[i].src.substr(0,sc[i].src.length-13);

			}
		}
	}
	return '';
},
        uncomment: function uncomment(str) {
	// Add some padding so we can always look ahead and behind by two chars
	str = ('__' + str + '__').split('');
	var quote = false,
		quoteSign,
		// regularExpression = false,
		// characterClass = false,
		blockComment = false,
		lineComment = false;
		// preserveComment = false;

	for (var i = 0, l = str.length; i < l; i++) {

		// When checking for quote escaping, we also need to check that the
		// escape sign itself is not escaped, as otherwise '\\' would cause
		// the wrong impression of an unclosed string:
		var unescaped = str[i - 1] !== '\\' || str[i - 2] === '\\';

		if (quote) {
			if (str[i] === quoteSign && unescaped){
				quote = false;
			}

		} else if (blockComment) {
			// Is the block comment closing?
			if (str[i] === '*' && str[i + 1] === '/') {
				// if (!preserveComment)
					str[i] = str[i + 1] = '';
				blockComment /* = preserveComment*/ = false;
				// Increase by 1 to skip closing '/', as it would be mistaken
				// for a regexp otherwise
				i++;
			} else { //if (!preserveComment) {
				str[i] = '';
			}
		} else if (lineComment) {
			// One-line comments end with the line-break
			if (str[i + 1] === '\n' || str[i + 1] === '\r'){
				lineComment = false;
			}
			str[i] = '';
		} else {
			if (str[i] === '"' || str[i] === "'") {
				quote = true;
				quoteSign = str[i];
			} else if (str[i] === '[' && str[i-1] !== "@") {
				quote = true;
				quoteSign = ']';
			// } else if (str[i] === '-' &&  str[i + 1] === '-') {
			// 	str[i] = '';
			// 	lineComment = true;
			} else if (str[i] === '/' && str[i + 1] === '*') {
					// Do not filter out conditional comments /*@ ... */
					// and comments marked as protected /*! ... */

					str[i] = '';
					blockComment = true;

			}
		}
	}
	// Remove padding again.
	str = str.join('').slice(2, -2);

	return str;
},
        JSONtoString: function (obj) {
	var s = '';
	if(typeof obj == "string") s = '"'+obj+'"';
	else if(typeof obj == "number") s = obj;
	else if(typeof obj == "boolean") s = obj;
	else if(typeof obj == "object") {
		if(obj instanceof Array) {
			s += '['+obj.map(function(b){
				return JSONtoString(b);
			}).join(',')+']';
		} else if(!obj.toJS || obj instanceof yy.Json) {
			// to prevent recursion
			s = '{';
			var ss = [];
			for(var k in obj) {
				var s1 = ''; 
				if(typeof k == "string") s1 += '"'+k+'"';
				else if(typeof k == "number") s1 += k;
				else if(typeof k == "boolean") s1 += k;
				else {
					throw new Error('THis is not ES6... no expressions on left side yet');
				}
				s1 += ':'+JSONtoString(obj[k]);
				ss.push(s1);
			};
			s += ss.join(',')+'}';
		} else if(obj.toString)	{
			s = obj.toString();
		} else {
			throw new Error('1Can not show JSON object '+JSON.stringify(obj));
		}
	} else {
		throw new Error('2Can not show JSON object '+JSON.stringify(obj));		
	}

	return s;
}
    }
}
