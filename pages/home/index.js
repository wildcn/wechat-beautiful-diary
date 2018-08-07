var root_path = "../../",
    page_path = 'pages/home/index',
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    config = require(root_path + 'utils/config.js'),
    all = require(root_path + 'utils/all.js'),
    bus = require(root_path + 'utils/bus.js'),
    cpu = require(root_path + 'utils/cpu.js'),
    ws = require(root_path + 'utils/ws.js'),
    toast = require(root_path + 'utils/webtoast.js'),
    calendar = require(root_path + 'utils/calendar.js');
var app = getApp();

// 为config注入属性

Page({
    data: util.objInsert({
        column: {
            home: {
                headImg: 'http://p1.bqimg.com/1949/8dd8ee5f30fdb78e.jpg'
            }
        }
    }, config), // 载入config
    onLoad: function(options) {
        var me = this;
        // 生命周期函数--监听页面加载
        // 将定义的公共方法导入
        this.root_path = root_path;
        this.page_path = page_path;
        this.setData({
            'curData.option.root_path': root_path,
            'curData.option.page_path': page_path,
        })
        // this.renderVersionTips();
        util.objInsert(all, this);
        bus.init(this)
        this.renderHome();
        ws.init();
    },
    onReady: function() {
        var me = this;
        setTimeout(function() {
            me.setData({
                hid: true
            });
        }, 0);
        this.toast = new toast();
        this.renderOneNew();
        // bus.renderUserAll();
        this.renderLocation();
    },
    onShow: function() {
        let me = this;
        setTimeout(() => {
            me.setData({
                'module.render.loading': false
            })
        }, 0)
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
            title: '美日美历', // 分享标题
            desc: '记录美美的心情', // 分享描述
            path: '/pages/home/index' // 分享路径
        }
    },
    renderVersionTips: function() {
        if (wx.getStorageSync('versionTips')) {
            this.setData({
                'module.render.versionTips.show': false
            })
        }
    },
    renderHome: function() {
        // 生成日期
        var me = this;
        this.setData({
            'today.year': util.formatDate(+new Date(), {
                format: '{year}/{month}/{day}'
            }),
            'today.date': util.formatDate(+new Date(), {
                format: '{year}-{month}-{day}'
            })
        });
        // 抓取随机提示
        bus.getOptions({
            name:'bd_tips',
            filter:cpu.handle_initOptionTips
        })
        // 抓取首页背景图片
        let headImgParam = {
            str: 'column.home.headImg',
            api: api.getOptions,
            data: {
                name: 'bd_home_img',
                
            }
        }

        bus.todayStorage(headImgParam, function(data) {
                me.setData({
                    'column.home.headImg': data.option_value
                })
            })
            // 抓取用户信箱
        this.getUserEmail()
            // 抓取首页心情语
        headImgParam.str = 'column.home.headDesc';
        headImgParam.data.name = 'bd_home_desc';

        bus.todayStorage(headImgParam, function(data) {
            me.setData({
                'column.home.headDesc': data.option_value
            })
        })
        this.renderModule('Diary');
        this.renderModule('Mood');
        this.renderEvery();
    },
    renderEvery: function() {
        var every = wx.getStorageSync('news.curData');
        if (!every) {
            return;
        }
        this.setData({
            'news.curData': every
        })
    },
    renderModule: function(type) {
        // 加载模块
        // 取日记数据
        var st = type.toLowerCase(),
            moduleData = wx.getStorageSync('editor.' + st);
        if (moduleData && moduleData.date == this.data.today.date) {
            var key = 'module.' + st + 'Data',
                param = {},
                module = this.data.module.render || {};
            param[key] = moduleData;
            module.commonToday = true;
            module['commonToday' + type] = true;
            this.setData(param);
            this.setData({
                'module.render': module
            });
        };
        // 取心情模块

    },
    renderLocation: function() {
        // 获取地理位置
        var me = this,
            old = wx.getStorageSync('curData'),
            userRawData = wx.getStorageSync('userRawData');
        if (old && old.date == me.data.today.date && userRawData) {
            console.log('天气位置当天已缓存')
            var curData = this.data.curData ? util.objInsert(this.data.curData, wx.getStorageSync('curData')) : wx.getStorageSync('curData');
            if (!curData.userRawData) {
                curData.userRawData = userRawData;
            }
            me.setData({
                curData: curData,
                'module.render.homeWeatherArea': true
            });
            return;
        }
        wx.getLocation({
            type: 'gcj02',
            success: function(res) {
                // 获得天气
                var param = res.latitude + ':' + res.longitude;
                wx.request({
                    url: api.weather,
                    data: {
                        location: param
                    },
                    success: function(data) {
                        if (data.statusCode == 200) {
                            let userRawData = wx.getStorageSync('userRawData');
                            var cityData = data.data.results[0].location,
                                weatherData = data.data.results[0].now;
                            if (weatherData.text) {
                                // 判断天气图标
                                let w = weatherData.text;
                                if (/雨/.test(w) && !/阵/.test(w)) {
                                    weatherData.class = 'rainy';
                                }
                                if (/雷阵雨/.test(w)) {
                                    weatherData.class = 'thunder-storm';
                                }
                                if (/阵雨/.test(w) && !/雷/.test(w)) {
                                    weatherData.class = 'sun-shower';
                                }
                                if (/云|阴|霾/.test(w)) {
                                    weatherData.class = 'cloudy';
                                }
                                if (/雪|冰|霜|雾/.test(w)) {
                                    weatherData.class = 'flurries';
                                }
                                if (/晴/.test(w)) {
                                    weatherData.class = 'sunny';
                                }
                            }
                            var curData = util.objInsert({
                                weather: weatherData,
                                location: util.objInsert(cityData, {
                                    latitude: res.latitude,
                                    longitude: res.longitude
                                }),
                                userRawData: userRawData,
                                date: me.data.today.date,
                                latitude: res.latitude,
                                longitude: res.longitude
                            }, me.data.curData || {})
                            wx.setStorage({
                                key: 'curData',
                                data: curData
                            })
                            me.setData({
                                curData: curData,
                                'module.render.homeWeatherArea': true
                            })
                        } else {
                            console.log('get weather error')
                        }
                    },
                    fail: function(res) {
                        console.log('抓取天气出错：' + res)
                        
                    }
                })
            }
        })
    },
    renderOneNew: function() {
        var me = this;
        wx.request({
            url: api.getOneNew,
            success: function(res) {
                let one = bus.formatOneNew(res.data.data);
                me.setData({
                    'column.home.newArt': one
                })
            }
        })
    },
});
