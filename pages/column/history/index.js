var root_path = "../../../",
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    all = require(root_path + 'utils/all.js'),
    config = require(root_path + 'utils/config.js'),
    calendar = require(root_path + 'utils/calendar.js');
Page({
    data: config,
    onLoad: function(options) {
        // 生命周期函数--监听页面加载
        this.setData(config); // 加载默认config配置
        // 将定义的公共方法导入
        this.root_path = root_path;
        util.objInsert(all, this);
        wx.setNavigationBarTitle({
            title: '美日历史'
        })
        this.todayHistory();

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
    onShareAppMessage: function() {
        // 用户点击右上角分享
        return {
            title: 'title', // 分享标题
            desc: 'desc', // 分享描述
            path: 'path' // 分享路径
        }
    },

    todayHistory: function(date) {
        // 渲染历史上的今天
        var me = this;
        var his = api.history,
            date = date || me.data.today.select.date,
            matchDate = date.match(/(\d+)-(\d+)-(\d+)/),
            param = {
                month: matchDate[2],
                day: matchDate[3]
            };
        var storage = wx.getStorageSync('column.history')
        if (storage && storage[date]) {
            console.log('使用缓存')
            var paramData = {
                todayHistory: storage[date].todayHistory,
                todayHistoryDate: param.month + '-' + param.day,
                todayAllHistory: storage[date].todayAllHistory,
                showAllHistory:true
            };
            me.setData({
                'column.history': paramData
            });
        } else {
            
            wx.request({
                url: his,
                data: param,
                success: function(data) {

                    if (data.data.error_code == 0) {
                        console.log('重新抓取历史上的今天')
                        var s = data.data.result;
                        s.sort(function(a, b) {
                            return b.year - a.year;
                        })
                        var x = s.concat();
                        x.length = 3;
                        var storage = wx.getStorageSync('column.history');
                        var paramData = {};
                        paramData[date] = {
                            todayHistory: x,
                            todayHistoryDate: param.month + '-' + param.day,
                            todayAllHistory: s,
                            showAllHistory:true
                        };
                        if (storage) {
                            paramData = util.objInsert(paramData, storage);
                        }
                        wx.setStorage({
                            key: 'column.history',
                            data: paramData
                        });
                        me.setData({
                            'column.history':paramData[date]
                        })
                    }
                },
                fail: function(e) {
                    console.log(e)
                    wx.showToast({
                        title: '请重试/(ㄒoㄒ)/~~'
                    });
                    setTimeout(function() {
                        wx.hideToast();
                    }, 1500)
                }
            })
        }
    },
    dateChange:function(date){
        this.todayHistory(date);
    },
    showAllHistory: function() {
        // 显示全部历史上的今天
        this.setData({
            'column.history.todayHistory': this.data.column.history.todayAllHistory,
            'column.history.showAllHistory':false
        })
    },

})
