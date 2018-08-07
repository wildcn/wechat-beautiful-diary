// 通用业务逻辑
var root_path = "./",
    api = require(root_path + 'api.js'),
    util = require(root_path + 'util.js'),
    login = require(root_path + 'login.js'),
    // cpu = require(root_path + 'cpu.js'),
    toast = require(root_path + 'webtoast.js'),
    bus = {};
var app = getApp();
// 通用页面初始化
bus.init = function(that) {
    var userData = wx.getStorageSync('userRawData');
    var pages = getCurrentPages(),
        len = pages.length,
        currentPage = this.currentPage = pages[len - 1];
    currentPage.today = currentPage.data.today.date;
    currentPage.sessionId = this.sessionId = wx.getStorageSync('sessionId');
    this.getUserId();
    currentPage.toast = new toast();
}
bus.getUserId = function() {
    let sessionId = this.sessionId || wx.getStorageSync('sessionId');
    if (!sessionId) {
        setTimeout(() => {
            this.getUserId();
        }, 200)
        return;
    }
    if (!wx.getStorageSync('myId')) {
        wx.request({
            url: api.myId,
            data: {
                sessionId: sessionId
            },
            success: (res) => {
                console.log(res.data);
                if (res.data.errno == 12) {
                    setTimeout(() => {
                        this.getUserId();
                    }, 400)
                    return;
                } else if (res.data.errno == 0) {
                    wx.setStorageSync('myId', res.data.userId);
                }
            }
        })
    }

}
bus.getCurrentPage = function() {
    var pages = getCurrentPages(),
        len = pages.length;
    return pages[len - 1];
}
bus.getHomePage = function() {
    return getCurrentPages()[0];
}
bus.getDiaryList = (param,call)=>{
    let sessionId = wx.getStorageSync('sessionId');
    if (!sessionId) {
        setTimeout(() => {
            console.log('重新拉取栏目列表')
            bus.getDiaryList(param, call);
            return;
        }, 300)
    }
    var limit = param.limit || 5,
        key = 'columnListDiary',
        columnList = wx.getStorageSync(key) || {},
        limitStart = Object.keys(columnList).length || 0;
    // 看存储空间内是否有数据
    wx.request({
        url: api.getDiary,
        data: {
            sessionId: sessionId,
            start: limitStart,
            limit: limit
        },
        success: function(data) {
            if (data.data.errno == 0) {
                let obj = {};
                for (let i of data.data.columnList) {
                    if (i.date) {
                        i.timestamp = i.date;
                        i.date = util.formatDate(i.date, {
                            format: '{year}-{month}-{day}'
                        });
                        obj[i.date] = i;
                    }
                }
                obj = util.objInsert(obj, columnList);
                wx.setStorage({
                    key: key,
                    data: obj
                })
                call && call(columnList);
            } else if (data.data.errno == 2) {
                login.init(this.getDiaryList(param, call));
            }

        }
    })
}
bus.getColumnList = function(param, call) {
    let sessionId = wx.getStorageSync('sessionId');
    if (!sessionId) {
        setTimeout(() => {
            console.log('重新拉取栏目列表')
            bus.getColumnList(param, call);
            return;
        }, 100)
    }
    var me = this,
        data = me.data,
        type = param.type,
        limit = param.limit || 5,
        key = 'columnList' + type,
        columnList = wx.getStorageSync(key) || {},
        limitStart = Object.keys(columnList).length || 0;
    // 看存储空间内是否有数据
    wx.request({
        url: api['get' + type],
        data: {
            sessionId: sessionId,
            start: limitStart,
            limit: limit
        },
        success: function(data) {
            if (data.data.errno == 0) {
                let obj = {};
                for (let i of data.data.columnList) {
                    if (i.date) {
                        i.timestamp = i.date;
                        i.date = util.formatDate(i.date, {
                            format: '{year}-{month}-{day}'
                        });
                        obj[i.date] = i;
                    }
                }
                obj = util.objInsert(obj, columnList);
                wx.setStorage({
                    key: key,
                    data: obj
                })
                call && call(columnList);
            } else if (data.data.errno == 2) {
                login.init(me.getColumnList(param, call));
            }

        }
    })
};
bus.filterDate = function(list) {
        // 将时间戳转换成日期
        var i, len = list.length;
        for (i = 0; i < len; i++) {
            if (list[i].date && typeof(list[i].date) == 'number') {
                list[i].date = util.formatDate(+list[i].date * 1000, {
                    format: '{year}-{month}-{day}'
                })
            }
        }
        return list;
    }
    // 获得系统信息
bus.getSystemInfo = function(call) {
    wx.getSystemInfo({
        success: function(res) {
            call && call(res);
        }
    })
}

bus.moodArray = function(object) {

    var a = ['angry', 'calm', 'miss', 'sad', 'smile', 'worry'],
        moodArray = [],
        max = 0,
        result = [];
    for (var i = 0; i < a.length; i++) {
        if (max < object[a[i]]) {
            max = object[a[i]];
        }
        moodArray.push(object[a[i]]);
    }
    for (var j = 0; j < moodArray.length; j++) {
        result.push(moodArray[j] / max * 80);
    }
    return result;
}

bus.formatTextArea = function(newsDetail) {
    if (!newsDetail) {
        return [];
    }
    if (/(\s|\S).+(\s|\S)/g.test(newsDetail)) {
        var content = newsDetail.match(/(\s|\S).+(\s|\S)/g);
    } else {
        var content = [newsDetail];
    }
    var NewsContent = [],
        i, len = content.length;
    for (i = 0; i < len; i++) {
        var tmpl = {};
        var con = content[i];
        if (/img/.test(con)) {
            tmpl.type = 'image';
            tmpl.src = util.getParam('src', con);
            tmpl.width = util.getParam('width', con);
            tmpl.height = util.getParam('height', con);
        } else {
            tmpl.type = 'text';
            // 过滤换行
            tmpl.content = con.replace(/[\r\n]/g, '');
        }
        NewsContent.push(tmpl);
    }
    return NewsContent;
};
bus.formatOneNew = function(one) {
    let two = this.formatTextArea(one.post_content);
    var art = {
        title: one.post_title,
        content: two,
        auth: one.post_author,
        ID: one.ID,
        time: one.post_date,
        guid: one.post_date
    }
    for (var i of two) {
        if (i.type == 'image' && !art.image) {
            art.image = i.src;
            break;
        }
    }
    return art;
};
bus.formatNewsList = function(newsList = []) {
    // 处理批量文章
    let bus = this;
    let itemNews = {};
    for (var i = 0; i < newsList.length; i++) {
        if (i == 0) {
            var art = bus.formatOneNew(newsList[i])
        }
        itemNews[newsList[i].ID] = bus.formatOneNew(newsList[i]);
    }
    return {
        first: art,
        all: itemNews
    }
}
bus.getNewsList = function(param, call) {
    // 获得批量文章
    if (typeof(param) == 'function') {
        call = param;
        param = {};
    }
    let itemNews = wx.getStorageSync('itemNews') || {};
    let start = Object.keys(itemNews).length;
    param.start = param.start || start;
    wx.request({
        url: api.getNewsList,
        data: param || {},
        success: function(res) {
            if (res.data.errno == 0) {
                call(res.data.data);
            } else {
                call(false);
            }
        }
    })
}
bus.getOneNew = function(param, call) {
    // 获得单片文章
    if (typeof(param) == 'function') {
        call = param;
        param = {};
    }
    wx.request({
        url: api.getOneNew,
        data: param || {},
        success: function(res) {
            if (res.data.errno == 0) {
                call && call(res.data.data)
            }
        }
    })
}
bus.jumpToDetail = function(newsC, jump_path) {
    var pageUrl = jump_path + 'pages/item/news/index';
    wx.setStorage({
        key: 'news.detail',
        data: newsC
    })
    wx.navigateTo({
        url: pageUrl
    })
};
bus.getMyDiary = function(date, call) {
    wx.request({
        url: api.getMyDiary,
        data: {
            sessionId: wx.getStorageSync('sessionId'),
            date: date
        },
        success: call
    })
}
bus.getUserCalendar = function(param, call) {
        wx.request({
            url: api.getUserCalendar,
            data: param,
            success: call
        })
    }
    /*
     ** 验证缓存数据存在及有效
     ** 提供api则抓取数据 并验证errno为0才返回
     */
bus.todayStorage = function(param, suc, fail) {
    let str = param.str,
        api = param.api,
        data = param.data || {},
        filter = param.filter,
        stoData = wx.getStorageSync(str);
    var pages = getCurrentPages(),
        currentPage = pages[pages.length - 1];
    if (stoData && stoData.date == currentPage.data.today.date) {
        // console.log(`请求缓存数据  method ${param.api}`)
        suc && suc(stoData);
    } else {
        // console.log(`缓存数据非当天，重新请求 method ${param.api}`)
        if (api) {
            wx.request({
                url: api,
                data: data,
                success: function(res) {
                    if (res.data.errno == 0) {
                        let nData = res.data.data;
                        nData.date = nData.date ? util.formatDate(+new Date(), {
                            format: '{year}-{month}-{day}'
                        }) : '';
                        if (filter) {
                            nData = filter(nData);
                        }
                        wx.setStorageSync(str, nData);
                        suc && suc(nData);
                    } else {
                        fail && fail()
                    }
                },
                fail: function() {
                    fail && fail()
                }
            })
        } else {
            fail && fail();
        }

    }
}
bus.saveDiary = function(param = {}, suc, fail) {
    let sessionId = wx.getStorageSync('sessionId')
    if (!sessionId) {
        return
    }
    param.sessionId = sessionId;
    wx.request({
        url: api.pushdiary,
        data: param,
        success: suc,
        fail: fail
    })
}
bus.renderUserAll = function() {
    if (!wx.getStorageSync('sessionId')) {
        setTimeout(() => {
            this.renderUserAll();
        }, 100)
        return;
    }
    wx.request({
        url: api.userAll,
        data: {
            sessionId: wx.getStorageSync('sessionId')
        },
        success: function(data) {
            if (data.data.errno == 0) {
                let param = {
                    diary: data.data.diary,
                    mood: data.data.mood,
                    anniversary: data.data.anniversary
                }
                var pages = getCurrentPages(),
                    len = pages.length,
                    currentPage = pages[len - 1];
                wx.setStorage({
                    key: 'editor.mood',
                    data: param
                })
                currentPage.setData({
                    'curData.userAll': param
                })
            }
        }
    })
}
bus.signEmail = function(param = {
        sessionId: wx.getStorageSync('sesssinId'),
        type: 'private',
        id: 0
    }, suc = function() {}) {
        wx.request({
            url: api.signEmail,
            data: param,
            success: suc
        })
    }
    /*
     ** 发表评论内容
     */

bus.postComments = function(content) {
        let sessionId = wx.getStorageSync('sessionId'),
            me = this.currentPage;
        if (!sessionId) {
            setTimeout(() => {
                bus.postComments(content);
            }, 300)
        }
        // console.log(content);
        let param = {
            type: content.type,
            content: content.content,
            id: content.id,
            title: content.title || '评论',
            sessionId: sessionId,
            date: Date.parse(new Date()) / 1000,
            allow: true
        }
        wx.request({
            url: api.postComments,
            data: param,
            success: function(res) {
                if (res.statusCode == 200 && res.data.errno == 0) {
                    me.toast.toast({
                        title: '评论成功！'
                    })
                }
            }
        })
    }
    /*
     ** 发表私信
     */

bus.postChat = function(content) {
        let sessionId = wx.getStorageSync('sessionId'),
            me = this.currentPage;
        if (!sessionId) {
            setTimeout(() => {
                this.post_content(content);
            }, 100)
            return;
        }
        let param = {
            type: content.type,
            content: content.content,
            receiveId: content.id,
            title: content.title || '私信',
            sessionId: sessionId,
            date: Date.parse(new Date()) / 1000,
        }
        wx.request({
            url: api.chatTo,
            data: param,
            success: function(res) {
                console.log(res);
                if (res.statusCode == 200 && res.data.errno == 0) {
                    me.toast.toast({
                        title: '发送成功！'
                    })
                } else if (res.data.errno == 12) {
                    setTimeout(() => {
                        this.post_content(content);
                    }, 100)
                }
            }
        })
    }
    /*
     ** 处理日记数据 成详情页模式 加载评论
     **/
bus.initDiaryDetail = function(detail) {
    // 处理评论
    if (detail.commentsNum) {
        for (let i of detail.comments) {
            i.time = util.formatDate(i.date, {
                format: "{month}-{day} {hour}:{min}"
            });
            if (util.isArray(i.content)) {
                i.formatContent = i.content;
            } else {
                i.formatContent = this.formatTextArea(i.content);
            }

        }

    }
    detail.comments.sort(function(a, b) {
        return b.date - a.date;
    })
    detail.brow += 1;
    return detail;

};
/*
 ** 日记浏览数增加
 */
bus.addDiaryBrowNum = function(id) {
        wx.request({
            url: api.addDiaryBrow,
            data: {
                id: id
            },
            success: (res) => {
                console.log(res);
            }
        })
    }
    /*
     ** 处理私信或者邮件
     */
bus.initUserEmail = function(i, type = 'private') {
    i.formatContent = this.formatTextArea(i.content);
    i.time = util.formatDate(i.date, {
        format: '{year}-{month,2,0}-{day,2,0} {hour,2,0}:{min,2,0}'
    });
    i.mtype = type;
    return i;
}

/*
 ** 将私信按照发信人和收信人处理
 */
bus.mergePrivateMessage = function(pm) {
    let merge = [],
        send = [],
        receive = [],
        tmpl = [],
        myId = wx.getStorageSync('myId');
    for (let i of pm) {
        // 发送和接收绑在一起
        let sId = i.sendId,
            rId = i.receiveId;
        let tag = +sId > +rId ? `tag_${rId}_${sId}` : `tag_${sId}_${rId}`;
        tmpl.push(tag);
        this[tag] = this[tag] || [];
        this[tag].push(i);
    }
    tmpl = [...new Set(tmpl)];
    for (let j of tmpl) {
        for (let k of this[j]) {
            k.tagNum = this[j].length;
        }
        merge.push(this[j]);
    }
    return merge;
}
bus.chatDetailBrow = ({
    ids
}) => {
    wx.request({
        url: api.chatBrow,
        data: {
            sessionId: wx.getStorageSync('sessionId'),
            ids: ids
        },
        success: (res) => {
            console.log(res);
        }
    })
};

bus.getOptions = ({
    name,
    callback,
    now,
    filter
}) => {
    if (now) {
        wx.request({
            url: api.getOptions,
            data: {
                name: name
            },
            success: (res) => {
                if (res.statusCode == 200 && res.data.errno == 0) {
                    callback && callback(res.data.data.option_value);
                }
            }
        })
        return;
    }
    let param = {
        str: `options.${name}`,
        api: api.getOptions,
        data: {
            name: name
        },
        filter: filter
    }
    console.log(param)
    bus.todayStorage(param, function(res) {
        callback && callback(res.option_value);
    })
}
bus.getPublicDiary = (call) => {
    wx.request({
        url: api.getPublicDiary,
        data: {
            sessionId: wx.getStorageSync('sessionId'),
            limit: 10
        },
        success: function(res) {
            if (res.statusCode == 200 && res.data.errno == 0) {
                wx.setStorageSync('column.square',res.data.columnList);
                call && call(res.data.columnList);
            } else if (res.data.errno == 2) {
                setTimeout(() => {
                    bus.getPublicDiary(call);
                }, 300)
            }
        }
    })
}
module.exports = bus;
