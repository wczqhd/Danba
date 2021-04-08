let WebIM = require("../../../../../utils/WebIM")["default"];
let msgType = require("../../../msgtype");
let RECORD_CONST = require("record_status");
let RecordStatus = RECORD_CONST.RecordStatus;
let RecordDesc = RECORD_CONST.RecordDesc;
let disp = require("../../../../../utils/broadcast");
let RunAnimation = false;
const app = getApp();
const InitHeight = [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
Component({
	properties: {
		username: {
			type: Object,
			value: {},
		},
		chatType: {
			type: String,
			value: msgType.chatType.SINGLE_CHAT,
		},
	},
	data: {
		changedTouches: null,
		recordStatus: RecordStatus.HIDE,
		RecordStatus,
		RecordDesc,		// 模板中有引用
		radomheight: InitHeight,
		recorderManager: wx.getRecorderManager(),
		recordClicked: false,
		RecordImage:'',
		Describe:'',
		name: ' '
	},
	methods: {
		toggleWithoutAction(e){
			// 阻止 tap 冒泡
		},

		toggleRecordModal(){
			this.setData({
				recordStatus: this.data.recordStatus == RecordStatus.HIDE ? RecordStatus.SHOW : RecordStatus.HIDE,
				radomheight: InitHeight,
			});
		//	console.log("audio &&&  ",getApp().globalData.groupList);
			for(let i=0;i<getApp().globalData.groupList.length;i++ )
			{
				 if( getApp().globalData.groupList[i].groupid == this.data.username.groupId)
				 {
					console.log('Describe audio  &&  ',getApp().globalData.groupList[i].describe);
					this.setData({
						RecordImage:getApp().globalData.groupList[i].post_thumbnail_image,
						Describe:getApp().globalData.groupList[i].describe,
						name:getApp().globalData.groupList[i].name
					});
					break;
				 }
			}
		},

		handleRecordingMove(e){
			var touches = e.touches[0];
			var changedTouches = this.data.changedTouches;
			if(!changedTouches){
				return;
			}

			if(this.data.recordStatus == RecordStatus.SWIPE){
				if(changedTouches.pageY - touches.pageY < 20){
					this.setData({
						recordStatus: RecordStatus.HOLD
					});
				}
			}
			if(this.data.recordStatus == RecordStatus.HOLD){
				if(changedTouches.pageY - touches.pageY > 20){
					this.setData({
						recordStatus: RecordStatus.SWIPE
					});
				}
			}
		},

		handleRecording(e){
			let me = this;
		    me.setData({
		      	recordClicked: true
		    })
		    setTimeout(() => {
		      	if (me.data.recordClicked == true) {
		        	executeRecord()
		      	}
		    }, 350)
		    function executeRecord(){
			    wx.getSetting({
			      	success: (res) => {
				        let recordAuth = res.authSetting['scope.record']
				        if (recordAuth == false) { //已申请过授权，但是用户拒绝
				          	wx.openSetting({
					            success: function (res) {
					              let recordAuth = res.authSetting['scope.record']
					              if (recordAuth == true) {
					                wx.showToast({
							        	title: "授权成功",
							        	icon: "success"
							        })
					              } else {
					                wx.showToast({
							        	title: "请授权录音",
							        	icon: "none"
							        })
					              }
					              me.setData({
					                isLongPress: false
					              })
					            }
				          	})
				        } else if (recordAuth == true) { // 用户已经同意授权
				          	startRecord()
				        } else { // 第一次进来，未发起授权
					        wx.authorize({
					            scope: 'scope.record',
					            success: () => {//授权成功
					              	wx.showToast({
							        	title: "授权成功",
							        	icon: "success"
							        })
					            }
					        })
				        }
				    },
				    fail: function () {
				        wx.showToast({
				        	title: "鉴权失败，请重试",
				        	icon: "none"
				        })
			      	}
			    })
		    }

			function startRecord(){
				me.data.changedTouches = e.touches[0];
				me.setData({
					recordStatus: RecordStatus.HOLD
				});
				RunAnimation = true;
				me.myradom();

				let recorderManager = me.data.recorderManager || wx.getRecorderManager();
				recorderManager.onStart(() => {
					// console.log("开始录音...");
				});
				recorderManager.start({
					format: "mp3"
				});
				// 超时
				setTimeout(function(){
					me.handleRecordingCancel();
					RunAnimation = false
				}, 100000);
			}
		},

		handleRecordingCancel(){
			RunAnimation = false
			let recorderManager = this.data.recorderManager;
			// 向上滑动状态停止：取消录音发放
			if(this.data.recordStatus == RecordStatus.SWIPE){
				this.setData({
					recordStatus: RecordStatus.RELEASE
				});
			}
			else{
				this.setData({
					recordStatus: RecordStatus.HIDE,
					recordClicked: false
				});
			}

			recorderManager.onStop((res) => {
				// console.log("结束录音...", res);
				if(this.data.recordStatus == RecordStatus.RELEASE){
					console.log("user canceled");
					this.setData({
						recordStatus: RecordStatus.HIDE
					});
					return;
				}
				if (res.duration < 1000) {
			        wx.showToast({
			        	title: "录音时间太短",
			        	icon: "none"
			        })
			    } else {
			        // 上传
                console.log("this.uploadRecord");
					this.uploadRecord(res.tempFilePath, res.duration);
			    }
			});
			// 停止录音
			recorderManager.stop();
		},

		isGroupChat(){
			return this.data.chatType == msgType.chatType.CHAT_ROOM;
		},

		getSendToParam(){
			return this.isGroupChat() ? this.data.username.groupId : this.data.username.your;
		},
		uploadRecordForme(tempFilePath, dur,mid){
		
        var str = WebIM.config.appkey.split("#");
        var me = this;
        var token = WebIM.conn.context.accessToken;

       let b = wx.getStorageSync("DanbaId");
      // let mid = WebIM.conn.getUniqueId();
     //  console.log("audio mid ",mid);
        wx.uploadFile({
          //  url: "https://a1.easemob.com/" + str[0] + "/" + str[1] + "/chatfiles",
            url:app.globalData.mainSrv + '?tp=gprecord&type=audio&txtcontent=1&ur=' + app.globalData.userInfo.nickName + "&id=" + b + "&name=" + me.data.inputname + "&gid=" + me.getSendToParam() + "&msgid=" + 'audio' +  mid  + "&len=" + dur.toString() + "&wid=0&hei=0&ft=0"  ,
            filePath: tempFilePath,
            name: "file",
            formData: {

                'gid': me.getSendToParam()

            },
            header: {
                "Content-Type": "multipart/form-data",
                Authorization: "Bearer " + token
            },
            success(res) {
             

                
            }
        });
   

   
        

    

		},
		uploadRecord(tempFilePath, dur){
			var str = WebIM.config.appkey.split("#");
			var me = this;
			var token = WebIM.conn.context.accessToken;
			var domain = WebIM.conn.apiUrl;
			wx.uploadFile({
				url: domain + "/" + str[0] + "/" + str[1] + "/chatfiles",
				filePath: tempFilePath,
				name: "file",
				header: {
					"Content-Type": "multipart/form-data",
					Authorization: "Bearer " + token
				},
				success(res){
					// 发送 xmpp 消息
					var id = WebIM.conn.getUniqueId();
					me.uploadRecordForme(tempFilePath, dur,id);
                var msg = new WebIM.message(msgType.AUDIO, id);
             //   console.log("aiyouwoqu  &&&  ",msg);
					var dataObj = JSON.parse(res.data);
					// 接收消息对象
					msg.set({
						apiUrl: WebIM.config.apiURL,
						accessToken: token,
						body: {
							type: msgType.AUDIO,
							url: dataObj.uri + "/" + dataObj.entities[0].uuid,
							filetype: "",
							filename: tempFilePath,
							accessToken: token,
							length: Math.ceil(dur / 1000)
						},
						from: me.data.username.myName,
						to: me.getSendToParam(),
						roomType: false,
						chatType: me.data.chatType,
						success: function (argument) {
							disp.fire('em.chat.sendSuccess', id);
						}
					});
					if(me.isGroupChat()){
						msg.setGroup("groupchat");
					}
					msg.body.length = Math.ceil(dur / 1000);
				//	console.log('发送的语音消息 &&&&&', msg)
					console.log('发送的语音消息 &&&&&',me.data.username.groupId);
                WebIM.conn.send(msg.body);
                console.log("aiyouwoqu  &&&  ", msg);

					me.triggerEvent(
						"newAudioMsg",
						{
							msg: msg,
							type: msgType.AUDIO,
						},
						{
							bubbles: true,
							composed: true
						}
					);
				}
			});
		},

		myradom(){
		    const that = this;
		    var _radomheight = that.data.radomheight;
		    for (var i = 0; i < that.data.radomheight.length; i++) {
		      //+1是为了避免为0
		     _radomheight[i] = (100 * Math.random().toFixed(2))+10;
		    }
		    that.setData({
		        radomheight: _radomheight
		    });
		    if (RunAnimation) {
		    	setTimeout(function () {that.myradom(); }, 500);
		    }else{
		    	return
		    }
	  	}
	},

	// lifetimes
	created(){},
	attached(){},
	moved(){},
	detached(){},
	ready(){},
});
