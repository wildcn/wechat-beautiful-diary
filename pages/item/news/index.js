var root_path = "../../../",
    util = require(root_path + 'utils/util.js'),
    api = require(root_path + 'utils/api.js'),
    all = require(root_path + 'utils/all.js'),
    bus = require(root_path + 'utils/bus.js'),
    config = require(root_path + 'utils/config.js'),
    toast = require(root_path + 'utils/webtoast.js');
Page({
    data: util.objInsert({
        news: {
            detail: {}
        }
    }, config), // 载入config
    onLoad: function(option) {
        // 设置初始日期
        this.root_path = root_path;
        this.setData({
            'curData.option.root_path': root_path
        })
        bus.init(this)
        util.objInsert(all, this);
        this.setData({
            date: util.formatDate(+new Date(), {
                format: '{year}-{month}-{day}'

            }),
            'news.detail': wx.getStorageSync('news.detail')
        });
    }
})
