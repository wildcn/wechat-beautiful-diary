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

        bus.init();
        this.initSquareDetail(options);
    },
    onShareAppMessage: function() {
        // 用户点击右上角分享
        return {
            title: '美日美历', // 分享标题
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
    initSquareDetail:function ({date,id}) {
        if (!date) {
            return;
        }
        if (typeof(date) === 'number') {
            date = util.formatDate(date);
        }
        let columnSquareItemList = wx.getStorageSync('columnSquareItemList');
        if (columnSquareItemList && columnSquareItemList[date]) {
            let detail = columnSquareItemList[date];
            this.setData({
                'news.square': bus.initDiaryDetail(detail)
            })
            cpu.monitor_diaryBrow(detail.id);
            return;
        }
        wx.request({
            url: api.getMyDiary,
            data: {
                sessionId: this.sessionId || wx.getStorageSync('sessionId'),
                id: id
            },
            success: (res) => {
                if (res.statusCode == 200 && res.data.errno == 0) {
                    let detail = res.data.data;
                    detail = cpu.handle_initPublicDiary({
                        data: detail
                    });
                    cpu.monitor_diaryBrow(detail.id);
                    this.setData({
                        'news.square': bus.initDiaryDetail(detail)
                    })
                }
            }
        })

    },
    renderSquareDetail: function(detail) {
        // 处理评论
        if (detail.commentsNum) {
            for (let i of detail.comments) {
                i.time = util.formatDate(i.date, {
                    format: "{month}-{day} {hour}:{min}"
                });
                if (util.isArray(i.content)) {
                    i.formatContent = i.content;
                } else {
                    i.formatContent = bus.formatTextArea(i.content);
                }

            }

        }
        detail.comments.sort(function(a, b) {
            return b.date - a.date;
        })
        this.setData({
            'news.square': detail
        })
    },

})
