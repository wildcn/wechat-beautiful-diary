var root_path = "../../../",
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    config = require(root_path + 'utils/config.js'),
    bus = require(root_path + 'utils/bus.js'),
    all = require(root_path + 'utils/all.js'),
    QQMapWX = require(root_path + 'public/js/libs/qqmap-wx-jssdk.min.js'),
    toast = require(root_path + 'utils/webtoast.js'),
    calendar = require(root_path + 'utils/calendar.js');
Page({
    data: config, // 载入config
    onLoad: function(options) {
        // 设置初始日期
        this.setData({ 
            date: util.formatDate(+new Date(), {
                format: '{year}-{month}-{day}'
            }),
        });

        this.root_path = root_path;
        this.setData({
            'curData.option.root_path': root_path
        })
        wx.setNavigationBarTitle({
            title: '写日记'
        })
        if (options.date && wx.getStorageSync('columnListDiary')[util.formatDate(options.date, {
                format: '{year}-{month}-{day}'
            })]) {
            this.initDiaryData(util.formatDate(options.date, {
                format: '{year}-{month}-{day}'
            }), wx.getStorageSync('columnListDiary')[util.formatDate(options.date, {
                format: '{year}-{month}-{day}'
            })]);
        } else {
            this.initDiaryData();
        }
        util.objInsert(all, this);

        bus.init(this)
        this.toast = new toast();
    },

    initDiaryData: function(curTime = this.data.today.date, diaryData) {
        // 获取地理位置var me = this
        var me = this;
        this.setData({
            'today.select.date': curTime
        })
        if (diaryData) {
            me.setData({
                'editor.diary': diaryData
            });
            return;
        }
        var curData = wx.getStorageSync('curData');
        if (curData) {
            var editorDiary = me.data.editor.diary || {};
            editorDiary = util.objInsert({
                    city: curData.location.name,
                    country: curData.location.country,
                    path: curData.location.path,
                    weather: curData.weather.text,
                    public:0,
                    sessionId: wx.getStorageSync('sessionId'),
                    date: curTime,
                    // title: editorDiary.title || curTime + ' ' + curData.location.name + ' ' + curData.weather.text,
                    title: editorDiary.title || curTime + ' ' + curData.location.name + ' ' + curData.weather.text,

                }, editorDiary)
                // console.log(editorDiary)
            me.setData({
                curData: curData,
                'editor.diary': editorDiary
            });
        }
    },
    contentChange: function(res) {
        var num = res.detail.value.length;
        this.setData({
            'editor.diary.contentNumCount': num,
            'editor.diary.content': res.detail.value
        })
    },
    titleChange: function(res) {
        // this.setData({
        //     'editor.diary.title': res.detail.value
        // })
    },
    savediary: function() {
        // 保存日记
        var me = this,
            data = this.data,
            diaryData = data.editor.diary;
        if (!diaryData.content) {
            me.toast.toast({
                title: '请填写正文',
                duration: 1000
            });
            return;
        }
        diaryData.diaryShortContent = diaryData.content.substr(0, 18) + '…';
        diaryData.mood = data.editor.mood ? data.editor.mood.curType : '';
        diaryData.saveTime = util.formatDate(+new Date(), {
            format: '{month}-{day} {hour}:{min}'
        });
        diaryData.sessionId = wx.getStorageSync('sessionId');
        wx.setStorage({
            key: 'editor.diary',
            data: diaryData
        })
        diaryData.date = Math.floor(+new Date(me.data.today.select.date)/1000);
        wx.request({
            url: api.pushdiary,
            data: diaryData,
            success: function(res) {
                if (res.data.errno == 0) {
                    // 保存成功;
                    var columnListDiary = wx.getStorageSync('columnListDiary') || {};
                    columnListDiary[diaryData.date] = diaryData;

                    wx.setStorage({
                        key: 'columnListDiary',
                        data: columnListDiary
                    })
                    me.toast.toast({
                            title: '保存成功',
                            duration: 500
                        })
                        // 向首页传递数据
                    var pages = getCurrentPages(),
                        len = pages.length,
                        currentPage = pages[len - 1],
                        homePage = pages[0];

                    if (diaryData.date == data.today.date) {
                        homePage.setData({
                            'module.todayDone.diaryData': diaryData,
                            'module.render.commonToday': true,
                            'module.render.commonTodayDiary': true,
                        })
                    }
                    setTimeout(() => {
                        // 返回上一页
                        wx.navigateBack({
                            delta: 1,
                            url: '?diary=done'
                        });
                    }, 400)
                }
            }
        })
    },
    statusChange:function(e){
        let status = e.currentTarget.dataset.public;
        this.setData({
            'editor.diary.public':status
        })
    },
    dateChange: function(curTime) {
        var me = this;
        bus.getMyDiary(curTime, function(data) {
            if (data.data.errno == 0) {
                var diary = util.objInsert(data.data.data, me.data.editor.diary);
                me.setData({
                    'editor.diary': diary
                })
            } else {
                me.initDiaryData(curTime);
            }
        })
    }
})
