var root_path = "./",
    util = require(root_path + 'util.js'),
    bus = require(root_path + 'bus.js');

/*
 ** 数据处理中心 handle
 */
let h = {};
// 根据换行符格式化正文内容 @param string 
h.formatTextArea = function(content) {
    if (!content) {
        return [];
    }
    if (/(\s|\S).+(\s|\S)/g.test(content)) {
        var content = content.match(/(\s|\S).+(\s|\S)/g);
    } else {
        var content = [content];
    }
    var formatContent = [],
        i, len = content.length;
    for (i = 0; i < len; i++) {
        var tmpl = {};
        var con = content[i];
        if (/img/.test(con)) {
            tmpl.type = 'image';
            tmpl.src = util.getParam('src', con);
            tmpl.width = util.getParam('width', con);
            tmpl.height = util.getParam('height', con);
        } else {
            tmpl.type = 'text';
            // 过滤换行
            tmpl.content = con.replace(/[\r\n]/g, '');
        }
        formatContent.push(tmpl);
    }
    return formatContent;
};
// 将私信按照发信人和收信人处理
h.mergePrivateMessage = function(pm) {
    let merge = [],
        send = [],
        receive = [],
        tagList = [],
        newNumList = [],
        scrollId,
        myId = wx.getStorageSync('myId');
    for (let i of pm) {
        // 发送和接收绑在一起
        let sId = i.sendId,
            rId = i.receiveId;
        let tag = +sId > +rId ? `tag_${rId}_${sId}` : `tag_${sId}_${rId}`;
        tagList.push(tag);
        this[tag] = this[tag] || [];
        this[tag].push(i);
    }
    tagList = [...new Set(tagList)];
    for (let j of tagList) {
        let oj = this[j],
            jLen = oj.length,
            thisNum = 0;

        for (let k = 0; k < jLen; k++) {
            // 获得未读位置
            let ok = oj[k];
            ok.scrollId = `r${ok.id}`;
            ok.tagNum = this[j].length;
            ok.tagName = j;
            // 计算未读信息数量
            if (ok.status == 0) {
                thisNum++;
            }
        }
        newNumList.push(thisNum);
        merge.push(oj);

    }
    return {
        merge: merge,
        tagList: tagList,
        newNumList: newNumList
    };
};
// 获得私信标识
h.getChatTagName = ({
    content
}) => {
    let sId = content.sendId,
        rId = content.receiveId;
    let tag = +sId > +rId ? `tag_${rId}_${sId}` : `tag_${sId}_${rId}`;
    return tag;
};
// 初始化用户信件
h.initUserEmail = ({
    publicMessage,
    privateMessage,
    commentsMessage,
    init
}) => {
    console.log(publicMessage)
    let newNum = 0;
    // 处理数据
    for (let i of publicMessage) {
        i = h.wsChatDetail({
            data: i,
            type: 'public'
        });
        if (i.status == 0) {
            newNum++;
        }
    }

    for (let j of privateMessage) {
        j = h.wsChatDetail({
            data: j
        });
        if (j.status == 0) {
            newNum++;
        }
    }

    // 将相同用户的私信合并
    let initPrivateMes = h.mergePrivateMessage(privateMessage),
        merge = initPrivateMes.merge,
        tagList = initPrivateMes.tagList,
        newNumList = initPrivateMes.newNumList;
    for (let x = 0; x < merge.length; x++) {
        merge[x] = util.reversalArray(merge[x]);
    }
    // 抓最新的几条
    let lastPrivateMes = [];
    for (let y of merge) {
        lastPrivateMes.push([y[y.length - 1]]);
    }

    for (let k of commentsMessage) {
        k = h.wsChatDetail({
            data: k,
            type: 'comments'
        });
    }
    let param = {
        publicMessage: {
            list: publicMessage,
            name: 'publicMessage',
            num: publicMessage.length,
            show: false,
        },
        privateMessage: {
            list: merge,
            last: lastPrivateMes,
            name: 'privateMessage',
            num: privateMessage.length,
            show: true,
            tagList: tagList,
            newNumList: newNumList,
            scrollId: initPrivateMes.scrollId
        },
        commentsMessage: {
            list: commentsMessage,
            name: 'commentsMessage',
            num: commentsMessage.length,
            show: false,
        },
        newNum: newNum,
        init:true
    }
    bus.getHomePage().setData({
        'module.iconNav.email.newNum': param.newNum
    })
    return param;
};
// 处理长连接用户信息
h.wsChatDetail = ({
    data,
    type = 'private'
}) => {
    data.formatContent = h.formatTextArea(data.content);
    data.time = util.formatDate(data.date, {
        format: '{year}-{month,2,0}-{day,2,0} {hour,2,0}:{min,2,0}'
    });
    // data.date = util.formatDate(data.date);
    data.mtype = type;
    data.scrollId = 'r' + data.id;
    return data;
};
h.initPublicDiary = ({
        data
    }) => {
        let cp = bus.getCurrentPage();
        if (util.isArray(data)) {
            let ids = [];
            for (let i of data) {
                i.formatContent = h.formatTextArea(i.content);
                i.openFlag = true; // 是否隐藏内容 false为隐藏
                i.agreeClicked = i.isAgree ? true : false;
                i.date = util.formatDate(i.date);
                ids.push(i.id);
            }
            let square = util.objInsert({
                itemList: data,
                ids: ids
            }, cp.data.column.square || {});
            console.log(square);
            wx.setStorageSync('column.square', square);
            return square;
        } else if (data.id) {
            data.formatContent = h.formatTextArea(data.content);
            data.openFlag = true; // 是否隐藏内容 false为隐藏
            data.agreeClicked = data.isAgree ? true : false;
            data.date = util.formatDate(data.date);

            return data;
        }

    }
    // 过滤提示
h.initOptionTips = (object) => {
    console.log(object);
    return h.formatTextArea(object.option_value);
}

module.exports = h;
