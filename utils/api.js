/*
 ** 接口聚合
 */
var domain = 'https://tp.fashionwhale.com/',
	version = 'v1/';
var api = {
    login: 'user/login?', // 用户登录 
    encry: 'user/encry?', // 解密  sessionId encryptedData iv
    userAll: 'user/userAll?', // 解密  sessionId encryptedData iv
    getUserEmail: 'user/getUserEmail?', // 获得站内信
    getPublicEmail: 'user/getPublicEmail?', // 获得站内公共信
    signEmail: 'user/signEmail?', // 标记已读信息
    chatTo: 'user/chat?', // 发私信
    chatBrow: 'user/chatBrow?', // 发私信
    myId: 'user/getUserId?', // 发私信


    weather: 'diary/weather?', // 
    getUserCalendar: 'calendar/userStatus?', // 
    pushdiary: 'diary/pushdiary?', // 
    getPublicDiary: 'diary/getPublicDiary?', // 
    getDiary: 'diary/getDiary?', // 
    getMyDiary: 'diary/getMyDiary?', // 
    deleteDiary: 'diary/deleteDiary?', // 
    addDiaryBrow: 'diary/brow?', // 
    addDiaryAgree: 'diary/agree?', // 
    addDiaryBrow: 'diary/brow?', // 


    postAnniversary: 'anniversary/update?', // 
    getIconList: 'anniversary/getIconList?', // 
    getAnniversaryList: 'anniversary/getList?', // 
    getMood: 'mood/getMood?', // 
    pushMood: 'mood/pushMood?', // 
    getUserMood: 'mood/getUserMood?', // 用户心情合计
    getNewsList: 'news/getNewsList?', // 抓取文章
    getOneNew: 'news/getOneNew?', // 抓取文章
    history: 'diary/history?', // 抓取文章
    getOptions: 'options/getOptions?', // 抓取指定属性
    pushFeedback: 'feedback/pushFeedback?', // 抓取指定属性
    getAboutInfo: 'feedback/getAboutInfo?', // 抓取指定属性
    bindWs: 'ws/bind?', // 绑定长连接UID

    postComments:'comments/postComments?' // 发送用户评论
}
for (var i in api){
	api[i] = domain + version + api[i];
}

module.exports = api;
