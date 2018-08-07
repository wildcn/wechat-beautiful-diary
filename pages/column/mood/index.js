var root_path = "../../../",
    page_path = 'pages/column/mood/index',
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    config = require(root_path + 'utils/config.js'),
    toast = require(root_path + 'utils/webtoast.js'),
    login = require(root_path + 'utils/login.js'),
    all = require(root_path + 'utils/all.js'),
    radar = require(root_path + 'utils/radar.js'),
    bus = require(root_path + 'utils/bus.js'),
    calendar = require(root_path + 'utils/calendar.js');
var app = getApp();
Page({
    data: config, // 载入config
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
            title: '美日心情'
        })
        util.objInsert(all, this);
        // 加载首页
        this.renderColumn();
        // 获得用户心情集合
        bus.init();
        this.renderRadar();
        login.check(function() {

        })
    },
    renderRadar: function() {
        // 设置雷达数据
        var me = this;
        wx.request({
            url: api.getUserMood,
            data: {
                sessionId: wx.getStorageSync('sessionId')
            },
            success: function(data) {
                if (data.data.errno == 0) {
                     var array = bus.moodArray(data.data.data) || [0, 0, 0, 0, 0];
                     // console.log(array);
                    var path = {
                            width: me.data.system.windowWidth,
                            height: me.data.system.windowWidth * 2 / 3,
                            edgeLength: 100, // 六边形边长
                            pointRadius: 0, // 小圆的半径
                            data: array, // 雷达数据
                            // themeColor:'155,132,213',
                            themeColor: '208,56,101',
                            name: ['愤怒', '平静', '思念', '悲伤', '喜悦', '忧愁'],
                        }
                        // 加载雷达图
                    radar.init(path);
                }
            }
        })

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
        this.renderRadar();
    },
    onReachBottom: function() {
        // 页面上拉触底事件的处理函数
    },

    renderColumn: function() {
        // 生成心情
        var me = this,
            type = 'Mood';
        bus.getColumnList({
            type: type
        }, function(list) {
            me.setData({
                'column.columnList': list,
                'column.columnData.title': '心灵花园',
                'column.columnData.type': type.toLowerCase()
            })
        });
    },
    loadMood: function() {
        // 加载日期心情
        var me = this;
        var data = me.data.calendar,
            rowsDate = data.rowsDate;

        for (let i of rowsDate) {
            for (let j of i.day) {
                // 渲染心情图标
                var time = j.time;
                // console.log(time)
                j.iconArr.push('icon_smile');
            }
        }

        me.setData({
            calendar: data
        })
    },
    loadDiary: function() {
        // 加载假期
        var me = this;
        var data = me.data.calendar,
            rowsDate = data.rowsDate;

        for (let i of rowsDate) {
            for (let j of i.day) {
                // 渲染心情图标
                var time = j.time;
                // console.log(time)
                j.iconArr.push('icon_diary');
            }
        }

        me.setData({
            calendar: data
        })
    },
    updateCalendarIcon: function() {
        // 更新日期图标
    },
    showAllHistory: function() {
        // 显示全部历史上的今天
        this.setData({
            todayHistory: this.data.todayAllHistory
        })
    }
})
