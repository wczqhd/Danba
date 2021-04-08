


var util = require('../../utilswm/util.js');
//var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utilswm/wxApi.js')
var wxRequest = require('../../utilswm/wxRequest.js')
//////////////////////
const app = getApp();

var utilMd5 = require('../../utils/md5.js');

let WebIM = require("../../utils/WebIM")["default"];
let msgStorage = require("../../comps/chat/msgstorage");
let msgType = require("../../comps/chat/msgtype");
/////////////////////////////////////
//import config from '../../utilswm/config.js'



///////////////////////
//let msgStorageSrv = require("../../comps/chat/msgstorageSrv");
var gpMap = new Map();
let LIST_STATUS = {
    SHORT: "scroll_view_change",
    NORMAL: "scroll_view"
};

let __test_account__, __test_psword__;
// __test_account__ = "easezy";
// __test_psword__ = "111111";
var gpDataInter;
var gpDataInterIime = 120000;


///////////////////////
Page({
    data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        Custom: app.globalData.Custom,
        postsList: [],
        postsShowSwiperList: [],
        isLastPage: false,
        cardCur: 0,
        page: 1,
        search: '',
        categories: 0,
        showerror: "none",
        showCategoryName: "",
        categoryName: "",
        showallDisplay: "block",
        displayHeader: "none",
        displaySwiper: "none",
        floatDisplay: "none",
        displayfirstSwiper: "none",

        listAdsuccess: true,
        webSiteName: '蛋吧',
        domain: app.globalData.mainSrv,
        isFirst: false, // 是否第一次打开,
        isLoading: false,

        ////////////////////////////
        posts: [],

        indicatorDots: !1,
        autoplay: !0,
        interval: 3e3,
        currentSwiper: 0,
        navBarHeight: wx.getSystemInfoSync().statusBarHeight,
        placeHolder: '输入你想知道的内容...',
        autoFocus: false,
        inputEnable: true,
        stickyPost: {},
        index: 0,
        siteInfo: '',
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
        chatMsg: [],
        groupList: [],
        sharedGid: '1',
        sharedMid: '1',
        sharedName: '1',
        __comps__: {
            audio: null,
        },
        chatType: {
            type: String,
            value: msgType.chatType.CHAT_ROOM,
        }

        ////////////////////////////

    },

    onShareAppMessage: function (options) {
        var shareobj;
        var self = this;
        if (options.from == 'button') {
            var eData = options.target.dataset;
            //　　console.log( "sharedata ",eData.data );     // shareBtn
            var i = 0;
            for (; i < self.data.groupList.length; i++) {
                if (self.data.groupList[i].groupid == eData.data.to) {
                    break;
                }

            }
            console.log("clickShare  11111  ");
            //   self.clickBtn(options,"clickShare");
            shareobj = {
                title: self.data.groupList[i].groupname,        // 默认是小程序的名称(可以写slogan等)
                path: '/pages/index/index?gid=' + eData.data.to + "&mid=" + eData.data.mid + "&name=" + self.data.groupList[i].groupname,        // 默认是当前页面，必须是以‘/’开头的完整路径
                imageUrl: self.data.groupList[i].post_thumbnail_image,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
                success: function (res) {
                    // 转发成功之后的回调
                    console.log("clickShare  11111  ", res);
                    if (res.errMsg == 'shareAppMessage:ok') {
                    //    console.log("clickShare  ");
                        self.fire("newShare", eData.data.mid, eData.data.to);
                        console.log("clickShare  ");
                        self.data.groupList[i].hotmsg.sharecount = self.data.groupList[i].hotmsg.sharecount + 1;
                        self.clickBtn(options, "clickShare");
                        self.setData({
                            groupList: self.data.groupList
                        });
                    }
                },
                fail: function (res) {
                    // 转发失败之后的回调
                    console.log("clickShare  ", res);
                    if (res.errMsg == 'shareAppMessage:fail cancel') {
                        // 用户取消转发
                    } else if (res.errMsg == 'shareAppMessage:fail') {
                        // 转发失败，其中 detail message 为详细失败信息
                    }
                }
            };
            // 此处可以修改 shareObj 中的内容

        }
        else {
            shareobj = {
                title: '有趣的灵魂需要有趣的声音',
                path: 'pages/index/index',
                success: function (res) {
                    // 转发成功
                    console.log("clickShare  ", res);
                },
                fail: function (res) {
                    // 转发失败
                    console.log("clickShare  ", res);
                }
            };

        }
        // const data = event.currentTarget.dataset.data;

        return shareobj;
    },
    /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
    onPullDownRefresh: function () {
        var self = this;
        self.setData({
            showerror: "none",
            showallDisplay: "block",
            displaySwiper: "none",
            floatDisplay: "none",
            isLastPage: false,
            page: 1,
            postsShowSwiperList: [],
            listAdsuccess: true

        });
        //  this.fetchTopFivePosts();
        console.log("onPullDownRefresh  !!!!!!!!!");
        this.fetchPostsData();
        this.getPostList();

    },
    /**
   * 页面上拉触底事件的处理函数
   */
    onReachBottom: function () {

        var self = this;
        if (!self.data.isLastPage) {
            self.setData({
                page: self.data.page + 1
            });
       //     console.log("onReachBottom  !!!!!!!!!");
       //     console.log('当前页' + self.data.page);
            this.fetchPostsData();
            this.getPostList();
        } else {
            console.log('最后一页');
        }

    },
    onLoad: function (options) {
        var self = this;

        if (options.gid != undefined) {
            this.setData({
                sharedGid: options.gid,
                sharedMid: options.mid,
                sharedName: options.name
            });
        }

        //    sharedGid:'',
        //  sharedMid:''
        /*   var dd = "YWMtJVXv8OeuEemEsDMIJuBWEY56DhAt8hHptO4793yzg4zIwZQwyh4R6Yb8kaWbWDrLAwMAAAFtnZhrBgBPGgBaE6jKZSP1VmnM-NZ3DwghJXRSiJ3Xb3DsWRz3kuel7w";
           console.log("ttt ",dd.length);*/

        this.setData({
            skinStyle: 'white',//wx.getStorageSync('skinStyle') || 'white',
            groupList: wx.getStorageSync('DanbalistGroup') || []
        });
      //  app.getShenHeTxt('',this.test);
     
        //   console.log("skinStyle  ", this.data.skinStyle);
        // 判断用户是不是第一次打开，弹出添加到我的小程序提示
        var isFirstStorage = wx.getStorageSync('isFirst');
        // console.log(isFirstStorage);
        if (!isFirstStorage) {
            self.setData({
                isFirst: true
            });
            wx.setStorageSync('isFirst', 'no')
            // console.log(wx.getStorageSync('isFirst'));
            setTimeout(function () {
                self.setData({
                    isFirst: false
                });
            }, 5000)
        }
        this.data.__comps__.audio = this.selectComponent("#chat-suit-audio");
        /////////////////////////////

        let that = this;
        wx.getSystemInfo({
            success: function (a) {
                that.setData({
                    isIphoneX: a.model.match(/iPhone X/gi)
                });
            }
        });

        if (wx.canIUse('hideHomeButton')) {
			wx.hideHomeButton()
		}

        // this.getAdvert();
        //   this.getPostList();

        /*   var now = new Date();
           console.log('step1111111  !!!', now);//获取数字
           console.log('step1111111  !!!', now.getTime());//获取数字
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

        //   var historyChatMsgs = wx.getStorageSync("rendered_" + '85068712312833wwwww') || [];
        //  wx.setStorageSync("rendered_" + '85068996476931wwwww',null);
        //  console.log("this.data.CustomBar  ",  this.data.CustomBar);
        //   console.log("this.data.StatusBar  ",  this.data.StatusBar);
    },
    test(){
        console.log("index  test!!! ");

    },
    saveSendMsg(evt) {
     //   console.log("index  saveSendMsg ",  this.data.chatType);
     //   console.log("index  saveSendMsg ",  msgType.chatType.CHAT_ROOM);
        evt.detail.msg.type = 'groupchat';
        console.log("index  saveSendMsg ", evt.detail.msg.id);
        this.setData({
            sharedGid: evt.detail.msg.to,
            sharedMid: 'audio' + evt.detail.msg.id,
            sharedName: evt.detail.name
        });
        this.fetchPostsData();
        msgStorage.saveMsg(evt.detail.msg, evt.detail.type);
    },
        
    onShow: function (options) {

        this.fetchPostsData();

    },



    //获取文章列表数据
    fetchPostsData: function () {
        var self = this;
        /*  if (!data) data = {};
          if (!data.page) data.page = 1;
          if (!data.categories) data.categories = 0;
          if (!data.search) data.search = '';
          if (data.page === 1) {
            self.setData({
              postsList: []
            });
          };*/
        self.setData({
            isLoading: true
        });

        //url is ok 
        var that = this;
        var tt = 0, gid = 0;
        let myname = wx.getStorageSync("myUsername");
        let ur = wx.getStorageSync("DanbaId");
    //    var uu = app.globalData.mainSrv + "?tp=list&id=" + gid.toString() + "&tst=" + tt + "&ur=" + ur;
    var uu = app.globalData.mainSrv + "?id=" + gid.toString();
        console.log("fetchGPData   ", uu);
        let urldata = {
            'tp':'list',
            'tst':tt,
            'ur':ur
        }
        /*   wx.request({
               url: uu,
               header: {
                   'content-type': 'application/json;charset-utf-8'
               },
               success: function (res) {
                   
               }
           });*/
        var getPostsRequest = wxRequest.getRequest(uu,urldata);
        getPostsRequest
            .then(response => {
              //     console.log("fetchGPData  rep ", response);
                if (response.statusCode === 200) {

                //    that.getGroups();
                that.getGroupList(response);


                }//200
            })
            .catch(function (response) {


            })
            .finally(function (response) {
                wx.hideLoading();
                self.setData({
                    isLoading: false
                });
            });




    },

    getGroupList(res){
                    //     console.log("that.getGroups ", res.data);
                    let barr = res.data;
                    let me = this;
                    
                     //   if (me.data.groupList.length == res.data.length)
                     //      return; //先简单处理
     
                     me.setData({
                         groupList: barr
     
                     });
                     wx.setStorageSync({
                         key: "DanbalistGroup",
                         data: res.data
                     });
                     //gpDataInter = setInterval(this.fetchData, gpDataInterIime);
                     //   if()//新用户注册后第一时间获取不到
                 //         console.log(' me.data.groupList $$$$$$$$$$$$$$$$$$$$$$$$$', me.data.groupList);
                  //   var gg = me.data.groupList[0];
                     //      console.log("that.getGroups 5555 ",gg);
                     let i = 0;
                     if (me.data.sharedGid != '1')//分享进入
                     {
                         var sharegroup = {};
                         sharegroup.groupid = me.data.sharedGid;
                         sharegroup.groupname = me.data.sharedName;
                         me.data.groupList.unshift(sharegroup);
                         me.getGroupInfoDetail(sharegroup);
                         me.fetchGPRecord(0, me.data.sharedGid, "recordone", me.data.sharedMid);
                         i = 1;
                         me.setData({
                             groupList: me.data.groupList,
     
                         });
                     }
     
                     //    me.data.groupList.reverse();
                     for (; i < me.data.groupList.length; i++) {
                         //   let sessionKey = me.data.groupList[i].groupid + myUsername;
                         //  me.getGroupInfo(me.data.groupList[i]);
                         me.data.groupList[i].groupname = me.data.groupList[i].name;
                         if (me.data.groupList[i].groupid == me.data.shareGid)
                             continue;//去重
                         me.data.groupList[i].hotmsg = null;
                         me.getGroupInfoDetail(me.data.groupList[i]);
                         me.fetchGPRecord(0, me.data.groupList[i], "recordhot", 0);
                     }
     
                     // 好像也没有别的官方通道共享数据啊
                     getApp().globalData.groupList = me.data.groupList || [];
                     me.setData({
     
                         sharedGid: '1',
                         sharedMid: '1',
                         sharedName: '1'
                     });
    },

    // 跳转至查看小程序列表页面或文章详情页
    redictAppDetail: function (e) {
        // console.log('查看文章');
        var id = e.currentTarget.id;
        var redicttype = e.currentTarget.dataset.redicttype;
        var url = e.currentTarget.dataset.url == null ? '' : e.currentTarget.dataset.url;
        var appid = e.currentTarget.dataset.appid == null ? '' : e.currentTarget.dataset.appid;

        if (redicttype == 'detailpage') //跳转到内容页
        {
            url = '../detail/detail?id=' + id;
            wx.navigateTo({
                url: url
            })
        }
        if (redicttype == 'apppage') { //跳转到小程序内部页面         
            wx.navigateTo({
                url: url
            })
        } else if (redicttype == 'webpage') //跳转到web-view内嵌的页面
        {
            url = '../webpage/webpage?url=' + url;
            wx.navigateTo({
                url: url
            })
        } else if (redicttype == 'miniapp') //跳转到其他app
        {
            wx.navigateToMiniProgram({
                appId: appid,
                envVersion: 'release',
                path: url,
                success(res) {
                    // 打开成功
                },
                fail: function (res) {
                    console.log(res);
                }
            })
        }
    },

    adbinderror: function (e) {
        var self = this;
        console.log(e.detail.errCode);
        console.log(e.detail.errMsg);
        if (e.detail.errCode) {
            self.setData({
                listAdsuccess: false
            })
        }

    },

    /////////////////////////////////////////////////////////////////////////////////////////////
    clickJoinAudio: function (event) {
        let me = this;
        app.sendOperation("indexclickJoinAudio");
        var data = event.currentTarget.dataset.data;
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.userInfo']) {
                    wx.navigateTo({ url: '/pages/logwx/logwx' });
                    return;
                }
                if (!res.authSetting['scope.record']) {
                    wx.authorize({
                        scope: 'scope.record',
                        success() {
                            // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                            me.data.__comps__.audio.toggleRecordModal(data.to);
                        }
                    })
                }
                else {
                    me.data.__comps__.audio.toggleRecordModal(data.to);
                }
            }
        });
    },

    clickBtn: function (event, type) {
        var self = this;
        var tt = 0, gid = 0;
        let myname = wx.getStorageSync("myUsername");
        let ur = wx.getStorageSync("DanbaId");
        var data;
        if (type == "clickShare") {
            data = event.target.dataset.data;
        }
        else
            data = event.currentTarget.dataset.data;
        var uu = app.globalData.mainSrv + "?tp=" + type + "&gd=" + data.to + "&md=" + data.mid + "&ur=" + ur;
        console.log("fetchClickData   ", uu);
        /*   wx.request({
               url: uu,
               header: {
                   'content-type': 'application/json;charset-utf-8'
               },
               success: function (res) { 
                   
               }
           });*/
        var getPostsRequest = wxRequest.getRequest(uu);
        getPostsRequest
            .then(response => {
                if (response.statusCode === 200) {



                }//200
            })
            .catch(function (response) {


            })
            .finally(function (response) {
                wx.hideLoading();
                self.setData({
                    isLoading: false
                });
            });

    },
    clickLike: function (event) {
        this.clickBtn(event, "clickLike");
        var i = 0;
        var self = this;
        var data = event.currentTarget.dataset.data;
        if(data.like == 'yes')
        {
            return;
        }
        for (; i < self.data.groupList.length; i++) {
            if (self.data.groupList[i].groupid == data.to) {
                break;
            }

        }

        self.data.groupList[i].hotmsg.likecount = self.data.groupList[i].hotmsg.likecount + 1;
        self.data.groupList[i].like_count = self.data.groupList[i].like_count + 1;

        self.setData({
            groupList: self.data.groupList
        });
    },
    clickListen: function (event) {
        this.clickBtn(event, "clickListen");
        var i = 0;
        var self = this;
        var data = event.currentTarget.dataset.data;
        for (; i < self.data.groupList.length; i++) {
            if (self.data.groupList[i].groupid == data.to) {
                break;
            }

        }
        self.data.groupList[i].hotmsg.listencount = self.data.groupList[i].hotmsg.listencount + 1;
        self.data.groupList[i].listen_count = self.data.groupList[i].listen_count + 1;
        self.setData({
            groupList: self.data.groupList
        });
    },
    clickShare: function (event) {
        console.log("clickShare  ", event);

    },
    clickUnLike: function (event) {
        this.clickBtn(event, "clickUnLike");
    },

    _selectItemRank: function (event) {
        // this.build_group();
        app.sendOperation("indexselectItemRank");
        const data = event.currentTarget.dataset.data;
        console.log("_selectItemRank   ####  ", data);

          console.log("topic-detail   ", data.post_thumbnail_image);
        wx.navigateTo({
            url: '/pages/topic-detail/topic-detail?gid=' + data.groupid + '&name=' + data.groupname  +'&reload=0'
            // url: '/pages/icon/icon'
        })
    },
    ///////////////////////////////////////////
    fetchGPRecord: function (tt, gitem, type, mid) {
        var that = this;
        let myname = wx.getStorageSync("myUsername");
        let ur = wx.getStorageSync("DanbaId");
        //获取首页的条目
        //recordhot recordone 
        var uu = app.globalData.mainSrv + "?tp=" + type + "&id=" + gitem.groupid + "&mid=" + mid + "&tst=" + tt + "&ur=" + ur;

        ////////////////////////////////////

        var getPostsRequest = wxRequest.getRequest(uu);
        getPostsRequest
            .then(res => {
                if (res.statusCode === 200) {

                    for (let i = 0; i < res.data.length; i++) {


                        let recvMsg = {};
                        recvMsg.msg = {};


                        recvMsg.id = res.data[i].msg_id;
                        recvMsg.mid = res.data[i].msg_id;
                        recvMsg.msg.length = Math.ceil(res.data[i].length / 1000);
                        //    
                        recvMsg.from = res.data[i].chatfrom;
                        recvMsg.to = res.data[i].chatto;
                        recvMsg.type = res.data[i].type;
                        recvMsg.ext = '';//res.data[i].payload.ext;
                     //   console.log("weburl  ",res.data);
                        recvMsg.url = res.data[i].weburl;
                        recvMsg.msg.data = res.data[i].weburl;

                        recvMsg.filename = '';
                        recvMsg.timestamp = parseInt(res.data[i].timestamp);

                        recvMsg.accessToken = res.data[i].accessToken;
                        recvMsg.msg.token = res.data[i].accessToken;

                        recvMsg.style = "self";
                        recvMsg.nickname = "self";
                        recvMsg.listencount = res.data[i].listencount;
                        if(gitem.groupname == '10041')
                            console.log("recvMsg.listencount  ",recvMsg.listencount);
                        recvMsg.likecount = res.data[i].likecount;
                        recvMsg.unlikecount = res.data[i].unlikecount;
                        recvMsg.sharecount = res.data[i].sharecount;
                        var date = new Date(parseInt(recvMsg.timestamp));

                        var Hours = date.getHours();
                        var Minutes = date.getMinutes();
                        var Seconds = date.getSeconds();
                        var timestr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + (Hours < 10 ? "0" + Hours : Hours) + ":" + (Minutes < 10 ? "0" + Minutes : Minutes);///+ ":" + (Seconds < 10 ? "0" + Seconds : Seconds);
                        recvMsg.post_date = timestr;
                        /////////////////////////////////////////
                        let ll = wx.getStorageSync(myname + "-likedlist");
                

                       
                        recvMsg.like = "no";
                            for (let k = 0; k < ll.length; k++) {
                                if ((ll[k].mid == recvMsg.mid) && (ll[k].gid == recvMsg.to)) {
        
                                    recvMsg.like = "yes";
                                }
                            }
                           
                        //    that.data.groupList[gid].hotmsg = recvMsg;
                        /* for(let k=0;k<that.data.groupList.length;k++){
                           if(that.data.groupList[k].groupid == gid)
                           {
                             that.data.groupList[k].hotmsg = recvMsg;
                        //     console.log('that.data.groupList[k].hotmsg ', that.data.groupList[k].hotmsg);
                             break;
                           }
                         }*/
                        gitem.hotmsg = recvMsg;
                        let item = null;
                        item = app.globalData.gAvatarMap[recvMsg.from];
                        
                        
                       
                        if(typeof(item) === 'undefined' || item === null){  //本地没存
                            var uuu = app.globalData.mainSrv + "?tp=getavatar&&ur=" + recvMsg.from;

                         //   console.log("hotmsg   ",uuu);
                            wx.request({
                                url: uuu,
                                header: {
                                    'content-type': 'application/json;charset-utf-8'
                                },
                                success: function (res2) {
                                    if (res2.statusCode === 200) {
                                       //       console.log("hotmsg   ",res2.data[0]);
                                        //    console.log("audio return   ", that.data.chatMsg);
                                   //     console.log("weburl  222 ",res2.data);
                                        if(res2.data.length == 0)
                                        {
                                            return;
                                        }
                                        
                                        gitem.hotmsg.avatarUrl = res2.data[0].weburl;
                                        gitem.hotmsg.nickname = res2.data[0].user_nickname;
                                        app.globalData.gAvatarMap.set(recvMsg.from, gitem.hotmsg.avatarUrl);
                                        app.globalData.gNickMap.set(recvMsg.from, gitem.hotmsg.nickname);

                                        that.setData({

                                            groupList: that.data.groupList
                                        });
                                        getApp().globalData.groupList = that.data.groupList || [];


                                    }
                                }
                            });
                        } else {
                          console.log("hotmsg 2323  ",item);
                            gitem.hotmsg.avatarUrl = item;
                            gitem.hotmsg.nickname = me.globalData.gNickMap.get(msg.info.from)
                        }


                    }//for

                    that.setData({

                        groupList: that.data.groupList
                    });

                }//200
            })
            .catch(function (response) {


            })
            .finally(function (response) {
                //   wx.hideLoading();

            });

    },

    togglePlayAudio: function (e) {
        console.log("play $$$$$$$$$  ");
        this.clickListen(e);
    },






    ///////////////////////
    getGroups() {
        var me = this;
        //    console.log('step 5$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
        WebIM.conn.getGroup({
            limit: 50,
            success: function (res) {
   
            },
            error: function (res) {
                console.log('step 6', res);
            }
        });

    },


    getGroupInfoDetail(gitem) {

        var me = this;
        var tt = 0, gid = 0;
        let myname = wx.getStorageSync("myUsername");
        var gid = gitem.groupid;
        var uu = app.globalData.mainSrv + "?tp=gpdetail&gid=" + gid + "&tst=" + tt + "&ur=" + myname;
      //     console.log("gpdetail  %% ",uu);
        var getPostsRequest = wxRequest.getRequest(uu);
        getPostsRequest
            .then(response => {
                       
                if (response.statusCode === 200) {
                //    console.log("gpdetail  $$$ img ",response.data);
                gitem.post_thumbnail_image = "11";
                    for (let j = 0; j < response.data.length; j++) {

                        if (response.data[j].type === "img") {
                            
                            gitem.post_thumbnail_image = response.data[j].groupurl;
                       //     console.log("gpdetail  $$$ img ",gitem.post_thumbnail_image);
                         
                        }
                        if (response.data[j].type === "txt") {
                       //     console.log("gpdetail  $$$  ",response.data);
                           
                            gitem.describe = response.data[j].content;
                       
                        }
                    //    gitem.post_thumbnail_image = response.data[j].groupurl;
                        gitem.like_count = response.data[j].likecount;
                        gitem.share_count = response.data[j].sharecount;
                        gitem.listen_count = response.data[j].listencount;
                      //  console.log("gpdetail listen_count $$$  ",gitem.listen_count);
                        gitem.total_comments = response.data[j].msgcount;
                        gitem.category_name = '';
                        //     gitem.post_date = "123134";//response.data.post_date;
                        gitem.owner = response.data[j].user_nickname;
                        gitem.avatarurl = response.data[j].avatarurl;
                    }

                    //不用广告，换成封面图了

                    //   gitem.pageviews = response.data.pageviews;

                  //    console.log("getGroupInfoDetail $$$$$ ",me.data.groupList);
                    me.setData({

                        groupList: me.data.groupList
                    });
                    getApp().globalData.groupList = me.data.groupList || [];

                }//200
            })



    },


    getPostList: function () {
        try {
            let args = {};
            //       console.log('getPostList   ', this.data.groupList.length);
            //   console.log('getPostList   ', this.data.groupList[0].gpImage);
            if (this.data.groupList.length < 10) {
                this.setData({
                    isLastPage: true,
                    loadtext: '到底啦',
                    showloadmore: false
                })
            }
            args.groupList = this.data.groupList;
            args.page = this.data.page + 1;
            this.setData(args);
            wx.stopPullDownRefresh();
        }
        catch (err) {
            console.log(err);
            wx.stopPullDownRefresh();
        }
    }

})

