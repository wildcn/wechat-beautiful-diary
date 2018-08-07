var root_path = "../../../",
    page_path = 'pages/column/discover/index',
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    config = require(root_path + 'utils/config.js'),
    toast = require(root_path + 'utils/webtoast.js'),
    all = require(root_path + 'utils/all.js'),
    login = require(root_path + 'utils/login.js'),
    bus = require(root_path + 'utils/bus.js'),
    calendar = require(root_path + 'utils/calendar.js');
var app = getApp();
Page({
    data: config, // 载入config
    onLoad: function(options) {
        var me = this;
        // 将定义的公共方法导入
        this.root_path = root_path;
        this.page_path = page_path;
        this.setData({
            'curData.option.root_path': root_path,

        })
        wx.setNavigationBarTitle({
            title: '美日发现'
        })
        util.objInsert(all, this);
        // 生命周期函数--监听页面加载
        // 加载首页
        var list = wx.getStorageSync('itemNews');
        if (list) {
            this.renderDiscover(list);
        } else {
            bus.getNewsList(function(data) {
                me.renderDiscover(data);
            })
        }
        bus.init();
    },
    onReady: function() {
        var me = this;
        setTimeout(function() {
            me.setData({
                hid: true
            });
        }, 200);


    },
    onShow: function() {
        var me = this;
        setTimeout(function() {
            me.setData({
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
        let me = this;
        bus.getNewsList(function(data) {
            me.renderDiscover(data);
        })

    },
    renderDiscover: function(list) {
        if (!list) {
            return;
        }
        if(util.isArray(list)){
            list = bus.formatNewsList(list).all;
        }
        let itemNews = wx.getStorageSync('itemNews') || {};
        itemNews = util.objInsert(list,itemNews);
        wx.setStorageSync('itemNews',itemNews);
        var listArray = [];
        for (let i in list) {
            i !== 'date' && listArray.push(i);
        }
        listArray.sort(function(a, b) {
            return b - a;
        })
        let tpml = this.data.column.discover && this.data.column.discover.itemNews || [];
        for (var j = 0; j < listArray.length; j++) {
            tpml.push(list[listArray[j]])
        }

        this.setData({
            'column.discover.itemNews': tpml
        })
    },

})
