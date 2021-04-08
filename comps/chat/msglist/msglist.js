let msgStorage = require("../msgstorage");
let msgStorageSrv = require("../msgstorageSrv");
let disp = require("../../../utils/broadcast");
var wxRequest = require('../../../utilswm/wxRequest');
const app = getApp();
let LIST_STATUS = {
    SHORT: "scroll_view_change",
    NORMAL: "scroll_view"
};

let page = 0;
let Index = 0;
let curMsgMid = ''
let isFail = false
Component({
    properties: {
        username: {
            type: Object,
            value: {},
        },
    },
    data: {
        view: LIST_STATUS.NORMAL,
        toView: "",
        chatMsg: [],
        countlist: [],
        __visibility__: false,
        groupImage:'',
        Describe:''
    },

    methods: {
        //////////////////////////////////////
        getCount: function (msgitem) {
            let i = 0;
            let j = 0;
            let that = this;
            msgitem.sharecount = 0;
            msgitem.listencount = 0;
            msgitem.likecount = 0;
      //      console.log("msgitem.likecount", that.data.countlist);
            for (; i < that.data.countlist.length; i++) {
                let b = (that.data.countlist[i].msgid == msgitem.mid || (('audio' + that.data.countlist[i].msgid  ) == msgitem.mid));
                if (that.data.countlist[i].type == "share" && b) {
                    msgitem.sharecount = that.data.countlist[i].count;
                    j++;
                }

                if (that.data.countlist[i].type == "listen" && b) {
                    msgitem.listencount = that.data.countlist[i].count;
                    j++;
                }
             /*   if (that.data.countlist[i].type == "like") {
                    console.log("that.data.countlist[i].type1", that.data.countlist[i].type);
                    console.log("that.data.countlist[i].type2", that.data.countlist[i].msgid);
                    console.log("that.data.countlist[i].type3", msgitem.mid);

                }*/

                if (that.data.countlist[i].type == "like" && b) {
                  //  console.log("msgitem.likecount", msgitem.likecount);
                    msgitem.likecount = that.data.countlist[i].count;
                    j++;
                }
                if (j == 3)
                    return;

            }


        },

        getClick: function (gid) {

            var that = this;
            var uu = app.globalData.mainSrv + "?tp=click&id=" + gid;
             
            //这里有bug，就先这么着吧
            var getPostsRequest = wxRequest.getRequest(uu);
            getPostsRequest
                .then(response => {
                    
                    if (response.statusCode === 200) {
                        //   that.data.msg.liscount = res.data.clk;

                        that.data.countlist = response.data;
                        that.setData({
                            //  msg: that.data.msg,
                            countlist: that.data.countlist
                        });
                    //    console.log("audio audioPlay getClick  ", that.data.countlist);
                        for (var i = 0; i < that.data.chatMsg.length; i++) {
                            that.getCount(that.data.chatMsg[i]);
                        }
                        that.setData({
                            //  msg: that.data.msg,
                            chatMsg: that.data.chatMsg
                        });

                    }//200
                })
                .catch(function (response) {


                })
                .finally(function (response) {

                });
        },
        togglePlayAudio: function (e) {
            this.clickListen(e);
        },
        selectAvatar: function (event) {
            // this.build_group();
            /*   const data = event.currentTarget.dataset.data;
               console.log("selectAvatar   ####  ", data);
       
              
               wx.navigateTo({
                   url: '/pages/list/list?id=' + data.msg.info.from
                   // url: '/pages/icon/icon'
               })*/
        },


        /////////////////////////////////////////////////////////////////////////////////////////////

        clickBtn: function (event, type) {
            var self = this;
            var tt = 0, gid = 0;
            let myname = wx.getStorageSync("myUsername");
            let ur = wx.getStorageSync("DanbaId");
            var data;
            if (type == "clickShare") {
                data = event;
            }
            else
                data = event.currentTarget.dataset.data;
            console.log("clickBtn item  ",data);
            var uu = app.globalData.mainSrv + "?tp=" + type + "&gd=" + data.info.to + "&md=" + data.mid + "&ur=" + ur;
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

            var i = 0;
            var self = this;
            var data = event.currentTarget.dataset.data;
            
            //       console.log("clickFavor   ");
            let me = this;
            let item = data;
            let myUsername = wx.getStorageSync("DanbaId");//因为这个是要被用做唯一标识的，不能用
            let ll = wx.getStorageSync(myUsername + "-likedlist");
            for (; i < ll.length;i++) {
                let elem = ll[i];
                if ((elem.gid == item.groupid) && (elem.mid == item.mid)) {
                    //me.data.chatMsg.splice(index, 1)

                //    console.log("clickFavor  343434 ",elem.mid);
                //    console.log("clickFavor  343434 ",item.mid);
                    break;
                }
                
            }
        //    console.log("clickFavor  iiii  ",i);
        //    console.log("clickFavor  iiii  ",ll.length);
            if (i == ll.length) {
           //     item.like = "yes";
           //     item.likecount = 1;//item.likecount + 1;
         //  console.log("clickFavor  likecount ",item);
                var it = {};
                it.gid = item.groupid;
                it.mid = item.mid;
             //   
                if(ll.length == 0)
                {
                    ll = [];
                }
                ll.push(it);
                for(let j=0;j<me.data.chatMsg.length;j++){
                 //   console.log("data item  ",me.data.chatMsg[j]);
                    if(item.mid == me.data.chatMsg[j].mid){
                        me.data.chatMsg[j].like = "yes";
                        me.data.chatMsg[j].likecount = me.data.chatMsg[j].likecount+1;//item.likecount + 1;
                        break;
                    }
                }
             
                //     this.sendClick("Like",e.currentTarget.dataset.data);
                this.clickBtn(event, "clickLike");
            }
            else{
                console.log("clickFavor  likecount 444444444444");
             //   item.likecount = item.likecount + 1;
            }
       //     console.log("ll  ",me.data.chatMsg);
       //     console.log("item  ",item);
      //      console.log("ll  ",ll);
            me.setData({
              
                chatMsg: me.data.chatMsg
            });
            


            wx.setStorageSync(myUsername + "-likedlist", ll);



        },
        clickListen: function (event) {
            this.clickBtn(event, "clickListen");
            var i = 0;
            var me = this;
            var data = event.currentTarget.dataset.data;
            let item = data;
          //  data.listencount = data.listencount + 1;
          for(let j=0;j<me.data.chatMsg.length;j++){
            //   console.log("data item listen  ",me.data.chatMsg[j]);
               if(item.mid == me.data.chatMsg[j].mid){
                 
                   me.data.chatMsg[j].listencount = me.data.chatMsg[j].listencount+1;//item.likecount + 1;
                   break;
               }
           }

            me.setData({
                chatMsg: me.data.chatMsg
            });
        },
        
        clickShare: function (event) {

        },
        toggleShare: function (event) {
            this.clickBtn(event.data, "clickShare");
            var i = 0;
            var me = this;
            var data = event;
            console.log("data item share  ",data);
            let item = data.data;
         
          for(let j=0;j<me.data.chatMsg.length;j++){
               console.log("data item share  ",me.data.chatMsg[j]);
               if(item.mid == me.data.chatMsg[j].mid){
                 
                   me.data.chatMsg[j].sharecount = me.data.chatMsg[j].sharecount+1;//item.likecount + 1;
                   break;
               }
           }

            me.setData({
                chatMsg: me.data.chatMsg
            });

        },

        clickMsg(data) {
            //	console.log(1, data)
            if (data.currentTarget.dataset.msg.ext && data.currentTarget.dataset.msg.ext.msg_extension) {
                this.triggerEvent("clickMsg", data.currentTarget.dataset.msg.ext)
            }
        },
        normalScroll() {
            this.setData({
                view: LIST_STATUS.NORMAL
            });
        },

        shortScroll() {
            this.setData({
                view: LIST_STATUS.SHORT
            });
        },

        onTap() {
            this.triggerEvent("msglistTap", null, { bubbles: true });
        },

        previewImage(event) {
            var url = event.target.dataset.url;
            wx.previewImage({
                urls: [url]		// 需要预览的图片 http 链接列表
            });
        },

        getHistoryMsg() {
            //getmore 的时候调用
            let me = this
            console.log("chatMsg %%%%%%%%%%%%   ", chatMsg);
            let username = this.data.username;
            let myUsername = wx.getStorageSync("myUsername");
            let sessionKey = username.groupId ? username.groupId + myUsername : username.your + myUsername;
            let historyChatMsgs = wx.getStorageSync("rendered_" + sessionKey) || [];

            if (Index < historyChatMsgs.length) {
                let timesMsgList = historyChatMsgs.slice(-Index - 10, -Index);

                this.setData({
                    chatMsg: timesMsgList.concat(me.data.chatMsg),
                    toView: timesMsgList[timesMsgList.length - 1].mid,
                });
                me.getClick(me.data.username.groupId);
                //       console.log("chatMsg   ", chatMsg);
                Index += timesMsgList.length;
                if (timesMsgList.length == 10) {
                    page++
                }
                wx.stopPullDownRefresh()
            }
        },
        /////////////////////////////
        //////////////////////////////
        getAvatarUrl(msg) {
            let that = this;
            let mynm = wx.getStorageSync("DanbaId");
            //此msg.info.from为注册时的danbaid
         //   console.log("getAvatarUrl 111   ", msg.info.from);
            if (msg.info.from == mynm) {
                msg.avatarUrl = app.globalData.userInfo.avatarUrl;
           //     console.log("getAvatarUrl   ",  msg.avatarUrl);
                msg.yourname = app.globalData.userInfo.nickName;//自己发言，未注册不允许发言
                return;
            }


            //      console.log("audio return   ", res.data.clk);
            // console.log("msg list get avatar   ", msg.yourname + "  " + msg.info.from);
            /*      if (msg.yourname == msg.info.from) {//未授权,获取本地图片资源，比如商品图
                     //   msg.avatarUrl = app.getLocalResByID(res.data.avatarId);
                         app.getLocalResByID(msg);
                        
                    }
                    else {
                        //通过msg.danbaId获取本地存储的缓存头像，如果没有再去服务器找。
                      //  msg.avatarUrl = app.getAuthAvatarByID(msg.danbaId);
                          app.getAuthAvatarByID(msg);
                    }*/
            app.getAuthAvatarByID(msg, that);
            //  msg.showName = app.getShowName(msg.info.from);
            that.setData({
                chatMsg: that.data.chatMsg
            })



        },
        setAvatar: function () {

            this.setData({
                chatMsg: this.data.chatMsg
            })
        },

        ///////////////////////////////
        ///////////////////////////////////////////
        fetchGPRecord: function (tt, gid) {
            var that = this;
            //   let myname = wx.getStorageSync("myUsername");
            let myname = wx.getStorageSync("DanbaId");
            //获取首页的条目
            var uu = app.globalData.mainSrv + "?tp=recordfull&id=" + gid.toString() + "&tst=" + tt + "&ur=" + myname;

            ////////////////////////////////////

            var getPostsRequest = wxRequest.getRequest(uu);
            getPostsRequest
                .then(res => {
                    if (res.statusCode === 200) {
                        //  console.log('fetchGPRecord msglist ', res.data);

                        for (let i = 0; i < res.data.length; i++) {

                            if (res.data[i].type == 'count')
                                continue;

                            let recvMsg = {};
                            recvMsg.msg = {};
                            ////////////////
                            recvMsg.id = res.data[i].msg_id;

                            recvMsg.mid = res.data[i].msg_id;
                            recvMsg.width = 0;//res.data[i].width;
                            recvMsg.height = 0;//res.data[i].height;
                            recvMsg.filetype = '';//res.data[i].height;
                            recvMsg.mid = res.data[i].msg_id;
                            recvMsg.msg.length = Math.ceil(res.data[i].length / 1000);
                            recvMsg.length = Math.ceil(res.data[i].length / 1000);
                            recvMsg.from = res.data[i].chatfrom;
                            recvMsg.to = res.data[i].chatto;
                            recvMsg.type = 'groupchat';
                            recvMsg.ext = '';//res.data[i].payload.ext;
                            recvMsg.url = res.data[i].weburl;
                            recvMsg.msg.data = res.data[i].weburl;
                            recvMsg.data = res.data[i].content;
                            recvMsg.filename = '';
                            recvMsg.timestamp = parseInt(res.data[i].tstamp);
                            recvMsg.accessToken = res.data[i].accessToken;
                            recvMsg.msg.token = res.data[i].accessToken;
                            recvMsg.msg.likecount = 100;
                            recvMsg.msg.sharecount = 322;
                            let myUsername = wx.getStorageSync("DanbaId");//wx.getStorageSync("myUsername");

                            let sessionKey = (recvMsg.from == myUsername) ?
                                recvMsg.to + myUsername :
                                recvMsg.from + myUsername;
                            //     console.log("fetch session key 000 ", sessionKey);
                            /*        var date = new Date(parseInt(recvMsg.timestamp));
                                    
                                    var Hours = date.getHours();
                                    var Minutes = date.getMinutes();
                                    var Seconds = date.getSeconds();
                                    var time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + (Hours < 10 ? "0" + Hours : Hours) + ":" + (Minutes < 10 ? "0" + Minutes : Minutes) + ":" + (Seconds < 10 ? "0" + Seconds : Seconds);
                                    console.log("main date  ", recvMsg.timestamp);
                                    console.log("main date  ", time);*/
                            var historyChatMsgs = wx.getStorageSync("rendered_" + sessionKey) || [];
                            //     console.log("main historyChatMsgs ", historyChatMsgs);
                            //     console.log("main historyChatMsgs 000 ", recvMsg.type);
                            let j = 0;
                            //        console.log('fetchGPRecord  type ',recvMsg);
                            for (; j < historyChatMsgs.length; j++) {
                                if ((historyChatMsgs[j].mid == (recvMsg.type + recvMsg.id)) && (historyChatMsgs[j].msg.url == recvMsg.url) /*&& (time == historyChatMsgs[j].time)*/ && (recvMsg.from == historyChatMsgs[j].info.from) && (recvMsg.to == historyChatMsgs[j].info.to)) {
                                    //   console.log('recvMsg &&&&&&&&&&&&&&&&&  111  ', recvMsg.type);
                                    //    console.log('recvMsg &&&&&&&&&&&&&&&&&  ', time);
                                    break;//本地已有
                                }
                            }
                            //   historyChatMsgs = historyChatMsgs.concat(curChatMsg);
                            //    console.log("main historyChatMsgs 122 ", recvMsg.type);
                            if (j == historyChatMsgs.length) {
                                var historyMsgs = wx.getStorageSync(sessionKey) || [];
                                //  console.log("main historyChatMsgs rerer ", historyMsgs);
                                //   console.log("main historyChatMsgs rerer ", recvMsg);
                                let k = 0;
                                for (; k < historyMsgs.length; k++) {
                                    if ((historyMsgs[k].mid == (recvMsg.type + recvMsg.id)) && (historyMsgs[k].msg.url == recvMsg.url)
                                    /*&& (time == historyMsgs[k].time)*/ && (recvMsg.from == historyMsgs[k].info.from) && (recvMsg.to == historyMsgs[k].info.to)) {
                                        //     console.log('recvMsg &&&&&&&&&&&&&&&&&  ', recvMsg.type);
                                        //    console.log('recvMsg &&&&&&&&&&&&&&&&&  ', time);
                                        break;//本地已有
                                    }
                                }

                                if (k == historyMsgs.length) {
                                    //     console.log("main historyChatMsgs 232323 ", res.data[i].type);
                                    //   console.log("main historyChatMsgs 232323 ", recvMsg);
                                          console.log("main historyChatMsgs 232323  ", res.data[i].type);
                                    msgStorageSrv.saveReceiveMsg(recvMsg, res.data[i].type);
                                }

                            }




                        }//for

                    }//200
                })
                .catch(function (response) {


                })
                .finally(function (response) {
                    wx.hideLoading();

                });

        },


        //////////////////////////////


        renderMsg(renderableMsg, type, curChatMsg, sessionKey, isnew) {

            let me = this;
            let that = this;
            let myUsername = wx.getStorageSync("DanbaId");
       //     console.log('quchong ',curChatMsg.length);
          //  console.log("chatMsg @@@    ", me.data.chatMsg);
            if (curChatMsg.length >= 1) {
                //去重
                this.data.chatMsg.map(function (elem, index) {
                    curChatMsg.map(function (item, i) {
                        if (elem.mid == item.mid) {
                            //me.data.chatMsg.splice(index, 1)
                            curChatMsg.splice(i, 1);
                        }
                    })
                })
            }
         //   console.log('quchong 22 ',curChatMsg);
         //   if(curChatMsg.length == 0)
          //      return;
            var historyChatMsgs = wx.getStorageSync("rendered_" + sessionKey) || [];


            historyChatMsgs = historyChatMsgs.concat(curChatMsg);

            //     console.log('当前历史', curChatMsg);
         //       console.log('历史消息', historyChatMsgs);
            if (!historyChatMsgs.length) return;

            if (isnew == 'newMsg' && (curChatMsg.length > 0)) {
                
                curChatMsg[0].like = "no";
              //  console.log('chatMsg  @@@@@@@@@@@@   ', curChatMsg);
              //  console.log('chatMsg  @@@@@@@@@@@@   ', curChatMsg.length);
                that.getCount(curChatMsg[0]);
                
                me.getClick(me.data.username.groupId);
                me.getAvatarUrl(curChatMsg[0]);
                this.setData({
                    chatMsg: this.data.chatMsg.concat(curChatMsg[0]),
                    // 跳到最后一条
                    toView: historyChatMsgs[historyChatMsgs.length - 1].mid,
                });
            } else {
                me.data.chatMsg = historyChatMsgs.slice(-20);
                //    console.log('chatMsg  &&&&&&   ', me.data.chatMsg);//这里chatMsg赋的值
                let ll = wx.getStorageSync(myUsername + "-likedlist");
                

                for (let j = 0; j < me.data.chatMsg.length; j++) {
                    me.data.chatMsg[j].like = "no";

                    for (let k = 0; k < ll.length; k++) {
                        if ((ll[k].mid == me.data.chatMsg[j].mid) && (ll[k].gid == me.data.chatMsg[j].groupid)) {

                            me.data.chatMsg[j].like = "yes";
                        }
                    }
                    me.getAvatarUrl(me.data.chatMsg[j]);
                }
                me.getClick(that.data.username.groupId);
                this.setData({
                    chatMsg: me.data.chatMsg,
                    // 跳到最后一条
                    toView: historyChatMsgs[historyChatMsgs.length - 1].mid,
                });
            }


            wx.setStorageSync("rendered_" + sessionKey, historyChatMsgs);

            let chatMsg = wx.getStorageSync(sessionKey) || [];
        //    console.log('历史消息 222  ', chatMsg);
            chatMsg.map(function (item, index) {
                curChatMsg.map(function (item2, index2) {
                    if (item2.mid == item.mid) {
                        chatMsg.splice(index, 1)
                    }
                })
            })


            wx.setStorageSync(sessionKey, chatMsg);



          //      console.log("chatMsg $$$   ", me.data.chatMsg);

            //	wx.setStorageSync(sessionKey, null);
            Index = historyChatMsgs.slice(-10).length;
            wx.pageScrollTo({
                //  scrollTop: 9999,
                scrollTop: 5000,
                duration: 300,
            });
            this.triggerEvent('render');
            if (isFail) {
                this.renderFail(sessionKey)
            }
        },
        renderFail(sessionKey) {
            let me = this
            let msgList = me.data.chatMsg
            msgList.map((item) => {
                if (item.mid.substring(item.mid.length - 10) == curMsgMid.substring(curMsgMid.length - 10)) {
                    item.msg.data[0].isFail = true
                    item.isFail = true

                    me.setData({
                        chatMsg: msgList
                    })
                }
            })
            if (me.curChatMsg[0].mid == curMsgMid) {
                me.curChatMsg[0].msg.data[0].isShow = false;
                me.curChatMsg[0].isShow = false
            }
            wx.setStorageSync("rendered_" + sessionKey, msgList);
            isFail = false
        },
        onFullscreenchange(e){
			disp.fire('em.message.fullscreenchange', e.detail)
		}
    },
    



    //////////////////////////////

    // lifetimes
    created() {
    },
    attached() {
        this.__visibility__ = true;
        page = 0;
        Index = 0;
    },
    moved() { },
    detached() {
        this.__visibility__ = false;
    },
    ready(event) {
        let me = this;
        if (getApp().globalData.isIPX) {
            this.setData({
                isIPX: true
            })
        }
        let username = this.data.username;
        let myUsername = wx.getStorageSync("DanbaId");//因为这个是要被用做唯一标识的，不能用

        let sessionKey = username.groupId
            ? username.groupId + myUsername
            : username.your + myUsername;

     //   console.log('newChatMsg1 !!!!!! ');

    //  me.getClick(username.groupId);//按说应该等getclick执行完再执行下一个，先这样吧
    //    console.log('newChatMsg2 !!!!!! ');
    let chatMsg = wx.getStorageSync(sessionKey) || [];
   //console.log('newChatMsg2 !!!!!! ',chatMsg);
    this.renderMsg(null, null, chatMsg, sessionKey);
    wx.setStorageSync(sessionKey, null);
   
        this.fetchGPRecord(0, username.groupId);
       
   //     console.log('newChatMsg3 !!!!!! ');
        
        //    
       
        //   console.log('chatMsg  @@@@@@@@@@@@   ', chatMsg);
        //    console.log('chatMsg  @@@@@@@@@@@@   ', sessionKey);
    //    console.log('newChatMsg3 !!!!!! ');

        
        //这段只能在这里，只需要初始执行一次
        for(let i=0;i<getApp().globalData.groupList.length;i++ )
			{
				 if( getApp().globalData.groupList[i].groupid == this.data.username.groupId)
				 {
					this.setData({
                        groupImage:getApp().globalData.groupList[i].post_thumbnail_image,
                        Describe:getApp().globalData.groupList[i].describe
                    });
                  //  console.log('msglist  @@@@@@@@@@@@   ', this.data.groupImage);
					break;
				 }
			}

        




            disp.on('em.xmpp.error.sendMsgErr', function(errMsgs) {
                // curMsgMid = err.data.mid
                isFail = true
                // return
                let msgList = me.data.chatMsg
                msgList.map((item) =>{
                    for( let item2 in errMsgs){
                        if (item.mid.substring(item.mid.length - 10) == item2.substring(item2.length - 10)) {
                            item.msg.data[0].isFail = true
                            item.isFail = true
    
                            me.setData({
                                chatMsg: msgList
                            })
                        }
                    
                    }
                })
                // if (me.curChatMsg[0].mid == curMsgMid) {
                    // me.curChatMsg[0].msg.data[0].isShow = false;
                    // me.curChatMsg[0].isShow = false
                // }
                wx.setStorageSync("rendered_" + sessionKey, msgList);
                // disp.fire('em.megList.refresh')
            });

        msgStorage.on("newChatMsg", function (renderableMsg, type, curChatMsg, sesskey) {
        //    console.log('newChatMsg !!!!!! ', renderableMsg);
            me.curChatMsg = curChatMsg;
                 
            if (!me.__visibility__) return;
          //    console.log('newChatMsg !!!!!! ', sesskey + '  ' + sessionKey);
            // 判断是否属于当前会话
            if (username.groupId) {
                // 群消息的 to 是 id，from 是 name
                if (renderableMsg.info.from == username.groupId || renderableMsg.info.to == username.groupId) {
                    if (sesskey == sessionKey) {
                        me.renderMsg(renderableMsg, type, curChatMsg, sessionKey, 'newMsg');
                    }

                }
            }
            else if (renderableMsg.info.from == username.your || renderableMsg.info.to == username.your) {
                if (sesskey == sessionKey) {
                    me.renderMsg(renderableMsg, type, curChatMsg, sessionKey, 'newMsg');
                }
            }

        });

        /////////////////////////////////////////////////////////////
        msgStorageSrv.on("newShareAudio", function(event){
            console.log('newShareAudio !!!!!! ', event);
            me.toggleShare(event);
        });
        msgStorageSrv.on("newChatMsg", function (renderableMsg, type, curChatMsg, sesskey) {
            me.curChatMsg = curChatMsg;
            if (!me.__visibility__) return;
           //     console.log('newChatMsgSrv !!!!!! ', renderableMsg);
          //      return;
            // 判断是否属于当前会话
            if (username.groupId) {
                // 群消息的 to 是 id，from 是 name
                if (renderableMsg.info.from == username.groupId || renderableMsg.info.to == username.groupId) {
                 //   console.log('newChatMsgSrv 222 !!!!!! ', renderableMsg);
                 //   console.log('newChatMsgSrv 222 !!!!!! ', sesskey);
                 //   console.log('newChatMsgSrv 222 !!!!!! ', sessionKey);
                    if (sesskey == sessionKey) {
                        
                        me.renderMsg(renderableMsg, type, curChatMsg, sessionKey, 'newMsg');
                    }

                }
            }
            else if (renderableMsg.info.from == username.your || renderableMsg.info.to == username.your) {
                if (sesskey == sessionKey) {
                    me.renderMsg(renderableMsg, type, curChatMsg, sessionKey, 'newMsg');
                }
            }

        });


    },
});
