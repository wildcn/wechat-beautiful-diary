var root_path = "../../../",
    page_path = 'pages/user/list/index',
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    config = require(root_path + 'utils/config.js'),
    all = require(root_path + 'utils/all.js'),
    bus = require(root_path + 'utils/bus.js'),
    toast = require(root_path + 'utils/webtoast.js'),
    calendar = require(root_path + 'utils/calendar.js');
var app = getApp();

// 为config注入属性
Page({
    data: util.objInsert({
        curData: {
            option: {
                root_path: root_path
            }
        }
    }, config), // 载入config
    onLoad: function(options) {
        var that = this;
        // 生命周期函数--监听页面加载
        // 将定义的公共方法导入
        this.root_path = root_path;
        this.page_path = page_path;
        this.setData({
            'curData.option.root_path': root_path,
        })
        wx.setNavigationBarTitle({
            title: '设置'
        })
        this.toast = new toast();
        bus.init(this)
        util.objInsert(all, this);
        // 加载首页
        this.renderUser();
        bus.renderUserAll();
        this.getUserEmail();
        

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
    openVersionTips: function() {
        // 打开版本提示 回首页
        wx.setStorageSync('versionTips', false);
        wx.switchTab({
            url: '/pages/home/index',
        })
    },
    renderUser: function() {
        var userData = wx.getStorageSync("userRawData");
        this.setData({
            'curData.userData': userData
        })
    },


});
