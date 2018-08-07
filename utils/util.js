var util = {};
/*
 ** 时间格式化
 */
function tryget(o, path, v) {
    var parts = path.split('.'),
        part, len = parts.length;
    for (var t = o, i = 0; i < len; ++i) {
        part = parts[i];
        if (part in t) {
            t = t[parts[i]];
        } else {
            return v;
        }
    }
    return t;
}

util.tryget = tryget;
util.isPlainObject = function(obj) {
    return 'isPrototypeOf' in obj && Object.prototype.toString.call(obj) === '[object Object]';
}
var format = (function() {
    function postprocess(ret, a) {
        var align = parseInt(a.align),
            absAlign = Math.abs(a.align),
            result, retStr;
        if (ret == null) {
            retStr = '';
        } else if (typeof ret == 'number') {
            retStr = '' + ret;
        } else {
            throw new Error('Invalid argument type!');
        }
        if (absAlign === 0) {
            return ret;
        } else if (absAlign < retStr.length) {
            result = align > 0 ? retStr.slice(0, absAlign) : retStr.slice(-absAlign);
        } else {
            result = Array(absAlign - retStr.length + 1).join(a.pad || format.DefaultPaddingChar);
            result = align > 0 ? result + retStr : retStr + result;
        }
        return result;
    }

    function p(all) {
        var ret = {},
            p1, p2, sep = format.DefaultFieldSeperator;
        p1 = all.indexOf(sep);
        if (p1 < 0) {
            ret.index = all;
        } else {
            ret.index = all.substr(0, p1);
            p2 = all.indexOf(sep, p1 + 1);
            if (p2 < 0) {
                ret.align = all.substring(p1 + 1, all.length);
            } else {
                ret.align = all.substring(p1 + 1, p2);
                ret.pad = all.substring(p2 + 1, all.length);
            }
        }
        return ret; //{index,pad,align}
    }

    return function(self, args) {
        var len = arguments.length;
        if (len > 2) {
            args = Array.prototype.slice.call(arguments, 1);
        } else if (len === 2 && !util.isPlainObject(args)) {
            args = [args];
        } else if (len === 1) {
            return self;
        }
        return self.replace(format.InterpolationPattern, function(all, m) {
            var a = p(m),
                ret = tryget(args, a.index);
            if (ret == null) ret = a.index;
            return a.align == null && a.pad == null ? ret : postprocess(ret, a) || ret;
        });
    };
})();

format.DefaultPaddingChar = ' ';
format.DefaultFieldSeperator = ',';
format.InterpolationPattern = /\{(.*?)\}/g;
util.format = format;

util.formatDate = function(ts, opts = {}) {
    var tmp = String(ts),
        t, eff = tmp.length > 10 ? 1 : 1000;
    if (tmp.match(/^[\d]+$/)) {
        t = new Date(parseInt(ts * eff, 10));
    } else {
        t = new Date(Date.parse(tmp.replace(/-/g, '/')));
    }
    return format(opts.format || util.formatDate.DateFormatShort, {
        year: t.getFullYear(),
        month: t.getMonth() + 1,
        day: t.getDate(),
        hour: t.getHours(),
        min: t.getMinutes()
    });
};
// util.formatDate.DateFormatShort = "{month,2,0}-{day,2,0} {hour,2,0}:{min,2,0}";
util.formatDate.DateFormatShort = "{year}-{month}-{day}";
util.go = function(url, type) {
    console.log(url)
    if (!url) {
        return;
    }
    if (type) {
        wx.redirectTo({
            url: url
        });
    } else {
        wx.navigateTo({
            url: url
        });
    }
}

// 数组插入


util.arrayInsert = function(array, target) {
        if (!target) {
            return array;
        }
        var i, len = array.length;
        for (i = 0; i < len; i++) {
            target.push(array[i]);
        }
        return target;
    }
    // 对象克隆
util.cloneArray = function(data){
    var i,len = data.length,tmpl = [];
    for(i=0;i<len;i++){
        tmpl.push(data[i]);
    }
    return tmpl;
}
util.cloneObj = function(origin) {
    let originProto = Object.getPrototypeOf(origin);
    return Object.assign(Object.create(originProto), origin);
};
// 对象插入
util.objInsert = function(origin, target) {
        for (let i in origin) {
            if (typeof(i) === 'object') {
                target[i] = util.objInsert(i, target[i]);
            };
            target[i] = origin[i];
        }
        return target;
    }
    // ua判断
util.ua = function() {
    var userAgent = navigator.userAgent.toLowerCase();
    return {
        ios: /iP(ad|hone|od)/i.test(userAgent),
        android: /android/i.test(userAgent),
        wechat: /micromessenger/i.test(userAgent),
        uc: /UCBrowser|UC/i.test(userAgent),
        qqbrowser: /mqqbrowser/i.test(userAgent),
        qq: (/qq/i.test(userAgent) && !/mqqbrowser/i.test(userAgent)),
        wp: /Windows Phone/i.test(userAgent),
        huaweimt7: /HuaweiMT7/i.test(userAgent),
        huaweip7: /HuaweiP7/i.test(userAgent),
        huawei: /HW-HUAWEI/i.test(userAgent),
        news360: /360news/i.test(userAgent)

    }
};

util.arrayMax = function(o) {
    var len = o.length;
    var max = o[0],
        min = o[0];
    var len = o.length;
    for (var i = 1; i < len; i++) {
        if (o[i] > max) {
            max = o[i];
        }
        if (o[i] < min) {
            min = o[i]
        }
    }
    return {
        max: max,
        min: min
    };
}
util.getParam = function(name, url) {
    var sUrl = url ? url : location.search;
    var r = sUrl.match(new RegExp(name + '[\s|\S]*="*([^&]*)"*'));
    return (r === null ? null : decodeURIComponent(r[1]));
}
util.isArray = function(obj){
    return Object.prototype.toString.call(obj) === '[object Array]';    
}
// 反转数组
util.reversalArray = (array)=>{
    let result = [],i,length = array.length;
    for(i=length-1;i>=0;i--){
        result.push(array[i]);
    }
    return result;
}
// 获取随机字符串
util.getRandomString = (num = 8)=>{
    return 'r'+Math.random().toString(16).substr(2,num+1);
}
// 获取0-参数的随机整数
util.getRandomNum = (num = 3)=>{
    if (typeof(num) !== 'number') {return num}
    return Math.floor(Math.random()*num);
}
module.exports = util;
