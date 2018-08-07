var root_path = "../../../",
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    all = require(root_path + 'utils/all.js'),
    config = require(root_path + 'utils/config.js'),
    bus = require(root_path + 'utils/bus.js'),
    QQMapWX = require(root_path + 'public/js/libs/qqmap-wx-jssdk.min.js'),
    toast = require(root_path + 'utils/webtoast.js'),
    calendar = require(root_path + 'utils/calendar.js');
Page({
    data: util.objInsert({
        editor: {
            mood: {
                curType: 'calm',
                curTypeName: "平静",
                curSelect: 'calm',
                basicData: [{
                    name: '喜悦',
                    iconClass: 'smile',
                }, {
                    name: '愤怒',
                    iconClass: 'angry',
                }, {
                    name: '悲伤',
                    iconClass: 'sad',
                }, {
                    name: '忧愁',
                    iconClass: 'worry',
                }, {
                    name: '思念',
                    iconClass: 'miss',
                }, {
                    name: '平静',
                    iconClass: 'calm',
                }, ]

            }
        },
        curData: wx.getStorageSync('curData')
    }, config), // 载入config
    onLoad: function() {
        // 设置初始日期
        this.toast = new toast();
        // 将定义的公共方法导入
        this.root_path = root_path;
        util.objInsert(all, this);
        bus.init(this)
        wx.setNavigationBarTitle({
            title: '写心情'
        })
    },

    moodClick: function(res) {
        var name = res.target.dataset.name,
            type = res.target.dataset.type;
        if (!name) {
            return;
        }
        let data = this.data.editor.mood.basicData;
        for(let i of data){
            i.class = i.iconClass == type?'select':'';
        }
        this.setData({
            'editor.mood.curTypeName': name,
            'editor.mood.curType': type,
            'editor.mood.basicData': data
        })
    },
    bindDateChange: function(e) {
        var curDate = e.detail.value;
        this.setData({
            'today.date': curDate,
            date: curDate,
            'diaryData.date': curDate
        })
    },

    moodSave: function() {
        var me = this;
        var sessionId = wx.getStorageSync('sessionId'),
            param = {
                sessionId: sessionId,
                type: this.data.editor.mood.curType,
                name: this.data.editor.mood.curTypeName,
                date: +new Date(this.data.today.select.date) / 1000,
                saveTime: util.formatDate(+new Date(), {
                    format: '{month}-{day} {hour}:{min}'
                })
            };
        wx.request({
            url: api.pushMood,
            data: param,
            success: function(res) {
                if (res.data.errno == 1) {
                    me.toast.toast({
                            title: '保存成功',
                            duration: 1000
                        })
                        // 向上一级传递数据
                    var pages = getCurrentPages(),
                        len = pages.length,
                        currentPage = pages[len - 1],
                        perPage = pages[0];
                    wx.setStorage({
                        key: 'editor.mood',
                        data: param
                    })
                    perPage && perPage.setData({
                        'module.moodData': param,
                        'today.mood': param,
                        'module.render.commonTodayMood': true,
                    })

                    setTimeout(() => {
                        // 返回上一页
                        wx.navigateBack({
                            delta: 1,
                            url: '?diary=done'
                        });
                    }, 1000)
                }
            }
        })
    }
})
