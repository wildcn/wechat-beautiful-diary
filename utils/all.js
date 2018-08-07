var root_path = "./",
    util = require(root_path + 'util.js'),
    api = require(root_path + 'api.js'),
    cpu = require(root_path + 'cpu.js'),
    bus = require(root_path + 'bus.js');
var all = {
    navigateTo: function(e) {
        var href = e.currentTarget.dataset.href;
        if (!href) {
            console.log('缺少href')
            return;
        }
        var isRedirect = /redirect/.test(href) ? true : false;
        let page_path = this.page_path;
        if (page_path && new RegExp(page_path, 'g').test(href)) {
            return;
        }
        util.go(this.root_path + e.currentTarget.dataset.href, isRedirect);
    },
    switchTab: function(e) {
        var href = e.currentTarget.dataset.href;
        wx.switchTab({
            url: href
        })
    },
    onShareAppMessage: function() {
        // 用户点击右上角分享
        return {
            title: '美日美历', // 分享标题
            desc: '记录美美的心情', // 分享描述
            path: '/pages/home/index' // 分享路径
        }
    },
    everyDayClick: function(res) {
        var me = this,
            id = res.currentTarget.dataset.id,
            newsC = wx.getStorageSync('itemNews')[id],
            root_path = this.root_path || this.data.curData.option.root_path;
        if (!newsC) {
            bus.getOneNew(id, function(data) {
                bus.jumpToDetail(bus.formatOneNew(data), root_path)
            })
            return;
        }
        bus.jumpToDetail(newsC, root_path)
    },
    bindDateChange: function(e) {
        var curTime = e.detail.value,
            me = this;
        this.setData({
            'editor.diary.selectDate': curTime,
            'today.select.date': curTime,
        })
        this.dateChange && this.dateChange(curTime);


    },
    navMore: function() {
        this.toast.toast({
            title: '开发中~',
            duration: 1000
        })
    },
    closeVersionTips: function() {
        this.setData({
            'module.render.versionTips.show': false,
        })
        wx.setStorageSync('versionTips', true);
    },
    clearStorage: function() {
        let sessionId = wx.getStorageSync('sessionId'),
            userRawData = wx.getStorageSync('userRawData'),
            versionTips = wx.getStorageSync('versionTips');
        wx.clearStorage();
        wx.setStorage({
            key: 'sessionId',
            data: sessionId
        })
        wx.setStorage({
            key: 'userRawData',
            data: userRawData
        })
        wx.setStorage({
            key: 'versionTips',
            data: versionTips
        })
        this.toast.toast({
            title: '缓存清除成功'
        });
    },
    getUserEmail: function() {
        // console.log('getUserEmail')
        let me = this,
            sessionId = wx.getStorageSync('sessionId');
        me.maxRequestTime = 0;
        if (!sessionId && me.maxRequestTime < 10) {
            setTimeout(() => {
                me.maxRequestTime++;
                this.getUserEmail();
            }, 300)
            return;
        }
        wx.request({
            url: api.getUserEmail,
            data: {
                sessionId: wx.getStorageSync('sessionId'),
                date: Math.floor(+new Date() / 1000)
            },
            success: function(res) {
                console.log(res)
                if (res.statusCode == 200 && res.data.errno == 12) {
                    setTimeout(() => {
                        me.maxRequestTime++;
                        me.getUserEmail();
                    }, 300)
                }
                if (res.statusCode == 200 && res.data.errno == 0) {
                    wx.setStorageSync('column.userEmail', res.data.data);
                    cpu.render_userEmail();
                }
            }
        })
    },
    // 文章点赞
    artAgreeClick: function(e) {
        let index = e.currentTarget.dataset.index,
            list = this.data.column.square.itemList,
            listData = list[index],
            id = listData.id,
            me = this,
            myName = wx.getStorageSync('userRawData').nickName,
            sessionId = this.sessionId || wx.getStorageSync('sessionId');
        if (listData.isAgree) {
            me.toast.toast({
                title: '您已赞过啦~'
            })
            return;
        }
        wx.request({
            url: api.addDiaryAgree,
            data: {
                sessionId: sessionId,
                id: id
            },
            success: function(res) {
                console.log(res)
                if (res.data.errno == 0) {
                    me.toast.toast({
                        title: `${listData.nickName}：么么哒 谢谢你~`
                    })
                    listData.isAgree = 1;
                    listData.agree++;
                    me.setData({
                        'column.square.itemList': list
                    })
                }
            }
        })
    },
    // 文章评论
    artCommentClick: function(e) {
        // 只需要评论ID
        let me = this,
            id = e.currentTarget.dataset.id,
            method = e.currentTarget.dataset.method, // 定义临时输入框输入类型
            square = wx.getStorageSync('column.square'),
            index = square.ids.findIndex(() => id),
            listData = square.itemList[index],
            type = e.currentTarget.dataset.type || 'diary',
            sessionId = this.sessionId || wx.getStorageSync('sessionId');
        // 打开临时输入框 并存入id
        this.setData({
            'module.tempInput.show': true,
            'module.tempInput.id': id,
            'module.tempInput.type': type,
            'module.tempInput.method': method,
            'module.tempInput.index': index,
            'module.tempInput.title': '@' + listData.nickName + ' ' + listData.title,
        })
    },
    /*
     ** 私信
     ** @param userId
     */
    chatToUser: function(e) {
        let id = e.currentTarget.dataset.id,
            index = e.currentTarget.dataset.index,
            receiveName = e.currentTarget.dataset.receivename;
        let myName = wx.getStorageSync('userRawData').nickName,
            sessionId = this.sessionId || wx.getStorageSync('sessionId');
        // 打开临时输入框 并存入id
        this.setData({
            'module.tempInput.show': true,
            'module.tempInput.id': id,
            'module.tempInput.type': 'chat',
            'module.tempInput.placeholder': `向${receiveName}说点什么吧~`,
            'module.tempInput.method': 'chat',
            'module.tempInput.icon': 'write',
            'module.tempInput.index': index,
            'module.tempInput.title': `From ${myName}`,
        })
    },
    // 临时输入区域改变内容
    tempInputChange: function(e) {
        let value = e.detail.value;
        this.setData({
            'module.tempInput.content': value
        })
    },
    // 临时输入页面提交
    tempInputSubmit: function(e) {
        if (e.currentTarget.dataset.type == 'cancel') {
            this.setData({
                'module.tempInput.show': false,
            });
            return;
        }
        let tempInputData = this.data.module.tempInput;
        if (!tempInputData.content) {
            this.toast.toast({
                title: '至少说点什么~'
            })
            return;
        }
        this.setData({
            'module.tempInput.show': false,
            'module.tempInput.value': ''
        });
        this.getTempInput && this.getTempInput(tempInputData);
    },
    // 接受临时输入框内容
    getTempInput: function(content) {
        let me = this;
        if (!content) {
            return
        }
        switch (content.method) {
            // 评论
            case 'comments':
                bus.postComments(content);

                break;
                // 评论
            case 'chat':
                bus.postChat(content);
                break;
        }
    },
    /*
     ** 打开一条日记
     */
    openOneDiary: function(e) {
        let me = this,
            id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/item/square/index?id=' + id,
        })
    },
    // 万能球
    gbIconTap: function() {
        cpu.render_showGodBall();
    },
    gbTitleTap: (e) => {
        let date = e.currentTarget.dataset.date;
        cpu.render_dirayDetail({
            date: date
        });
    },
    gotoDiaryDetail: (e) => {
        let id = e.currentTarget.dataset.id;
        cpu.render_dirayDetail({
            id: id
        });
    },
    gbTouchMove: function(event) {
        // if (this.data.currentGesture != 0) {
        //     return
        // }
        let currentX = event.touches[0].pageX;
        let tx = currentX - this.data.lastX;
        let currentY = event.touches[0].pageY
        let ty = currentY - this.data.lastY
            // this.setData({
            //     'module.render.godBall.position.top':this.data.startTop+ty*2
            // })
            //左右方向滑动
        if (Math.abs(tx) > Math.abs(ty)) {
            if (tx < 0) {
                // console.log("向左滑动");
                this.data.currentGesture = 1
            } else if (tx > 0) {
                // console.log("向右滑动");
                this.data.currentGesture = 2
            }

        }
        //上下方向滑动
        else {
            if (ty < 0) {
                // console.log("向上滑动");
                this.data.currentGesture = 3

            } else if (ty > 0) {
                // console.log("向下滑动");
                this.data.currentGesture = 4
            }
        }
    },

    gbTouchStart: function(event) {
        this.data.lastX = event.touches[0].pageX
        this.data.lastY = event.touches[0].pageY
        this.data.startTop = this.data.module.render.godBall.position.top || 100;
    },
    gbTouchEnd: function(event) {
        this.data.currentGesture = 0
            //将当前坐标进行保存以进行下一次计算
            // this.data.lastX = currentX
            // this.data.lastY = currentY
    }
}
module.exports = all;
