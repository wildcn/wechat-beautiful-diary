var root_path = "../../../",
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
        var me = this;
        // 生命周期函数--监听页面加载
        // 将定义的公共方法导入
        this.root_path = root_path;
        util.objInsert(all, this);
        this.setData({
            'today.endDate':'2100-1-1'
        })
        wx.setNavigationBarTitle({
            title: '美日纪念'
        })
        this.sessionId = wx.getStorageSync('sessionId');
        // 加载首页
        this.toast = new toast();


        bus.init(this)
        this.getList();
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
    },
    onShareAppMessage: function() {
        // 用户点击右上角分享
        return {
            title: 'title', // 分享标题
            desc: 'desc', // 分享描述
            path: 'path' // 分享路径
        }
    },
    getList: function() {
        // 生成日期
        var me = this;

        if (!wx.getStorageSync('sessionId')) {

            setTimeout(() => {
                console.log('重新拉取纪念列表')
                me.getList();
            }, 100);
        } else {
            console.log(wx.getStorageSync('sessionId'))
            wx.request({
                url: api.getAnniversaryList,
                data: {
                    sessionId: wx.getStorageSync('sessionId')
                },
                success: function(data) {
                    console.log(data)
                    if (data.data.errno == 0) {
                        me.renderList(data.data.data)
                    } else if (data.data.errno == 1) {
                        me.toast.toast({
                            title: '快点添加纪念日吧',
                            duration: 1000
                        })
                    } else if (data.data.errno == 12) {

                        setTimeout(() => {
                            console.log('重新拉取纪念列表')
                            me.getList();
                        }, 100);
                    }
                }
            })
        }


    },
    renderList: function(list) {
        var me = this;
        me.listData = list;
        for (let i of list) {
            i.lastDay = Math.floor((+new Date() - +new Date(i.date) * 1000) / (1000 * 60 * 60 * 24));
            i.up =i.lastDay > 0?'history':'countdown';
            i.lastDay = Math.abs(i.lastDay);
            i.iconType = /undefined/.test(i.iconType) ? 'clock' : i.iconType;
            i.cdate = util.formatDate(i.date, {
                format: '{year}-{month}-{day}'
            })
        }
        let tmpl = util.cloneArray(list);
        me.renderFirst(tmpl[0]);
        tmpl.shift();
        me.setData({
            'column.anniversary': list
        })
    },
    renderFirst: function(data) {
        console.log(data)
        this.setData({
            'column.anniversaryFirst': data
        })
    },
    addAnniversary: function() {
        var me = this,
            data = me.data.editor.anniversary;
        if (!data || !data.title) {
            me.toast.toast({
                title: '请填写纪念事项',
                duration: 1000
            });
            return;
        }
        let param = {
            date: me.data.today.select.date,
            title: data.title,
            iconType: data.iconType,
            sessionId: wx.getStorageSync('sessionId'),
        }
        wx.request({
            url: api.postAnniversary,
            data: param,

            success: function(data) {
                if (data.data.errno == 0) {
                    me.toast.toast({
                        title: '添加成功',
                        duration: 1000
                    });
                    me.listData = me.listData || [];
                    param.date = +new Date(param.date)/1000;
                    me.listData.unshift(param);
                    me.renderList(me.listData);
                    me.setData({
                        'editor.anniversary.title': '',
                    })
                } else if (data.data.errno == 12) {
                    setTimeout(() => {
                        me.addAnniversary();
                    }, 100)
                }
            },
            fail: function(data) {
                console.log(data)
            }
        })
    },
    bindinput: function(e) {
        var me = this,
            value = e.detail.value;
        this.setData({
            'editor.anniversary.title': value
        })
    },
    dateChange: function(date) {
        this.setData({
            'editor.anniversary.date': date
        })
    },
    iconSelect: function(e) {
        var me = this;
        var index = e.currentTarget.dataset.index,
            type = e.currentTarget.dataset.type,
            data = this.data.column.anniversaryIconList,
            length = data.length,
            i;
        for (i = 0; i < length; i++) {
            if (i == index) {
                data[i].class = "select";
                data[i].name = data[i].title;
                me.setData({
                    'editor.anniversary.iconType': data[i].type
                })
            } else {
                data[i].class = "";
                data[i].name = "";
            }
        }
        this.setData({
            'column.anniversaryIconList': data,
            'column.anniversaryIconSelect': type,

        })
        wx.getStorage({
            key: 'column.anniversaryIconList',
            data: data
        })
        setTimeout(() => {
            me.setData({
                'module.iconList': false
            })
        }, 1000)
    },
    addIcon: function() {
        // 加载图标
        var me = this;
        this.setData({
            'module.iconList': true
        })
        wx.getStorage({
            key: 'column.anniversaryIconList',
            success: function(data) {
                console.log('从缓存中读取iconlist')
                me.setData({
                    'column.anniversaryIconList': data.data
                })
            },
            fail: function() {
                console.log('iconlist缓存读取失败')
                wx.request({
                    url: api.getIconList,
                    success: function(data) {
                        if (data.data.errno == 0) {
                            var list = data.data.list;
                            for (var i = 0; i < list.length; i++) {
                                list[i].class = "";
                                list[i].name = "";
                            }
                            wx.setStorage({
                                key: "column.anniversaryIconList",
                                data: list
                            })
                            me.setData({
                                'column.anniversaryIconList': list
                            })
                        }
                    }
                })
            }
        })
    }
})
