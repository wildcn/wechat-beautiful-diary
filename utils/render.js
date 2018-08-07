var root_path = "./",
    util = require(root_path + 'util.js'),
    handle = require(root_path + 'handle.js'),
    update = require(root_path + 'update.js'),
    bus = require(root_path + 'bus.js');

/*
 ** 加载页面相关
 */
let render = {};
// 私信详情页
render.chatDetail = ({
    index
}) => {
    let data = wx.getStorageSync('itemChatDetail'),
        myId = wx.getStorageSync('myId'),
        first = data[0],
        flag = +first.sendId == +myId,
        newsChatDetail = {
            list: data,
            chatTargetName: flag ? first.receiveName : first.sendName,
            chatTargetId: flag ? first.receiveId : first.sendId,
            chatTargetIndex: index,
        };
    for (let i = 0; i < data.length; i++) {
        if (data[i].status == 0 || i == (data.length - 1)) {
            newsChatDetail.scrollId = `r${data[i].id}`;
        }
    }
    bus.getCurrentPage().setData({
        'news.chatDetail': newsChatDetail,
    });

    // 设置已读
    let ids = '';
    for (let i of data) {
        if (i.status == 0) {
            ids += ',' + i.id;
        }
    }
    ids && bus.chatDetailBrow({
        ids: ids
    });

};
// 万能球显示详细信息
render.showGodBall = () => {
    let cp = bus.getCurrentPage();
    let active = cp.data.module.render.godBall.active,
        type = cp.data.module.render.godBall.type;
    // 小提示
    if (type == 'ask') {
        let tips = wx.getStorageSync('options.bd_tips'),
            content = tips[util.getRandomNum(tips.length)].content;
        cp.setData({
            'module.render.godBall.info.content': content
        })
    }
    if (!active && !cp.godBallCountDown) {
        setTimeout(() => {
            cp.setData({
                'module.render.godBall.active': ''
            })
            cp.godBallCountDown = false;
        }, 2000)
    }
    cp.godBallCountDown = true;
    cp.setData({
        'module.render.godBall.active': !active ? 'gb-active' : ''
    });
};
// 日记详情页
render.dirayDetail = ({
    date,
    id
}) => {
    util.go(root_path + '/pages/item/square/index?id=' + id + '&date=' + date);
};
// 加载心情广场
render.publicDiary = () => {
    let data = wx.getStorageSync('column.square');
    data = handle.initPublicDiary({
        data: data
    });
    console.log(data);
    bus.getCurrentPage().setData({
        'column.square': data
    })
};
// 用户信息数据
render.userEmail = () => {
    let cp = bus.getCurrentPage();
    let data = wx.getStorageSync('column.userEmail');
    if (!data) {
        cp.getUserEmail(() => {
            render.userEmail();
        });
    }
    if (data.init) {
        data = update.publicDiaryList({
            data: data
        });
    } else {
        // 处理数据
        data = handle.initUserEmail(data);
    }

    wx.setStorageSync('column.userEmail', data);
    cp.setData({
        'column.userEmail': data
    })
};
module.exports = render;
