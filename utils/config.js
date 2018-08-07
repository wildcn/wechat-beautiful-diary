/*
 ** 提供基础的js数据结构
 */
var util = require('./util.js'),
    bus = require('./bus.js'),
    date = util.formatDate(+new Date(), {
        format: '{year}-{month}-{day}'
    }),
    month = util.formatDate(+new Date(), {
        format: '{year}-{month}'
    });

var config = {
    weekName: [{
        name: '一',
        class: 'monday'
    }, {
        name: '二',
        class: 'tuesday'
    }, {
        name: '三',
        class: 'Wednesday'
    }, {
        name: '四',
        class: 'Thursday'
    }, {
        name: '五',
        class: 'Friday'
    }, {
        name: '六',
        class: 'Saturday'
    }, {
        name: '日',
        class: 'Sunday'
    }],
    today: {
        date: date,
        yearAndMonth: month,
        select: {
            date: date
        }
    },

    bgImg: {
        diary: [
            'http://p4.qhimg.com/t017deae4ec624dbd95.jpg'
        ]
    },
    default: {
        userIcon: {
            man: 'http://p8.qhimg.com/t01a8aa8b9ee8b979c2.jpg',
            women: 'http://p9.qhimg.com/t01920ee5937a769cd8.jpg'
        }
    },
    column: {
        diary: {},
        mood: {},
    },

    // 模块加载
    module: {
        render: {
            commonToday: false,
            commonTodayDiary: false,
            commonTodayMood: false,
            loading: true,
            homeWeatherArea:false,
            versionTips: {
                duration: 1000,
                autoplay: false,
                interval: false,
                indicatorDots: true,
                show: true
            },
            godBall:{
                position:{
                    top:0,
                    right:-30
                },
                type:'ask',
                info:{
                    avatarUrl:'',
                    content:'这里是神奇的万能球~'

                }
            }
        },
        // 临时输入页面初始化内容 css util.css
        tempInput:{
            title:'请输入您的内容',
            placeholder:'写点什么吧~',
            bindinput:'tempInputChange',
            placeholderClass:'textarea-placeholder',
            maxlength:-1,
            show:false,
        }

    },

};
// 拿用户数据
var userRawData = wx.getStorageSync('userRawData');

// 看是否需要显示版本提示
var versionTips = wx.getStorageSync('module.versionTips');
if (versionTips) {
    config.module.render.versionTips.show = false;
}

bus.getSystemInfo(function(data) {
    config = util.objInsert({
        system: data
    }, config);
})
module.exports = config;
