var root_path = "./",
    util = require(root_path + 'util.js'),
    handle = require(root_path + 'handle.js'),
    bus = require(root_path + 'bus.js'),
    api = require(root_path + 'api.js');

/* update center
 ** 页面数据更新 主要接受长连接推送的数据更新
 */
let pages = getCurrentPages(),
    len = pages.length;
let curPage = pages[len - 1];
let ud = {};
/*
 ** 更新一条用户私信 privateMessage
 ** 接收 column.userEmail
 ** 更新位置 column.userEmail 
 ** news.chatDetail
 */
ud.privateMessage = ({
    data
}) => {
    data = handle.wsChatDetail({
        data: data
    });
    let curPage = bus.getCurrentPage();
    let isEmailPage = /email/.test(curPage.page_path),
        isChatDetail = /item\/chat/.test(curPage.page_path),
        ue = wx.getStorageSync('column.userEmail');
    let tagName = handle.getChatTagName({
        content: data
    });
    console.log(ue.privateMessage.tagList);
    console.log(tagName);
    let location = ue.privateMessage.tagList.findIndex(() => tagName);
    console.log(location);
    if (location == -1) {
        // 不是发送或接受者
        return;
    }
    ue.privateMessage.list[location].unshift(data);
    ue.privateMessage.last[location] = [(data)];
    wx.setStorageSync('column.userEmail', ue);
    if (isEmailPage) {
        // 在用户信息主页 更新主页信息
    }
    if (isChatDetail) {
        // 在私信页面 更新私信信息 
    }
};
// 万能球->私信
ud.godBallChat = ({
    data
}) => {
    let curPage = bus.getCurrentPage(),
        gData = curPage.data.module.render.godBall;
    gData.type = 'email';
    gData.info = {
        content: `${data.sendName}对${data.receiveName}说了一句悄悄话~`,
        avatarUrl: data.sendIcon,
    }
    curPage.setData({
        'module.render.godBall': gData
    })
}

// 万能球->日记
ud.godBallDiary = ({
        data
    }) => {
        let curPage = bus.getHomePage(),
            gData = curPage.data.module.render.godBall;
        gData.type = 'diary';
        gData.info = {
            content: `${data.nickName}发布了公开日记到心情广场~`,
            avatarUrl: data.avatarUrl,
            id: data.id,
            date: util.formatDate(data.date)
        }
        console.log(gData);
        curPage.setData({
            'module.render.godBall': gData
        })
    }
    // 更新心情广场评论
ud.squareComments = ({
    data
}) => {
    console.log(data)
    let id = data.father,
        list = wx.getStorageSync('column.square'),
        index = list.ids.findIndex(() => id);
    if (index == -1) {
        return;
    }
    let curObj = list.itemList[index].comments;
    curObj.unshift(data);
    console.log(curObj);
    wx.setStorageSync('column.square', list);
}
ud.publicDiaryList = ({
    data
}) => {
    return data;
}
module.exports = ud;
