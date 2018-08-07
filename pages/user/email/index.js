var root_path = "../../../",
    page_path = 'pages/user/email/index',
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    config = require(root_path + 'utils/config.js'),
    all = require(root_path + 'utils/all.js'),
    bus = require(root_path + 'utils/bus.js'),
    cpu = require(root_path + 'utils/cpu.js'),
    toast = require(root_path + 'utils/webtoast.js'),
    calendar = require(root_path + 'utils/calendar.js');

var app = getApp();

// 为config注入属性

Page({
    data: config, // 载入config
    onLoad: function(options) {
        var that = this;
        // 生命周期函数--监听页面加载
        // 将定义的公共方法导入
        this.root_path = root_path;
        this.page_path = page_path;
        config = util.objInsert(this.data, config);
        // this.setData(config);
        this.setData({
            'curData.option.root_path': root_path,
            'column.userEmail.commentsMessage.list': [],
            'column.userEmail.commentsMessage.name': '',
        })
        wx.setNavigationBarTitle({
            title: '美日信箱'
        })
        this.toast = new toast();
        bus.init(this)
        util.objInsert(all, this);
        // 加载首页
        cpu.render_userEmail();
    },
    onReady: function() {
        var that = this;
        setTimeout(function() {
            that.setData({
                hid: true
            });
        }, 200);

    },
    onShow: function() {
        var that = this;
        setTimeout(function() {
            that.setData({
                dis: "display_none"
            });
        }, 150);
    },
    onHide: function() {
        // 生命周期函数--监听页面隐藏
    },
    onUnload: function() {
        // 生命周期函数--监听页面卸载
    },
    onPullDownRefresh: function() {
        // 页面相关事件处理函数--监听用户下拉动作
    },
    onReachBottom: function() {
        // 页面上拉触底事件的处理函数
    },
    renderMessage: function() {
        let message = wx.getStorageSync('column.userEmail');
        let userRawData = wx.getStorageSync('userRawData');
        this.setData({
            'column.userEmail': message,
            'curData.userRawData': userRawData
        });

    },
    emailBarClick: function(e) {
        let me = this,
            type = e.currentTarget.dataset.type,
            list = me.data.column.userEmail;
        for (var i in list) {
            if (list[i].show) {
                list[i].show = false;
            }
        }
        list[type + "Message"].show = !list[type + "Message"].show;
        me.setData({
            'column.userEmail': list
        })
    },
    userEmailClick: function(e) {
        let index = e.currentTarget.dataset.index,
            mtype = e.currentTarget.dataset.type,
            id = e.currentTarget.dataset.id,
            data = this.data.column.userEmail;
        let curList = data[`${mtype}Message`].list[index];
        curList.showContent = !curList.showContent;
        if (curList.status == 0) {
            // 首次阅读
            curList.status = 1;
            bus.signEmail({
                type: mtype,
                id: id,
                sessionId: wx.getStorageSync('sessionId')
            }, function(res) {
                console.log(res.data)
            });
            data.newNum--;
        }
        // 设置首页阅读数
        var curPage = getCurrentPages();
        curPage[0].setData({
            'module.iconNav.email.newNum': data.newNum
        })
        this.setData({
            'column.userEmail': data
        })
    },
    privateMessageClick: function(e) {
        let index = e.currentTarget.dataset.index,
            list = this.data.column.userEmail.privateMessage.list[index];
        console.info('index : '+index)
        wx.setStorageSync('itemChatDetail', list);
        wx.navigateTo({
            url: '/pages/item/chat/index?index='+index
        })

    }
});
