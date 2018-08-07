var root_path = "../../../",
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    all = require(root_path + 'utils/all.js'),
    bus = require(root_path + 'utils/bus.js'),
    config = require(root_path + 'utils/config.js'),
    calendar = require(root_path + 'utils/calendar.js');
Page({
    data: config,
    onLoad: function(options) {
        // 生命周期函数--监听页面加载
        bus.init(this)
        this.root_path = root_path;
        util.objInsert(all, this);
        this.calendar(); // 渲染日历
        wx.setNavigationBarTitle({
            title: '美日历'
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
        wx.removeStorageSync('calendar.userMonthData');
        this.initDiaryByMonth();
    },
    onReachBottom: function() {
        // 页面上拉触底事件的处理函数
    },
    calendar: function(ts = +new Date()) {
        // 渲染日历数据
        var now = calendar.showCalendar(ts);
        // 根据数据返回，加工日历数据
        // console.log(now.rowsDate)
        this.setData({
            'column.calendar': now,
            'column.calendarOptions.sixRowsCalenDar': now.length > 35 ? true : false
        });
        this.initDiaryByMonth();
    },
    initDiaryByMonth: function() {
        // 初始化该日历下用户日记、心情等数据
        var me = this,
            data = me.data.column.calendar.rowsDate;
        let start = +new Date(data[0].day[0].time) / 1000,
            end = +new Date(data[data.length - 1].day[data[data.length - 1].day.length - 1].time) / 1000;
        let param = {
            sessionId: wx.getStorageSync('sessionId'),
            start: start,
            end: end
        }
        var userLocal = wx.getStorageSync('calendar.userMonthData');
        // 有本地缓存 && 是当月 && 是当天
        if (userLocal && userLocal.param.start == param.start && userLocal.today == me.data.today.date) {
            me.renderUserWidthMonth(userLocal);
        } else {
            if (!param.sessionId) {
                setTimeout(() => {
                    console.log('未获取sessionId 100ms后重新执行')
                    this.initDiaryByMonth();
                }, 100)
            }
            bus.getUserCalendar(param, function(data) {
                if (data.data.errno == 0) {
                    // 存入缓存
                    data.data.param = param;
                    data.data.today = me.data.today.date;
                    wx.setStorage({
                        key: 'calendar.userMonthData',
                        data: data.data
                    })
                    me.renderUserWidthMonth(data.data);
                } else if (data.data.errno == 12) {
                    setTimeout(() => {
                        console.log('cache未缓存 100ms后重新执行')
                        me.initDiaryByMonth();
                    }, 100)
                }
            });
        }
    },
    renderUserWidthMonth: function(data) {
        var me = this;
        me.initCurMonthData(data);
        let calnedarData = me.data.column.calendar.rowsDate;
        let i, len = calnedarData.length,
            diary = data.diary,
            mood = data.mood,
            anniversary = data.anniversary;
        for (i = 0; i < len; i++) {
            let rows = calnedarData[i],
                day = rows.day,
                j, length = day.length;
            for (j = 0; j < length; j++) {
                let one = day[j],
                    x, y,z, diaryLenght = diary.length,
                    moodLength = mood.length,anniLength = anniversary.length;;
                // 循环日历数据
                for (x = 0; x < diaryLenght; x++) {
                    var time = util.formatDate(diary[x].date, {
                        format: '{year,4}-{month,2,0}-{day,2,0}'
                    })
                    if (time == one.time) {
                        // 日期有日历数据
                        one.iconArr = one.iconArr || [];
                        one.iconArr.push('diary');
                    }
                }
                // 循环心情数据
                for (y = 0; y < moodLength; y++) {

                    var time = util.formatDate(mood[y].date, {
                        format: '{year,4}-{month,2,0}-{day,2,0}'
                    })

                    if (time == one.time) {
                        // 日期有心情数据
                        // console.log(mood[y])
                        one.iconArr = one.iconArr || [];
                        one.iconArr.push(mood[y].type);

                    }
                }
                // 循环纪念日数据
                for (z = 0; z < anniLength; z++) {

                    var time = util.formatDate(anniversary[z].date, {
                        format: '{year,4}-{month,2,0}-{day,2,0}'
                    })

                    if (time == one.time) {
                        // 日期有心情数据
                        // console.log(anniversary[z])
                        one.iconArr = one.iconArr || [];
                        one.iconArr.push('remember');

                    }
                }
                // 去重
                one.iconArr = [...new Set(one.iconArr)];
            }
        };
        this.setData({
            'column.calendar.rowsDate': calnedarData
        })

    },
    initCurMonthData: function(data) {
        let diary = data.diary,
            mood = data.mood,
            anniversary = data.anniversary,
            final = {};
        for (let i of diary) {
            i.date = util.formatDate(i.date, {
                format: '{year,4}-{month,2,0}-{day,2,0}'
            });
            i.type = 'diary';
            i.bgc = 1;
            i.stitle = i.title;
            if (!final[i.date]) {
                final[i.date] = {};
            }
            final[i.date].diary = i;
        }
        for (let j of mood) {
            j.date = util.formatDate(j.date, {
                format: '{year,4}-{month,2,0}-{day,2,0}'
            });
            j.bgc = 3;
            j.stitle = '当日心情:'+j.name
            if (!final[j.date]) {
                final[j.date] = {};
            }
            final[j.date].mood = j;
        }
        for (let k of anniversary) {
            k.date = util.formatDate(k.date, {
                format: '{year,4}-{month,2,0}-{day,2,0}'
            });
            k.bgc = 2;
            k.type = 'remember';
            k.stitle = '纪念:'+k.title
            k.content = `距离今日已过${Math.floor((+new Date() - +new Date(k.date))/(1000*60*60*24))}天`;
            if (!final[k.date]) {
                final[k.date] = {};
            }
            final[k.date].anniversary = k;
        }
        this.setData({
            'column.calendar.curMonthData': final
        })
    },
    dayClick: function(e) {
        let date = e.currentTarget.dataset.date,
            list = this.data.column.calendar.curMonthData,
            todayList = [];
        if (list[date]) {
            this.setData({
                'column.calendar.todayList': list[date]
            })
        }
    },
    btnCalendar: function(e) {
        var me = this;
        var type = e.target.dataset.type,
            typeName = type + 'Switch',
            typeAllowName = type + 'BtnAllow',
            typeSwitch = me.data[typeName];
        // 改变点击菜单状态
        if (me.data[typeAllowName]) {
            // 改变点击状态
            typeSwitch = /un/.test(typeSwitch) ? 'select' : 'unselect';
            var o = {};
            o[typeName] = typeSwitch;
            me.setData(o)
        } else {
            // 禁止点击
            var o = {};
            o[typeName] = 'noselect';
            me.setData(o)
        }
        // console.log(me.data)
        switch (type) {
            case "mood":
                me.loadMood();
                break;
            case "vacation":
                me.loadVacation();
                break;
            case "diary":
                me.loadDiary();
                break;
        }
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
    goToToday: function() {
        var yearAndMonth = this.data.today.select.date.replace(/-\d+$/, ''),
            now = +new Date(),
            nowTime = util.formatDate(now, {
                format: '{year}-{month}'
            });
        if (nowTime == yearAndMonth) {
            console.log('已经是当月数据');
            return;
        }
        this.calendar(now);
    },
    dateChange: function(data) {

        var ts = +new Date(data);
        var now = calendar.showCalendar(ts);
        // console.log(now.rowsDate[0].day[0].time)
        this.calendar(ts)
    }
})
