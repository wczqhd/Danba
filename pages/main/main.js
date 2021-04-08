//index.js
//获取应用实例
const app = getApp()
const api = require("../../utils/wx/api.js");
var utilMd5 = require('../../utils/md5.js');
const util = require('../../utils/wx/util.js');
let WebIM = require("../../utils/WebIM")["default"];
//let msgStorage = require("../../comps/chat/msgstorage");
let msgStorageSrv = require("../../comps/chat/msgstorageSrv");
var gpMap = new Map();
let LIST_STATUS = {
  SHORT: "scroll_view_change",
  NORMAL: "scroll_view"
};

let __test_account__, __test_psword__;
// __test_account__ = "easezy";
// __test_psword__ = "111111";
var gpDataInter;
var gpDataInterIime = 10000;

Page({
  data: {
    motto: '',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    is_modal_Hidden: false,
    is_modal_Msg: '我是一个自定义组件',
    slider: [],
    list: [],
    bselIcon: false,

    currentRankIndex: 0,
    ////////
    name: "",
    hidden: false,
    psd: "",
    grant_type: "password",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),

    chatMsg: [],
    groupList: []

  },
  //事件处理函数
  bindViewTap: function () {

  },
  onShow: function () {
    //  console.log('show main  !!!');
  },
  onLoad: function () {

    /*  var now = new Date();
      var year = now.getFullYear(); //得到年份
      var month = now.getMonth();//得到月份
      var date = now.getDate();//得到日期
      var day = now.getDay();//得到周几
      var hour = now.getHours();//得到小时
      var minu = now.getMinutes();//得到分钟
      var sec = now.getSeconds();//得到秒
      var ms = now.getMilliseconds();//获取毫秒
      month = month + 1;
      if (month < 10) month = "0" + month;
      else month = "" + month;
      if (date < 10) date = "0" + date;
      if (hour < 10) hour = "0" + hour;
      if (minu < 10) minu = "0" + minu;
      if (sec < 10) sec = "0" + sec;
      if (ms < 100) ms = "0" + ms;
      var tm = "";
      tm = year + month + date + hour + minu + sec + ms;
      console.log('step2  !!!', tm);*/
    //  console.log('step2  !!!', date1);
    this.fetchData();
    //   var historyChatMsgs = wx.getStorageSync("rendered_" + '85068712312833wwwww') || [];
    //  wx.setStorageSync("rendered_" + '85068996476931wwwww',null);
    // this.fetchGPRecord(0,0);

    gpDataInter = setInterval(this.fetchData, gpDataInterIime);
    // this.getRecommenData();
    //  this._getRankData();
    ////////////////////////////////////////////

    //  console.log('app.globalData.userInfo  ', app.globalData.userInfo);

    /////////////////////////////////////////
  },





  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  toSingerPage: function (event) {

  },
  toSearch: function (e) {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '一个用语音感受话题的神器!',
      path: 'pages/main/main',
      success: function (res) {
        // 转发成功
        console.log('分享成功')
      },
      fail: function (res) {
        // 转发失败
        console.log('分享失败')
      }
    }
  },
  _selectIcon: function (event) {

    const data = event.currentTarget.dataset
    // console.log("_selectIcon   ####  ", data.hi);
    // let uu = encodeURIComponent(data.turl);
    //  https://item.jd.com/30494479738.html
    let uu = encodeURIComponent('https://union-click.jd.com/jdc?e=&p=AyIGZRtaEwUWBlcZWRYyEAZQE14QBBoBVxJrUV1KWQorAlBHU0VeBUVOWk1RAk8ECllHGAdFBwtaV1MJBAJQXk8JF0EfGQATAl0eXhMKFAVcDBsZdk13PGI4YkJlWA9%2FLFwCRWcNbzhhWGIAI2IjcnZbeBFsMnFRZU4THDhsZnZzJhsadmt2Yix4IFJ0cGcNbAJ%2BR2RuJXIidmFFYB18JHV2YkUCTTBecRNvXXspfnVxXhxeL012d342bAdjYHJUNUEwSmFgZwVsKHJeZn4pey9McVJ%2FLG87YVsSWSIZDXd1chNXbk8XdyJaFUQCUnJRHTYbWE0EWX5dXB5IW1BnWRdrFDISBlQbXRcFFQ5dK2sVBSJGOxxZFQsVAmUaaxUGFQ9dHV4VBhcBUBtrEgIbNw5ONRMEFVAASFoSChtQARlrJTIRN2UrWxYyETcXdV5BVhMOAkgMRwoRAFAaCREKQVVQG1sWBxEPURtSQgEVN1caWhEL');
    let sd = '30494479738';
    //  let ph = '/pages/product/product?wareId=' + sd + '&spreadUrl=' + uu
    //   + '&customerinfo=' + app.globalData.customerinfo;
    let ph = '/pages/jingfen_twotoone/item?spreadUrl=' + uu + '&customerinfo=' + app.globalData.customerinfo
    console.log("_selectIcon   ####  ", ph);
    wx.navigateToMiniProgram({
      appId: 'wx13e41a437b8a1d2e',
      path: ph,
      // extraData: {
      //   foo: 'bar'
      // },
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    });


  },
  _selectItemRank: function (event) {

    const data = event.currentTarget.dataset.data
    console.log("_selectItemRank   ####  ", data);

    //  console.log("topic-detail   ", data);
    wx.navigateTo({
      url: '/pages/topic-detail/topic-detail?gid=' + data.roomId + '&name=' + data.name + '&reload=0'
    })
  },
  _getRankData: function () {
    api.getTopList().then((res) => {
      var res1 = res.data.replace('jp1(', '')
      var res2 = JSON.parse(res1.substring(0, res1.length - 1))
      this.setData({
        topList: res2.data.topList
      })
    })
  },
  //////////////////
  /** 
   *  数组对象按key升序, 并生成 md5_hex 签名
   * @param {Array/Object} obj   数组对象
   * @return {String}  encrypted md5加密后的字符串
   */


  ///////////////////////////////////////////
  fetchGPRecord: function (tt, gid) {
    var that = this;
    let myname = wx.getStorageSync("myUsername");
    var uu = app.globalData.mainSrv + "?tp=record&id=" + gid.toString() + "&tst=" + tt + "&ur=" + myname;
    //   console.log("fetchGPRecord   ", uu);
    wx.request({
      url: uu,
      header: {
        'content-type': 'application/json;charset-utf-8'
      },
      success: function (res) {
        if (res.statusCode == 200) {
          console.log('fetchGPRecord ', res.data);
          for (let i = 0; i < res.data.length; i++) {
            // console.log('fetchGPRecord  type ', res.data[i].payload.bodies[0].type);
            /*		sendableMsg = {
			id: receiveMsg.id,
			type: type,
			accessToken: receiveMsg.token || receiveMsg.accessToken,
			body: {
				id: receiveMsg.id,
				length: receiveMsg.length,
				from: receiveMsg.from,
				to: receiveMsg.to,
				type: receiveMsg.type,
				ext: receiveMsg.ext,
				chatType: type,
				toJid: "",
				body: {
					type: type,
					url: receiveMsg.url,
					filename: receiveMsg.filename,
					filetype: receiveMsg.filetype,
					from: receiveMsg.from,
					to: receiveMsg.to
				},
			},
		}; */
            let recvMsg = {};
            recvMsg.id = res.data[i].msg_id;
            recvMsg.length = res.data[i].payload.bodies[0].length;
            recvMsg.from = res.data[i].from;
            recvMsg.to = res.data[i].to;
            recvMsg.type = res.data[i].payload.bodies[0].type;
            recvMsg.ext = res.data[i].payload.ext;
            recvMsg.url = res.data[i].payload.bodies[0].url;
            recvMsg.filename = res.data[i].payload.bodies[0].filename;
            recvMsg.timestamp = res.data[i].timestamp;
            recvMsg.accessToken = res.data[i].payload.bodies[0].accessToken;
            let myUsername = wx.getStorageSync("myUsername");

            let sessionKey = (recvMsg.from == myUsername) ?
              recvMsg.to + myUsername :
              recvMsg.from + myUsername;
            var date = new Date(recvMsg.timestamp);
            var Hours = date.getHours();
            var Minutes = date.getMinutes();
            var Seconds = date.getSeconds();
            var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + (Hours < 10 ? "0" + Hours : Hours) + ":" + (Minutes < 10 ? "0" + Minutes : Minutes) + ":" + (Seconds < 10 ? "0" + Seconds : Seconds);
            var historyChatMsgs = wx.getStorageSync("rendered_" + sessionKey) || [];
            console.log("main historyChatMsgs ", historyChatMsgs);
            console.log("main historyChatMsgs ", recvMsg.to);
            let j = 0;
            for (; j < historyChatMsgs.length; j++) {
              if ((historyChatMsgs[j].mid == (recvMsg.type + recvMsg.id)) && (historyChatMsgs[j].msg.url == recvMsg.url) && (time == historyChatMsgs[j].time) && (recvMsg.from == historyChatMsgs[j].info.from) && (recvMsg.to == historyChatMsgs[j].info.to)) {
                //    console.log('recvMsg &&&&&&&&&&&&&&&&&  ', recvMsg.to);
                //    console.log('recvMsg &&&&&&&&&&&&&&&&&  ', time);
                break;
              }
            }
            //   historyChatMsgs = historyChatMsgs.concat(curChatMsg);
            console.log("main historyChatMsgs ", recvMsg.to);
            if (j == historyChatMsgs.length) {
              msgStorageSrv.saveReceiveMsg(recvMsg, res.data[i].payload.bodies[0].type);
            }
            //     msgStorageSrv.saveReceiveMsg(recvMsg, res.data[i].payload.bodies[0].type);
          }

        }
      }
    });


  },

  fetchGPData: function (tt, gid) {
    var that = this;
    let myname = wx.getStorageSync("myUsername");
    var uu = app.globalData.mainSrv + "?tp=list&id=" + gid.toString() + "&tst=" + tt + "&ur=" + myname;
    console.log("fetchGPData   ", uu);
    wx.request({
      url: uu,
      header: {
        'content-type': 'application/json;charset-utf-8'
      },
      success: function (res) {
        that.getGroups();
      }
    });


  },

  fetchData: function () {

    var that = this;

    that.fetchGPData(0, 0);

  },



  ///////////////////////
  getGroups() {
    var me = this;
    //   console.log('step 5$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    WebIM.conn.listRooms({
      success: function (rooms) {

        if (me.data.groupList.length == rooms.length)
          return; //先简单处理
        me.setData({
          groupList: rooms

        });
        //gpDataInter = setInterval(this.fetchData, gpDataInterIime);
        //   if()//新用户注册后第一时间获取不到
        //    console.log(' me.data.groupList 5$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$', me.data.groupList);
        me.data.groupList.reverse();
        for (let i = 0; i < me.data.groupList.length; i++) {
          //   let sessionKey = me.data.groupList[i].roomId + myUsername;
          me.getGroupInfo(me.data.groupList[i]);
        }
        //   me.getMsg();



        // 好像也没有别的官方通道共享数据啊
        getApp().globalData.groupList = rooms || [];
      },
      error: function (res) {
        console.log('step 6', res);
      }
    });

  },

  getGroupInfo(gitem) {
    var me = this;
    // 获取群信息
    var options = {
      groupId: gitem.roomId,
      success: function (resp) {
        if (resp && resp.data && resp.data.data) {


          let desData = resp.data.data[0].description;
          //  console.log("desData   ", desData.split('；'));

          gitem.desList = desData.split('；');
          /* let rdn = util.randomNum(app.globalData.goods.length-1);
       
          
        
          gitem.gpImage = app.globalData.goods[rdn].picUrl;
          gitem.skuid = app.globalData.goods[rdn].id;
          gitem.turl = app.globalData.goods[rdn].linkUrl;
          console.log("gitem.desList   ", gitem.skuid);*/

          me.setData({

            groupList: me.data.groupList
          });

        }
      },
      error: function () {
        console.log("music group data error!!!!!");
      }
    };
    WebIM.conn.getGroupInfo(options);
  },

  getMsg() {


    let me = this;
    if (getApp().globalData.isIPX) {
      this.setData({
        isIPX: true
      })
    }
    let myUsername = wx.getStorageSync("myUsername");

    for (let i = 0; i < me.data.groupList.length; i++) {
      let sessionKey = me.data.groupList[i].roomId + myUsername;

      let chatMsg = wx.getStorageSync(sessionKey) || [];

      //   this.renderMsg(null, null, chatMsg, sessionKey,'',i);
      //   renderMsg(renderableMsg, type, curChatMsg, sessionKey, isnew, gi){
      var historyChatMsgs = wx.getStorageSync("rendered_" + sessionKey) || [];


      historyChatMsgs = historyChatMsgs.concat(chatMsg);
      if (!historyChatMsgs.length) continue;
      let ll = historyChatMsgs.length > 1 ? 1 : historyChatMsgs.length;
      ll = -1 * ll;
      me.data.groupList[i].chamsg = historyChatMsgs.slice(ll);


      this.setData({
        chatMsg: historyChatMsgs.slice(-20),
        // 跳到最后一条
        toView: historyChatMsgs[historyChatMsgs.length - 1].mid,
        groupList: me.data.groupList
      });




      wx.setStorageSync("rendered_" + sessionKey, historyChatMsgs);

      wx.setStorageSync(sessionKey, null);

      //	Index = historyChatMsgs.slice(-1).length;

      wx.pageScrollTo({
        scrollTop: 9999,
      });

      //   console.log("group data ", me.data.groupList[i].chamsg);
      //   console.log("getGroups  ", me.data.groupList.length);
      // me.data.groupList[i].chamsg = chatMsg;

    }

  }
})