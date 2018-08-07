var root_path = "../../../",
    page_path = '/pages/column/diary/index',
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    config = require(root_path + 'utils/config.js'),
    toast = require(root_path + 'utils/webtoast.js'),
    login = require(root_path + 'utils/login.js'),
    all = require(root_path + 'utils/all.js'),
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
            title: '美日日记'
        })
        util.objInsert(all, this);
        this.toast = new toast();
        // 加载首页
        bus.init(this)
        this.renderColumn();
        // console.log(options)
        this.setData({
            lastX: 0,
            lastY: 0,
            text: "没有滑动",
            currentGesture: 0,
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
    listTapPublic: function(e) {
        // 公开该日记
        let me = this;
        let date = e.currentTarget.dataset.date,
            pl = e.currentTarget.dataset.public,
            columnList = this.data.column.columnList,
            data = columnList[date];
        console.log(pl)
        data.public = pl == 1 ? 0 : 1;
        bus.saveDiary(data, function(res) {
            data.moveClass = "an-left-hide";
            setTimeout(() => {
                me.setData({
                    'column.columnList': columnList
                })
            }, 300)
        })
    },
    listTapDelete: function(e) {
        // 删除该日记
        let me = this,
            columnList = me.data.column.columnList,
            date = e.currentTarget.dataset.date;
        let param = {
            sessionId: wx.getStorageSync('sessionId'),
            date: date
        }
        wx.request({
            url: api.deleteDiary,
            data: param,
            success: function(data) {
                console.log(data);
                delete columnList[date];
                me.setData({
                    'column.columnList': columnList
                })
                wx.setStorageSync('columnListDiary',columnList);
            }
        })
    },
    moveListLeft: function(e) {
        let date = e.currentTarget.dataset.date
        let columnList = this.data.column.columnList
        columnList[date].moveClass = "an-left-show";
        this.setData({
            'column.columnList': columnList
        })
    },
    moveListRight: function(e) {
        let date = e.currentTarget.dataset.date
        let columnList = this.data.column.columnList
        if (!columnList[date].moveClass) {
            return;
        }
        columnList[date].moveClass = "an-left-hide";
        this.setData({
            'column.columnList': columnList
        })
    },
    handletouchmove: function(event) {
        if (this.data.currentGesture != 0) {
            return
        }
        let currentX = event.touches[0].pageX;
        let tx = currentX - this.data.lastX;
        let currentY = event.touches[0].pageY
        let ty = currentY - this.data.lastY

        //左右方向滑动
        if (Math.abs(tx) > Math.abs(ty)) {
            if (tx < 0) {
                console.log("向左滑动");
                this.data.currentGesture = 1
                this.moveListLeft(event);
            } else if (tx > 0) {
                console.log("向右滑动");
                this.data.currentGesture = 2
                this.moveListRight(event);
            }

        }
        //上下方向滑动
        else {
            if (ty < 0) {
                console.log("向上滑动");
                this.data.currentGesture = 3

            } else if (ty > 0) {
                console.log("向下滑动");
                this.data.currentGesture = 4
            }

        }

        //将当前坐标进行保存以进行下一次计算
        this.data.lastX = currentX
        this.data.lastY = currentY
    },

    handletouchstart: function(event) {
        this.data.lastX = event.touches[0].pageX
        this.data.lastY = event.touches[0].pageY
    },
    handletouchend: function(event) {
        this.data.currentGesture = 0
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
        this.renderColumn();
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
    renderColumn: function() {
        // 生成日期
        console.log('加载日记列表')
        var me = this,
            type = 'Diary';
        bus.getDiaryList({
            type: type
        }, function(list) {
            list = bus.filterDate(list);
            // me.toast.toast({title:'更新日记'+list.length+'条'})
            console.log(list);
            me.setData({
                'column.columnList': list,
                'column.columnData.title': '岁月如金',
                'column.columnData.type': type.toLowerCase()
            })
        });
    },

})
