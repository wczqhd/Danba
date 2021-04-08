//require("sdk/libs/strophe");
let WebIM = wx.WebIM = require("utils/WebIM")["default"];
let msgStorage = require("comps/chat/msgstorage");
let msgType = require("comps/chat/msgtype");
let ToastPannel = require("./comps/toast/toast");
let disp = require("utils/broadcast");

let logout = false;

var utilMd5 = require('./utils/md5.js');
//var AV = require('./libs/av-weapp-min.js');
//const emedia = wx.emedia = require("./emedia/emedia_for_miniProgram")

function ack(receiveMsg) {
  // 处理未读消息回执
  var bodyId = receiveMsg.id; // 需要发送已读回执的消息id
  var ackMsg = new WebIM.message("read", WebIM.conn.getUniqueId());
  ackMsg.set({
    id: bodyId,
    to: receiveMsg.from
  });
  WebIM.conn.send(ackMsg.body);
}

function onMessageError(err) {
  if (err.type === "error") {
    wx.showToast({
      title: err.errorText
    });
    return false;
  }
  return true;
}

function getCurrentRoute() {
  let pages = getCurrentPages();
	if (pages.length > 0) {
		let currentPage = pages[pages.length - 1];
		return currentPage.route;
	}
	return '/'
}

/*function calcUnReadSpot(message) {
  let myName = wx.getStorageSync("myUsername");
  let members = wx.getStorageSync("member") || []; //好友
  var listGroups = wx.getStorageSync('listGroup') || []; //群组
  let allMembers = members.concat(listGroups)
  let count = allMembers.reduce(function (result, curMember, idx) {
    let chatMsgs;
    if (curMember.groupid) {
      chatMsgs = wx.getStorageSync(curMember.groupid + myName.toLowerCase()) || [];
    } else {
      chatMsgs = wx.getStorageSync(curMember.name.toLowerCase() + myName.toLowerCase()) || [];
    }

    return result + chatMsgs.length;
  }, 0);
  getApp().globalData.unReadMessageNum = count;
  disp.fire("em.xmpp.unreadspot", message);
}*/
// 包含陌生人版本
function calcUnReadSpot(message){
	let myName = wx.getStorageSync("myUsername");
	wx.getStorageInfo({
		success: function(res){
			let storageKeys = res.keys
			let newChatMsgKeys = [];
			let historyChatMsgKeys = [];
			storageKeys.forEach((item) => {
				if (item.indexOf(myName) > -1 && item.indexOf('rendered_') == -1) {
					newChatMsgKeys.push(item)
				}
			})
			let count = newChatMsgKeys.reduce(function(result, curMember, idx){
				let chatMsgs;
				chatMsgs = wx.getStorageSync(curMember) || [];
				return result + chatMsgs.length;
			}, 0)

			getApp().globalData.unReadMessageNum = count;
			disp.fire("em.xmpp.unreadspot", message);
		}
	})
}

function saveGroups(){
	var me = this;
	return WebIM.conn.getGroup({
		limit: 50,
		success: function(res){
			wx.setStorage({
				key: "listGroup",
				data: res.data
			});
		},
		error: function(err){
			console.log(err)
		}
	});
}

App({
  ToastPannel,
  globalData: {
    unReadMessageNum: 0,
    userInfo: null,
    saveFriendList: [],
    groupList: [],
    roomData: [],
    goods: [],
      saveGroupInvitedList: [],
    isIPX: false, //是否为iphone X
    aid: -1,
    selectsinger: null,
    currentIndex: 0,
    fullScreen: false,
    songlist: [],
    playing: false,
    innerAudioContext: null,
    mainSrv: 'https://www.tingwx.com/index/',
    wxAuth: false,
    gAvatarMap: new Map(),
    gNickMap: new Map(),
    customerinfo: '20190726yd',
    bdToken:''



  },


  audioDom: wx.getBackgroundAudioManager(),
  initAudio() {
    this.audioDom.title = '';
    this.audioDom.epname = '';
    this.audioDom.singer = '';
    this.audioDom.coverImgUrl = './images/danba.png';
    this.audioDom.paused = true;
    this.audioDom.stop = true;
  },


  /////////////////////////
  conn: {
    closed: false,
    curOpenOpt: {},
    open(opt) {
      wx.showLoading({
        title: '正在初始化客户端...',
        mask: true
      })
      this.curOpenOpt = opt;
      WebIM.conn.open(opt);
      this.closed = false;
    },
    reopen() {
      if (this.closed) {
        //this.open(this.curOpenOpt);
        WebIM.conn.open(this.curOpenOpt);
        this.closed = false;
      }
    }
  },

  // getPage(pageName){
  // 	var pages = getCurrentPages();
  // 	return pages.find(function(page){
  // 		return page.__route__ == pageName;
  // 	});
  // },

  register: function () {
    //   console.log("register!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    /*  var that = this;
      if (that.globalData.userInfo == null) {
        console.log("that.globalData.userInfo == null");
       return;
      }
      else*/
    var now = new Date();
    var year = now.getFullYear(); //得到年份
    var month = now.getMonth(); //得到月份
    var date = now.getDate(); //得到日期
    var day = now.getDay(); //得到周几
    var hour = now.getHours(); //得到小时
    var minu = now.getMinutes(); //得到分钟
    var sec = now.getSeconds(); //得到秒
    var ms = now.getMilliseconds(); //获取毫秒
    month = month + 1;
    if (month < 10) month = "0" + month;
    else month = "" + month;
    if (date < 10) date = "0" + date;
    if (hour < 10) hour = "0" + hour;
    if (minu < 10) minu = "0" + minu;
    if (sec < 10) sec = "0" + sec;
    if (ms < 100) ms = "0" + ms;
    var tm = "";
    tm = 'DanBa' + year + month + date + hour + minu + sec + ms;
    console.log("loading!!!!!!!!!!", tm);
    //    console.log('获取登录 Code：' + data.code)


    var options = {
      apiUrl: WebIM.config.apiURL,
      /*  username: that.globalData.userInfo.nickName,
        password: that.globalData.userInfo.nickName + 'pwd',
        nickname: that.globalData.userInfo.nickName,*/
      username: tm,
      password: tm + 'pwd',
      nickname: tm,

      appKey: WebIM.config.appkey,
      success: function (res) {


     //   if (res.statusCode == "200") 
     {


          // console.log('data',data)


          wx.setStorageSync("DanbaId",
            tm
          );
          wx.setStorageSync("myUsername", tm);
          //   wx.setStorageSync("myAvatarUrl", );
          var opt = {
            apiUrl: WebIM.config.apiURL,
            user: tm,
            pwd: tm + 'pwd',
            grant_type: "password",
            appKey: WebIM.config.appkey
          };
          WebIM.conn.open(opt);
          console.log('register switch  !!!');
          setTimeout(function () {
            wx.switchTab({
              url: '../index/index',
            });
          }, 3000);


        }
      },
     /*error: function (res) {
      //  if (res.statusCode !== "200") 
      {
     
          if (res.statusCode == '400' && res.data.error == 'illegal_argument') {
            wx.showModal({
              title: "用户名非法！！",
              showCancel: false,
              confirmText: "OK"
            });
						return ;
					}
					wx.showModal({
            title: "用户名已被占用！！！！",
            showCancel: false,
            confirmText: "OK"
          });

        }
      }*/
      error: function(res){
        console.log('注册失败', res)
        if (res.statusCode == '400' && res.data.error == 'illegal_argument') {
          if (res.data.error_description === 'USERNAME_TOO_LONG') {
                          return that.toastFilled('用户名超过64个字节！')
                      }
          return that.toastFilled('用户名非法!')
        }else if (res.data.error === 'duplicate_unique_property_exists') {
                      return that.toastFilled('用户名已被占用!')
                  }else if (res.data.error === 'unauthorized') {
                      return that.toastFilled('注册失败，无权限！')
                  } else if (res.data.error === 'resource_limited') {
                      return that.toastFilled('您的App用户注册数量已达上限,请升级至企业版！')
                  }else{
                    return that.toastFilled('注册失败')
                  }
        
      }
    };


    WebIM.conn.registerUser(options);


  },
    /*小程序主动更新
   */
  updateManager() {
    if (!wx.canIUse('getUpdateManager')) {
      return false;
    }
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {});
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '有新版本',
        content: '新版本已经准备好，即将重启',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      });
    });
    updateManager.onUpdateFailed(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败',
        showCancel: false
      })
    });
  },


  onLaunch() {
    // 调用 API 从本地缓存中获取数据
  /*  AV.init({ 
      appId: 'EUb9UqdrMRHQlW7iAG3g7PXd-gzGzoHsz', 
      appKey: 'd48Y2pPjEFcwqkqHIjic7d2M', 
      serverURLs: "https://eub9uqdr.lc-cn-n1-shared.com"
  });*/
      wx.setInnerAudioOption({
          obeyMuteSwitch: false
      });
    var me = this;
    var logs = wx.getStorageSync("logs") || [];
    logs.unshift(Date.now());
    wx.setStorageSync("logs", logs);

   
    ////////////////////////////
    this.updateManager();
      wx.getSystemInfo({
          success: e => {
              this.globalData.StatusBar = e.statusBarHeight;
              let custom = wx.getMenuButtonBoundingClientRect();
              this.globalData.Custom = custom;
              this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
          }
      });


 



    ////////////////////////////


  //  this.getRecommenData();
      wx.onNetworkStatusChange(function (res) {
          //alert(res.isConnected)
          console.log(res.networkType)
      });

    ///////////////////////////////
    /* wx.login({
       success: res => {
         // 发送 res.code 到后台换取 openId, sessionKey, unionId
       }
     })*/
     me.getBDToken();

      wx.getSystemInfo({
          success: e => {
              this.globalData.StatusBar = e.statusBarHeight;
              let custom = wx.getMenuButtonBoundingClientRect();
              this.globalData.Custom = custom;
              this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
          }
      });


    ////////////////////////////////
    // 
    disp.on("em.main.ready", function () {
      calcUnReadSpot();
    });
    disp.on("em.chatroom.leave", function () {
      calcUnReadSpot();
    });
    disp.on("em.chat.session.remove", function () {
      calcUnReadSpot();
    });

    disp.on('em.main.deleteFriend', function () {
      calcUnReadSpot()
    });
    disp.on('em.chat.audio.fileLoaded', function () {
      calcUnReadSpot()
    });
    disp.on('em.chat.audio.fileLoaded', function () {
      calcUnReadSpot()
    });

    // 
    WebIM.conn.listen({
      onOpened(message) {
     //   WebIM.conn.setPresence();

        if ((getCurrentRoute() == "pages/loading/loading") || (getCurrentRoute() == "pages/index/index")) {
          me.onLoginSuccess(wx.getStorageSync("myUsername").toLowerCase());
        }
        let identityToken = WebIM.conn.context.accessToken
        let identityName = WebIM.conn.context.jid
      },
      onReconnect() {
        wx.showToast({
          title: "重连中...",
          duration: 2000
        });
      },
      onSocketConnected() {
        wx.showToast({
          title: "socket连接成功",
          duration: 2000
        });
      },
      onClosed() {
       /* wx.showToast({
          title: "网络已断开",
          icon: 'none',
          duration: 2000
        });*/
        wx.redirectTo({
          url: "../loading/loading"
        });
        me.conn.closed = true;
        WebIM.conn.close();

      },
      onInviteMessage(message) {
        me.globalData.saveGroupInvitedList.push(message);
        disp.fire("em.xmpp.invite.joingroup", message);
        // wx.showModal({
        // 	title: message.from + " 已邀你入群 " + message.roomid,
        // 	success(){
        // 		disp.fire("em.xmpp.invite.joingroup", message);
        // 	},
        // 	error(){
        // 		disp.fire("em.xmpp.invite.joingroup", message);
        // 	}
        // });
      },
      onReadMessage(message) {
        //console.log('已读', message)
      },
      onPresence(message) {
        //console.log("onPresence", message);
        switch (message.type) {
          case "unsubscribe":
            // pages[0].moveFriend(message);
            break;
            // 好友邀请列表
          case "subscribe":
            if (message.status === "[resp:true]") {

            } else {
              // pages[0].handleFriendMsg(message);
              for (let i = 0; i < me.globalData.saveFriendList.length; i++) {
                if (me.globalData.saveFriendList[i].from === message.from) {
                  me.globalData.saveFriendList[i] = message
                  disp.fire("em.xmpp.subscribe");
                  return;
                }
              }
              me.globalData.saveFriendList.push(message);
              disp.fire("em.xmpp.subscribe");
            }
            break;
          case "subscribed":
            wx.showToast({
              title: "添加成功",
              duration: 1000
            });
            disp.fire("em.xmpp.subscribed");
            break;
          case "unsubscribed":
            // wx.showToast({
            // 	title: "已拒绝",
            // 	duration: 1000
            // });
            setTimeout(() => {
              wx.showToast({
                title: message.from + "已拒绝",
                duration: 2000
              });
            }, 1500);
            disp.fire("em.xmpp.unsubscribed");
            break;
          case "direct_joined":
              saveGroups();
              wx.showToast({
                title: "已进群",
                duration: 1000
              });
              break;
          case "memberJoinPublicGroupSuccess":
            saveGroups();
            wx.showToast({
              title: "已进群",
              duration: 1000
            });
            break;
          case 'invite':
					let info = message.from + '邀请你加入群组'
					wx.showModal({
					  title: '提示',
					  content: info,
					  success (res) {
					    if (res.confirm) {
					      console.log('用户点击确定')
					      WebIM.conn.agreeInviteIntoGroup({
					      	invitee: WebIM.conn.context.userId,
							groupId: message.gid,
							success: () => {
								saveGroups();
								console.log('加入成功')
							}
					      })
					    } else if (res.cancel) {
					      console.log('用户点击取消')
					      WebIM.conn.rejectInviteIntoGroup({
					      	invitee: WebIM.conn.context.userId,
							groupId: message.gid
					      })
					    }
					  }
					})
					break;
            // 好友列表
            // case "subscribed":
            // 	let newFriendList = [];
            // 	for(let i = 0; i < me.globalData.saveFriendList.length; i++){
            // 		if(me.globalData.saveFriendList[i].from != message.from){
            // 			newFriendList.push(me.globalData.saveFriendList[i]);
            // 		}
            // 	}
            // 	me.globalData.saveFriendList = newFriendList;
            // 	break;
            // 删除好友
          case "unavailable":
            disp.fire("em.xmpp.contacts.remove");
            disp.fire("em.xmpp.group.leaveGroup", message);
            break;

          case 'deleteGroupChat':
            disp.fire("em.xmpp.invite.deleteGroup", message);
            break;

          case "leaveGroup":
            disp.fire("em.xmpp.group.leaveGroup", message);
            break;

          case "removedFromGroup":
            disp.fire("em.xmpp.group.leaveGroup", message);
            break;

            // case "joinChatRoomSuccess":
            // 	wx.showToast({
            // 		title: "JoinChatRoomSuccess",
            // 	});
            // 	break;
            // case "memberJoinChatRoomSuccess":
            // 	wx.showToast({
            // 		title: "memberJoinChatRoomSuccess",
            // 	});
            // 	break;
            // case "memberLeaveChatRoomSuccess":
            // 	wx.showToast({
            // 		title: "leaveChatRoomSuccess",
            // 	});
            // 	break;

          default:
            break;
        }
      },

      onRoster(message) {
        // let pages = getCurrentPages();
        // if(pages[0]){
        // 	pages[0].onShow();
        // }
      },

      onVideoMessage(message) {
        console.log("onVideoMessage: ", message);
        if (message) {
          msgStorage.saveReceiveMsg(message, msgType.VIDEO);
        }
        calcUnReadSpot(message);
        ack(message);
      },

      onAudioMessage(message) {
        console.log("onAudioMessage", message);
        if (message) {
          if (onMessageError(message)) {
            msgStorage.saveReceiveMsg(message, msgType.AUDIO);
          }
          calcUnReadSpot(message);
          ack(message);
        }
      },

      onCmdMessage(message) {
        console.log("onCmdMessage", message);
        if (message) {
          if (onMessageError(message)) {
            msgStorage.saveReceiveMsg(message, msgType.CMD);
          }
          calcUnReadSpot(message);
          ack(message);
        }
      },

      // onLocationMessage(message){
      // 	console.log("Location message: ", message);
      // 	if(message){
      // 		msgStorage.saveReceiveMsg(message, msgType.LOCATION);
      // 	}
      // },

      onTextMessage(message) {
        console.log("onTextMessage", message);
        if (message) {
          if (onMessageError(message)) {
            msgStorage.saveReceiveMsg(message, msgType.TEXT);
          }
          calcUnReadSpot(message);
          ack(message);

          if (message.ext.msg_extension) {
            let msgExtension = JSON.parse(message.ext.msg_extension)
            let conferenceId = message.ext.conferenceId
            let password = message.ext.password
            disp.fire("em.xmpp.videoCall", {
              msgExtension: msgExtension,
              conferenceId: conferenceId,
              password: password
            });
          }
        }
      },

      onEmojiMessage(message) {
        console.log("onEmojiMessage", message);
        if (message) {
          if (onMessageError(message)) {
            msgStorage.saveReceiveMsg(message, msgType.EMOJI);
          }
          calcUnReadSpot(message);
          ack(message);
        }
      },

      onPictureMessage(message) {
        console.log("onPictureMessage", message);
        if (message) {
          if (onMessageError(message)) {
            msgStorage.saveReceiveMsg(message, msgType.IMAGE);
          }
          calcUnReadSpot(message);
          ack(message);
        }
      },

      onFileMessage(message) {
        console.log('onFileMessage', message);
        if (message) {
          if (onMessageError(message)) {
            msgStorage.saveReceiveMsg(message, msgType.FILE);
          }
          calcUnReadSpot(message);
          ack(message);
        }
      },

      // 各种异常
      onError(error) {

        // 16: server-side close the websocket connection
        console.log(error)

        if (error.type == 40) { //send msg fail
					disp.fire("em.xmpp.error.sendMsgErr", error.failMsgs);
				}

        if (error.type == WebIM.statusCode.WEBIM_CONNCTION_DISCONNECTED && !logout) {
          if (WebIM.conn.autoReconnectNumTotal >= WebIM.conn.autoReconnectNumMax) {
           
          wx.showToast({
            title: "server-side close the websocket connection",
            duration: 1000
          });
          WebIM.conn.close();
          wx.redirectTo({
            url: "../loading/loading"
          });
          logout = true
        }
          return;
        }
        // 8: offline by multi login
        if (error.type == WebIM.statusCode.WEBIM_CONNCTION_SERVER_ERROR) {
          wx.showToast({
            title: "offline by multi login",
            duration: 1000
          });
          wx.redirectTo({
            url: "../loading/loading"
          });
          
					}
				
        
        if (error.type == WebIM.statusCode.WEBIM_CONNCTION_OPEN_ERROR) {
          wx.hideLoading()
          disp.fire("em.xmpp.error.passwordErr");
          // wx.showModal({
          // 	title: "用户名或密码错误",
          // 	confirmText: "OK",
          // 	showCancel: false
          // });
          me.register();
        }
        if (error.type == WebIM.statusCode.WEBIM_CONNCTION_AUTH_ERROR) {
          wx.hideLoading()
          disp.fire("em.xmpp.error.tokenErr");
        }
        if (error.type == 16) {///sendMsgError
					// https://developers.weixin.qq.com/community/develop/doc/00084a400202787b54f8c9e6357800
					// 因为上面的原因 这里不要一直提示了
					return; 
					console.log('socket_errorsocket_error', error)
					wx.showToast({
						title: "网络已断开",
						icon: 'none',
						duration: 2000
					});
					disp.fire("em.xmpp.error.sendMsgErr", error);
				}
      },
    });
    this.checkIsIPhoneX();
  },
  onShow(){
		// 从搜索页面进的时候退出后再回来会回到首页，此时并没有调用退出，导致登录不上
    // 判断当前是登录状态直接跳转到chat页面
    //环信的处理，我先不管
	/*	const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		// 选择图片或者拍照也会触发onShow，所以忽略聊天页面
		if (WebIM.conn.isOpened() && currentPage.route != "pages/chatroom/chatroom" && currentPage.route != "pages/groupChatRoom/groupChatRoom") {
			let myName = wx.getStorageSync("myUsername");
			wx.redirectTo({
				url: "../chat/chat?myName=" + myName
			});
		}*/
	},
   /* onUnload() {
      WebIM.conn.close();
      WebIM.conn.stopHeartBeat();
      wx.redirectTo({
        url: "../loading/loading?myName=" + myName
      });
    },*/
  str2utf8: function (str) {
    return str.replace(/[^\u0000-\u00FF]/g, function ($0) {
      return escape($0).replace(/(%u)(\w{4})/gi, "&#x$2;")
    });
  },
  getRecommenData: function () {
    const _that = this;


    let app_key = "7c31345534fed6fd545cc9284aeeef02";
    let app_secret = "5a104744f31e427abe8e7e5aa95ec2dd";

    var myDate = new Date();

    var yr = 1900 + myDate.getYear();
    var mn = myDate.getMonth() + 1;
    var d = yr + '-' + mn + '-' + myDate.getDate() + ' ' + myDate.getHours() + ':' + myDate.getMinutes() + ':' + myDate.getSeconds();
    var pd = app_secret + 'app_key' + app_key + 'formatjsonmethodjd.union.open.goods.jingfen.query' + 'param_json{"goodsReq":{"eliteId":11,"pageIndex":1,"pageSize":20,"sort":"desc","sortName":"price"}}' + 'sign_methodmd5timestamp' + d + 'v1.0' + app_secret;
    let sn = utilMd5.hexMD5(pd);
    sn = sn.toUpperCase();
    var urls = "https://router.jd.com/api";
    // urls = urls + '7c31345534fed6fd545cc9284aeeef02' + '&sign_method=md5&format=json&timestamp=' + d + '&sign=' + sn ;
    //  console.log("req data  ", d + '  ' + pd.length);
    // console.log("req data  ", sn);
    urls = urls + '?sign=' + _that.str2utf8(sn) + '&' + 'app_key=' + _that.str2utf8(app_key) + '&format=json&method=jd.union.open.goods.jingfen.query&' + 'param_json=' + _that.str2utf8('{"goodsReq":{"eliteId":11,"pageIndex":1,"pageSize":20,"sort":"desc","sortName":"price"}}') + '&sign_method=md5&timestamp=' + _that.str2utf8(d) + '&v=1.0';
    //  console.log("req data  ", urls);
    wx.request({
      url: urls,
      header: {
        'content-type': 'application/json;charset-utf-8'
      },


      success: function (res) {


        if (res.statusCode === 200) {
          //    var res1 = res.data.replace("callback(", "")


          var res2 = JSON.parse(res.data.jd_union_open_goods_jingfen_query_response.result);
          //   console.log('rep data ',res2.data[0]);

          for (let i = 0, j = 0; i < res2.data.length; j++, i++) {
            let sd = {};
            sd.id = res2.data[i].skuId;
            sd.linkUrl = 'http://' + res2.data[i].materialUrl;
            sd.picUrl = res2.data[i].imageInfo.imageList[0].url;
            _that.globalData.goods[j] = sd;
            //  i = i + 3;
          }

          //   console.log("slider  ", _that.data.slider);

        }
      }
    })
  },
  setAvatarNormal: function () {
    let ph = "../../../images/theme@2x.png";
    wx.setStorageSync("myAvatarUrl", ph);
  },

  getLocalResByID: function (msg) {
   /* let me = this;
    let rdn = util.randomNum(me.globalData.goods.length - 1)
    // console.log("app goods @@@@   ", rdn);
    // console.log("app goods @@@@   ", me.globalData.goods.length  );
    msg.avatarUrl = me.globalData.goods[rdn].picUrl;
    msg.linkUrl = me.globalData.goods[rdn].linkUrl;*/

  },
  getAuthAvatarByID: function (msg,ff) {
    //已授权的，用微信的
    let me = this;
    let item = me.globalData.gAvatarMap.get(msg.info.from);
    console.log("getAuthAvatarByID   ",item);
    if (item == null) { //本地没存
      var uu = me.globalData.mainSrv + "?tp=getavatar&&ur=" + msg.info.from;

      //这里有bug，就先这么着吧
      wx.request({
        url: uu,
        header: {
          'content-type': 'application/json;charset-utf-8'
        },
        success: function (res) {
          if (res.statusCode === 200) {
                  console.log("getAuthAvatarByID   ");
            //    console.log("audio return   ", that.data.chatMsg);
            if (res.data.type == 2) { //已授权
              msg.avatarUrl = res.data.weburl;
              msg.yourname = res.data.user_nickname;
              me.globalData.gAvatarMap.set(msg.info.from, msg.avatarUrl);
              me.globalData.gNickMap.set(msg.info.from, msg.yourname);
              
            }

          }
        }
      });
    } else {
      msg.avatarUrl = item;
      msg.yourname = me.globalData.gNickMap.get(msg.info.from)
    }
    msg.linkUrl = '';
    ff.setAvatar();
  },
  getIfAuth: function () {
 /*   let a = wx.getStorageSync("myUsername");
    let b = wx.getStorageSync("DanbaId");

    return a != b;*/

  },
  sendOperation(oper){
    let me = this;
   
    let ur = wx.getStorageSync("DanbaId");
    //    var uu = app.globalData.mainSrv + "?tp=list&id=" + gid.toString() + "&tst=" + tt + "&ur=" + ur;
    var uu = me.globalData.mainSrv + "?tp=oper&id=" + ur + "&oper=" + oper;
     

      //这里有bug，就先这么着吧
      wx.request({
        url: uu,
        header: {
          'content-type': 'application/json; charset=UTF-8'
        },
        method: 'GET',
        
        success: function (res) {
          
          
        }
      });

  },
  getBDToken: function () {
    let me = this;
    console.log("getBDToken %%%  ");
    let ur = wx.getStorageSync("DanbaId");
    //    var uu = app.globalData.mainSrv + "?tp=list&id=" + gid.toString() + "&tst=" + tt + "&ur=" + ur;
    var uu = me.globalData.mainSrv + "?tp=bdtoken&id=" + ur;
     

      //这里有bug，就先这么着吧
      wx.request({
        url: uu,
        header: {
          'content-type': 'application/json; charset=UTF-8'
        },
        method: 'GET',
        
        success: function (res) {
          console.log("getBDToken   ", res);
          if (res.statusCode === 200) {
            me.globalData.bdToken = res.data.token;
            
          }
        }
      });

  },
  getShenHeTxt: function (msg,ff) {
    //已授权的，用微信的
    let me = this;
   
    console.log("getShenHeTxt   ", me.globalData.bdToken);
      var uu = "https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined" + "?access_token=" + me.globalData.bdToken;

      //这里有bug，就先这么着吧
      wx.request({
        url: uu,
        header: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'POST',
        data: {
          'text': msg
          
        },
        success: function (res) {
          console.log("getShenHeTxt   ", res);
          if (res.data.conclusion === "合规") {
            ff();
       }
       else if(res.data.conclusion === "不合规"){
         wx.showToast({
           title: "标题和描述含有不合规内容！",
           duration: 1000
         });

       }
       else{
         wx.showToast({
           title: "网络不太好，待会再试试",
           duration: 1000
         });
       }
        }
      });
   
    
  },
  getShenHeImg: function (path,ff) {
    //已授权的，用微信的
    let me = this;
   
   
      var uu = "https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined" + "?access_token=" + me.globalData.bdToken;

      let base641 = wx.getFileSystemManager().readFileSync(path, 'base64');

      //这里有bug，就先这么着吧
      wx.request({
        url: uu,
        header: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        method: 'POST',
        data: {
          'image': base641
          
        },
        success: function (res) {
          console.log("getShenHeImg   ", res);
          if (res.data.conclusion === "合规") {
               ff();
          }
          else if(res.data.conclusion === "不合规"){
            wx.showToast({
              title: "图片不合规！",
              duration: 1000
            });

          }
          else{
            wx.showToast({
              title: "网络不太好，待会再试试",
              duration: 1000
            });
          }
        }
      });
   
    
  },
  getUserInfo: function () {
    let me = this;
    let b = wx.getStorageSync("DanbaId");
    wx.login({
  success (res) {
    if (res.code) {
      //发起网络请求
      var uu = me.globalData.mainSrv + "?tp=code&&ur=" +b+"&code=" + res.code;

      //这里有bug，就先这么着吧
      wx.request({
        url: uu,
        header: {
          'content-type': 'application/json;charset-utf-8'
        },
        success: function (res) {
          if (res.statusCode === 200) {
               //   console.log("code return   ");
            //    console.log("audio return   ", that.data.chatMsg);
           

          }
        }
      });
  //    console.log('wx code ！' + res.code);
    } else {
      console.log('wx登录失败！' + res.errMsg);
    }
  }
})
    wx.getSetting({
      success: function (res) {
    //    console.log(' wx.getSetting   ', res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              //   console.log(res.userInfo)
           //      console.log("app.globalData.userInfo =    ", res.userInfo);
              me.globalData.userInfo = res.userInfo;
              wx.setStorageSync("myUsername", me.globalData.userInfo.nickName);
              //  me.globalData.wxAuth = true;


              ///////////////////////
              //  console.log('that.globalData.userInfo    ', app.globalData.userInfo);
              //考虑到服务器压力，头像暂时不比较是否变化了


            }
          })
        }
      }
    });

  },
  onLoginSuccess: function (myName) {
    let me = this;
    //	wx.hideLoading();
    setTimeout(() => {
      wx.hideLoading();
    }, 100);

    //已微信授权，获取最新信息
    me.getUserInfo();



    wx.switchTab({
      url: '../index/index',
    });


    /*	wx.redirectTo({
    //  url: "../index/index"
		//	url: "../chat/chat?myName=" + myName
		// url: "../groupChatRoom/groupChatRoom?myName=" + myName
      url: "../test2/test2"
		//url: "../groups/groups?myName=" + myName
		});*/
  },


  checkIsIPhoneX: function () {
    const me = this
    wx.getSystemInfo({
      success: function (res) {
        // 根据 model 进行判断
        if (res.model.search('iPhone X') != -1) {
          me.globalData.isIPX = true
        }
      }
    })
  },

});