
const app = getApp();
var WebIM = require("../../utils/WebIM")["default"];
let RecordStatus = require("../../comps/chat/inputbar/suit/audio/record_status").RecordStatus;
//   const app = getApp().globalData

let msgStorage = require("../../comps/chat/msgstorage");
let msgType = require("../../comps/chat/msgtype");
let disp = require("../../utils/broadcast");
var wxRequest = require('../../utilswm/wxRequest.js');


Page({
 
  data: {
    height: 40,
    t_Deslength:0,
    t_Namelength:0,
    primarySize: 'mini', //按钮的尺寸为小尺寸
   
    // 背景图片
    background1: "/images/user1.png",
    background2: "/images/iphone.png",
      name: '', //title
      realname: '', //id+ # + title
    phone: '', //手机号
    describe: '  ', //个人简介
    images: [], //存放图片的数组
      voices: [],
      dur: [],
      voiceMsg: [],
      inputname: "",
      inputdes:"",
    recordStatus: RecordStatus.HIDE,
      talk: '',
      friendList: [],			// 好友列表
      groupName: "",			// 群名称
      groupDec: "",			// 群简介
      allowJoin: true,		// 是否允许任何人加入
      allowApprove: false,	// 加入需要审批
      noAllowJoin: false,		// 不允许任何人加入
      allowInvite: false,		// 允许群人员邀请
      inviteFriend: [],		// 需要加好友ID
      owner: "",				// = myName
      __comps__: {
          audio: null,
      },
      username: {
          type: Object,
          value: {},
      },
      chatType: {
          type: String,
          value: msgType.chatType.CHAT_ROOM,
      }
  },
  
  // 个人简介
  bindTextAreaBlur(e) {
    this.setData({
      describe: e.detail.value
    })
  },
  //点击添加按钮上传图片
  chooseImage: function(e) {
    let me = this;
    app.sendOperation("uploadchooseImage");
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.navigateTo({ url: '/pages/logwx/logwx' });
          return;
        }
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success () {
              
              if (!res.authSetting['scope.camera']) {
                wx.authorize({
                  scope: 'scope.camera',
                  success () {
                    
                    me.openImage(e);
                  }
                });

              }
              else {
                me.openImage(e);
              }
            }
          });
        }
        else {
          me.openImage(e);
        }
      }
    });

  },
  openImage:function(e){
    wx.chooseImage({
      sizeType: ['original', 'compressed'], //可选择原图或压缩后的图片
      sourceType: ['album', 'camera'], //可选择性开放访问相册、相机
      success: res => {
        if (this.data.images.length < 1) {
          const images = this.data.images.concat(res.tempFilePaths)
          // 限制最多只能留下2张照片
          this.setData({
            images: images
          })
        } else {
          wx.showToast({
            title: '最多只能选择一张照片',
            icon: 'none',
            duration: 2000,
            mask: true
          })
        }
      }
    })

  },
  removeImage(e) {
    app.sendOperation("uploadremoveImage");
    const idx = e.target.dataset.idx;
    console.log(e.target.dataset.idx);
    this.data.images.splice(idx, 1);
    var del_image = this.data.images;
    this.setData({
      images: del_image
    })
  },
  handleImagePreview(e) {
    app.sendOperation("uploadhandleImagePreview");
    const idx = e.target.dataset.idx
    const images = this.data.images
    wx.previewImage({
      current: images[idx], //当前预览的图片
      urls: images, //所有要预览的图片
    })
    },
    saveSendMsg(evt) {
        //  evt.detail.msg.openId = wx.getStorageSync("DanbaId");
     //   msgStorage.saveMsg(evt.detail.msg, evt.detail.type);
     //  console.log('saveSendMsg   ###### ', evt.detail.path);
        // this.data.__comps__.inputbar.cancelEmoji();
        
        if (this.data.voices.length <= 1) {
            
            this.data.voices.push(evt.detail.path);
            this.data.dur.push(evt.detail.dur);
            this.setData({
                voices: this.data.voices,
                dur: this.data.dur
            });
            // 限制最多只能留下2张照片
         
            this.packetVoice(evt.detail.path, evt.detail.dur, "12345");
        } else {
            wx.showToast({
                title: '最多只能两段语音',
                icon: 'none',
                duration: 2000,
                mask: true
            })
        }
    },
    recordVoice: function (e) {

      app.sendOperation("uploadrecordVoice");
     //   this.data.__comps__.audio.toggleRecordModal();
        let me = this;
        wx.getSetting({
            success(res) {
              if (!res.authSetting['scope.userInfo']) {
                wx.navigateTo({ url: '/pages/logwx/logwx' });
                return;
              }
              if (!res.authSetting['scope.record']) {
                wx.authorize({
                  scope: 'scope.record',
                  success () {
                    // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                    me.data.__comps__.audio.toggleRecordModal();
                  }
                })
              }
              else {
                me.data.__comps__.audio.toggleRecordModal();
              }
            }
          });

  },
    removeVoice: function (e) {
      app.sendOperation("uploadremoveVoice");
        const idx = e.target.dataset.idx;
        console.log(e.target.dataset.idx);
        this.data.voiceMsg.splice(idx, 1);
        this.data.voices.splice(idx, 1);
        this.data.dur.splice(idx, 1);
        var del_voice = this.data.voiceMsg;
        this.setData({
            voiceMsg: del_voice,
            voices: this.data.voices,
            dur: this.data.dur
        });

  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 转换背景图片格式
    let base641 = wx.getFileSystemManager().readFileSync(this.data.background1, 'base64');
    let base642 = wx.getFileSystemManager().readFileSync(this.data.background2, 'base64');
    this.setData({
      background1: 'data:image/jpg;base64,' + base641,
      background2: 'data:image/jpg;base64,' + base642,
      });
     
      let mname = wx.getStorageSync("DanbaId");//DanbaId   myUsername
      console.log("upload   onload ");
      this.setData({
          owner: mname,
          describe: '  ', //个人简介
          images: [], //存放图片的数组
            voices: [],
            dur: [],
            voiceMsg: [],
            inputname: "",
      });
      this.data.__comps__.audio = this.selectComponent("#chat-suit-audio");
    },
    comparegp:function(val1,val2){
        return val1.groupid-val2.groupid;
    },
    getShenHeTxt: function (msg) {
      //已授权的，用微信的
      let me = this;
     
      
        var uu = "https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined" + "?access_token=" + app.globalData.bdToken;
  
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
       //     console.log("getShenHeTxt   ", res);
            if (res.data.conclusion === "合规") {
               me.checkImg();
              
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
    getShenHeImg: function (path) {
      //已授权的，用微信的
      let me = this;
     
     
        var uu = "https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined" + "?access_token=" + app.globalData.bdToken;
  
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
      //      console.log("getShenHeImg   ", res);
            if (res.data.conclusion === "合规") {
              me.real_upload_info();
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

    // 创建群组
    upload_info: function () {
        let me = this;
   //     
   app.sendOperation("uploadupload_info");

        
        if (!this.data.inputname.trim()) {
            wx.showModal({
                title: "写个标题吧：）",
                confirmText: "OK",
                showCancel: false
            });
            return;
        }
    /*    if (!this.data.describe.trim()) {
            wx.showModal({
                title: "加点描述吧：P",
                confirmText: "OK",
                showCancel: false
            });
            return;
        }*/
       // me.data.realname = me.data.owner + '#' + me.data.name;
      
     /*   if (allGroups.reduce(function (result, v, k) {
            return result || (v.name == me.data.realname);
        }, false)) {
            wx.showModal({
                title: "有人说过这个啦，换个话题吧",
                confirmText: "OK",
                showCancel: false
            });
            return;
        }*/
      /*  if (me.data.images.length == 0) {
            wx.showModal({
                title: "上传几张图片吧",
                confirmText: "OK",
                showCancel: false
            });
            return;
          }*/
        if (me.data.voices.length == 0) {
            wx.showModal({
                title: "录一段语音吧",
                confirmText: "OK",
                showCancel: false
            });
            return;
        }
        me.getShenHeTxt(this.data.inputname + this.data.describe); 
    },
    checkImg: function () {
      let me = this;
      if (me.data.images.length == 0) {
        me.real_upload_info();
        return;
      }
      else{
        me.getShenHeImg(me.data.images[0]); 
      }
    },
      real_upload_info: function () {
     //   console.log("new group  @@@@@@@!!!!!!123456");
        let me = this;
     //   console.log("new group  @@@@@@@!!!!!!  desscribe  ",me.data.describe);
        let options = {
            data: {
                groupname: me.data.inputname,
                desc: me.data.describe,
                members: me.data.inviteFriend,
                "public": me.data.allowJoin,
                // approval: this.data.allowApprove,
                // allowinvites: this.data.allowInvite,
                owner: me.data.owner
            },
            success: function (respData) {
              
                     //   		console.log("new group  @@@@@@@!!!!!!");
                        /*		setTimeout(() => wx.navigateTo({
                                 url: "../groups/groups?myName=" + me.data.owner
                              }), 2000);*/
                            WebIM.conn.getGroup({
                                limit: 500,
                            success: function (res) {

                             /*   wx.showModal({
                                    title: "牛逼",
                                    confirmText: "OK",
                                    showCancel: false
                                });*/
                                let max = 0;
                               // console.log("new group  !!!!!!", me.data.owner);
                             //   console.log("new group  !!!!!!", rooms[0]);
                                let rooms = res.data;
                             //   rooms.reverse();
                             rooms.sort(me.comparegp);
                             rooms.reverse();
                            //    console.log("new group  !!!!!!", rooms);
                             //   console.log("new group  !!!!!!", me.data.inputname);
                                for (let i = 0; i < rooms.length ; i++) {
                                //    console.log("new group  !!!!!!", rooms[i].name);
                                    if (rooms[i].groupname == me.data.inputname) {
                                        max = rooms[i].groupid;
                                        break;
                                    }
                                }
                           //     console.log("new group  !!!!!!", max);
                                /////////////////////////////////////////
                              

                                me.uploadData(max);
                                /////////////////////////////////////////
                                // 好像也没有别的官方通道共享数据啊
                                //		getApp().globalData.groupList = rooms || [];
                            },
                            error: function (err) {
                                wx.showModal({
                                    title: "网络不太好，稍后再试",
                                    confirmText: "OK",
                                    showCancel: false
                                });

                            }
                        });
                    
                
            },
            error: function (err) {
                console.log("userinfo !!!!!!", err.data.error_description);
                console.log("userinfo !!!!!!", me.data.owner);
                wx.showToast({
                    title: err.data.error_description,
                });
            },
        };
        WebIM.conn.createGroupNew(options);
    },
    uploadCount: function (groupid) {
        let b = wx.getStorageSync("DanbaId");
        var me = this;
        var cntstr = "#" + me.data.images.length + "#" + me.data.voices.length + "#0#1";//video 0 txt 1
            var uu = app.globalData.mainSrv + '?tp=gpdetail&type=count&msgid=1&ur=' + app.globalData.userInfo.nickName + "&id=" + b+ "&name=" + me.data.inputname + "&gid=" + groupid + "&txtcontent=" + cntstr + "&wid=0&hei=0&ft=0&len=0";
            console.log("fetchGPData  uploadText  ", uu);
         
            var getPostsRequest = wxRequest.postRequest(uu);
            getPostsRequest
              .then(response => {
                  if (response.statusCode === 200) {
                      
                  
      
                }//200
              })
              .catch(function (response) {
              console.log("catch error uploadinfo ",response);
      
              })
              .finally(function (response) {
            //    wx.hideLoading();
                 
              });
		

    },
    uploadData: function (groupid) {
        var me = this;
      
        var vcs = this.data.voices;
        var dis = this.data.dur;
        me.uploadCount(groupid);
        console.log("1111111 @@@@@@@@@@@  ",me.data.inputname);
        for (var i = 0; i < vcs.length; i++) {
            me.uploadVoice(vcs[i], dis[i], groupid);
        }
        var dd = me.data.describe;
        me.uploadText(dd, groupid);
        
        console.log("222222222 @@@@@@@@@@@  ",me.data.inputname);
        var imgs = this.data.images;
        for (var j = 0; j < imgs.length; j++) {
            me.upLoadImage(imgs[j], groupid);
        }
        this.setData({
         
          describe: '  ', //个人简介
     
            inputname: "",
      });
     //   console.log("222 @@@@@@@@@@@  ",me.data.inputname);
        wx.switchTab({
         //   url: '/pages/topic-detail/topic-detail?gid=' + groupid + '&name=' + me.data.inputname + '&reload=0'
         url: '/pages/index/index'
        });
        //这里清空，上传没完成会丢数据
     /*   this.setData({
            voiceMsg: [],
            voices: [],
            dur: [],
            images: [],
            describe: "",
            
            inputname: "",
            inputdes: ""


        });*/

        
    },
    /* 用于录制声音后显示，但是暂时又不能生成新群组*/
    packetVoice(tempFilePath, dur, groupid) {
        var id = WebIM.conn.getUniqueId();
        var msg = new WebIM.message(msgType.AUDIO, id);
        var token = WebIM.conn.context.accessToken;
        let me = this;
        console.log('发送的语音消息', msg);
        // 接收消息对象
        msg.set({
            apiUrl: WebIM.config.apiURL,
            accessToken: token,
           
            body: {
                type: msgType.AUDIO,
                url: tempFilePath,
                filetype: "",
                filename: tempFilePath,
                accessToken: token,
                length: Math.ceil(dur / 1000)
            },
            from: me.data.owner,
            to: groupid,
            roomType: false,
            chatType: me.data.chatType
            
        });

        msg.setGroup("groupchat");

        msg.body.length = Math.ceil(dur / 1000);
        msg.mid = id;
        

        this.data.voiceMsg.push(msg);
        this.setData({
            voiceMsg: this.data.voiceMsg
        });
     //   console.log('发送的语音消息', this.data.voiceMsg);
    },

    uploadVoice(tempFilePath, dur, groupid) {
        var str = WebIM.config.appkey.split("#");
        var me = this;
        var token = WebIM.conn.context.accessToken;
        /*
                            wx.uploadFile({
                        url: app.globalData.mainSrv + '?tp=avatar&ur=' + app.globalData.userInfo.nickName + "&id=" + b, //仅为示例，非真实的接口地址
                      filePath: res.tempFilePath,
                      name: 'file',
                      formData: {
                        'user': 'test'
                      },
                      success(res1) {
                        const data = res1.data
                        //do something
                      }
                    });
        */
       let b = wx.getStorageSync("DanbaId");
       let mid = WebIM.conn.getUniqueId();
       console.log("audio mid ",mid);
        wx.uploadFile({
          //  url: "https://a1.easemob.com/" + str[0] + "/" + str[1] + "/chatfiles",
            url:app.globalData.mainSrv + '?tp=gpdetail&type=audio&txtcontent=1&ur=' + app.globalData.userInfo.nickName + "&id=" + b + "&name=" + me.data.inputname + "&gid=" + groupid + "&msgid=" + 'audio' +  mid  + "&len=" + dur.toString() + "&wid=0&hei=0&ft=0"  ,
            filePath: tempFilePath,
            name: "file",
            formData: {

                'gid': groupid

            },
            header: {
                "Content-Type": "multipart/form-data",
                Authorization: "Bearer " + token
            },
            success(res) {
              me.setData({
               
                voiceMsg: []
              
            });

                
            }
        });
   

   
        

    },

    ////////////////////////////////////////////////
    uploadText(des,groupid){
			let me = this;

			String.prototype.trim=function()
			{
			     return this.replace(/(^\s*)|(\s*$)/g, '');
			}
         if (!this.data.describe.trim()){
				return;
            }
            let b = wx.getStorageSync("DanbaId");
            let mid = WebIM.conn.getUniqueId();
			
      //  me.sendMsg(msg.body);
      
       
           
            var uu = app.globalData.mainSrv + '?tp=gpdetail&type=txt&ur=' + app.globalData.userInfo.nickName + "&id=" + b+ "&name=" + me.data.inputname + "&gid=" + groupid + "&txtcontent=" + me.data.describe + "&msgid=" + 'txt' + mid + "&len=0" + "&wid=0&hei=0&ft=0";
       //     console.log("fetchGPData  uploadText  ", uu);
         /*   wx.request({
                url: uu,
                header: {
                    'content-type': 'application/json;charset-utf-8'
                },
                success: function (res) {
                    
                }
            });*/
            var getPostsRequest = wxRequest.postRequest(uu);
            getPostsRequest
              .then(response => {
                  if (response.statusCode === 200) {
                      
                    me.setData({
                      
                      describe: '  '
                  });
      
                }//200
              })
              .catch(function (response) {
              console.log("catch error uploadinfo ",response);
      
              })
              .finally(function (response) {
            //    wx.hideLoading();
                 
              });
		/*	let id = WebIM.conn.getUniqueId();
			let msg = new WebIM.message(msgType.TEXT, id);
			msg.set({
             msg: des,
             from: me.data.owner,
             to:  groupid,
				roomType: false,
				chatType: me.data.chatType,
				success(id, serverMsgId){
					//console.log('成功了')
				//	
				},
				fail(id, serverMsgId){
					console.log('失败了')
				}
			});
			
				msg.setGroup("groupchat");
			
			console.log('发送消息', msg)
     //   WebIM.conn.send(msg.body);
        me.sendMsg(msg.body);

        msgStorage.saveMsg(msg, msgType.TEXT);*/


			
			//

		},

    upLoadImage(tempFilePath, groupid){
        var me = this;
      
        var token = WebIM.conn.context.accessToken
			wx.getImageInfo({
            src: tempFilePath,
            success(res) {
                var allowType = {
                    jpg: true,
                    gif: true,
                    png: true,
                    bmp: true,
                    jpeg:true
                };
                var str = WebIM.config.appkey.split("#");
               
                var width = res.width;
                var height = res.height;
                var index = res.path.lastIndexOf(".");
              //  var index = tempFilePath.lastIndexOf(".");
                var filetype = (~index && res.path.slice(index + 1)) || "";
            //    console.log("image filetype ",filetype);
                let b = wx.getStorageSync("DanbaId");
                
                
                if (filetype.toLowerCase() in allowType) {
                    let mid = WebIM.conn.getUniqueId();
              //      console.log('msgid image !!!!  ');
               //   app.getShenHeImg(tempFilePath,'');
                    wx.uploadFile({
                        //  url: "https://a1.easemob.com/" + str[0] + "/" + str[1] + "/chatfiles",
                          url:app.globalData.mainSrv + '?tp=gpdetail&type=img&txtcontent=1&ur=' + app.globalData.userInfo.nickName + "&id=" + b+ "&name=" + me.data.inputname + "&gid=" + groupid + "&msgid="  + 'img' + mid + "&len=0" + "&wid=" + width.toString() + "&hei=" + height.toString() + "&ft=" + filetype.toString(),

                        filePath: tempFilePath,
                        name: "file",
                        header: {
                            "Content-Type": "multipart/form-data",
                            Authorization: "Bearer " + token
                        },
                        success(res) {
                          me.setData({
               
                            images: []
                          
                        });
                        },
                        error(err){
                            console.log("image error ",err);
                        }
                    });
                }
            }
        });
    },
	
    uploadVideo(){
        var me = this;
        var token = WebIM.conn.context.accessToken
			wx.chooseVideo({
            sourceType: ["album", "camera"],
            maxDuration: 60,
            camera: "back",
            success(res) {
                var tempFilePaths = res.tempFilePath;
                var str = WebIM.config.appkey.split("#");
                let b = wx.getStorageSync("DanbaId");
               
                
               
                    wx.uploadFile({
                        //  url: "https://a1.easemob.com/" + str[0] + "/" + str[1] + "/chatfiles",
                          url:app.globalData.mainSrv + '?tp=gpdetail&type=video&ur=' + app.globalData.userInfo.nickName + "&id=" + b+ "&name=" + me.data.inputname + "&gid=" + groupid,
                        
                    filePath: tempFilePaths,
                    name: "file",
                    header: {
                        "Content-Type": "multipart/form-data",
                        Authorization: "Bearer " + token
                    },
                    success(res) {
                   /*     var data = res.data;
                        var dataObj = JSON.parse(data);
                        var id = WebIM.conn.getUniqueId();		// 生成本地消息id
                        var msg = new WebIM.message("video", id);
                        msg.set({
                            apiUrl: WebIM.config.apiURL,
                            body: {
                                type: "video",
                                url: dataObj.uri + "/" + dataObj.entities[0].uuid,
                                filetype: "mp4",
                                filename: tempFilePaths
                            },
                            from: me.data.owner,
                            to: me.getSendToParam(),
                            roomType: false,
                            chatType: me.data.chatType,
                        });
                        if (me.data.chatType == msgType.chatType.CHAT_ROOM) {
                            msg.setGroup("groupchat");
                        }
                        WebIM.conn.send(msg.body);
                        me.triggerEvent(
                            "newVideoMsg",
                            {
                                msg: msg,
                                type: msgType.VIDEO
                            },
                            {
                                bubbles: true,
                                composed: true
                            }
                        );*/
                    }
                });
            }
        });
    },
	
    ////////////////////////////////////////////////

    ////////////////////////////////////////////////
  // 姓名
  bindNameInput: function(e) {
  //  console.log("image @@@@@@@@@@@  ", e.detail.value);
  var t_length = e.detail.value.length;
    this.setData({
      inputname: e.detail.value,
      t_Namelength:t_length
    })
  },
  // 电话
  bindDescInput: function(e) {
    var t_length = e.detail.value.length;
    // console.log(t_text)
    
    this.setData({
      describe: e.detail.value,
      t_Deslength:t_length
    })
  },
  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})