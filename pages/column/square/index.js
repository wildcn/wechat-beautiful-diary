var root_path = "../../../",
    page_path = 'pages/column/discover/index',
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    config = require(root_path + 'utils/config.js'),
    toast = require(root_path + 'utils/webtoast.js'),
    all = require(root_path + 'utils/all.js'),
    login = require(root_path + 'utils/login.js'),
    bus = require(root_path + 'utils/bus.js'),
    cpu = require(root_path + 'utils/cpu.js'),
    calendar = require(root_path + 'utils/calendar.js');
var app = getApp();
Page({
    data: config, // 载入config
    onLoad: function(options) {
        var that = this;
        // 将定义的公共方法导入
        this.root_path = root_path;
        this.page_path = page_path;
        this.setData({
            'curData.option.root_path': root_path,
        });
        this.toast = new toast();
        wx.setNavigationBarTitle({
            title: '心情广场'
        })
        util.objInsert(all, this);
        this.renderSquareList();
        bus.init();
    },
    onShareAppMessage: function() {
        // 用户点击右上角分享
        return {
            title: '心情广场', // 分享标题
            desc: '记录美美的心情', // 分享描述
            path: '/pages/home/index' // 分享路径
        }
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
    // onPullDownRefresh: function() {
    //     // 页面相关事件处理函数--监听用户下拉动作
    // },
    onReachBottom: function() {
        // 页面上拉触底事件的处理函数
    },
    renderSquareList: function() {
        bus.getPublicDiary((res) => {
            cpu.render_publicDiary();
        })
    },
    // 打开广场详情页
    csiClick: function(e) {
        cpu.render_dirayDetail({
            date: e.currentTarget.dataset.date,
            id: e.currentTarget.dataset.id,
        })
    },

})
