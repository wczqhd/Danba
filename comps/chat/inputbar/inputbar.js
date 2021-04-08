let RecordStatus = require("suit/audio/record_status").RecordStatus;
let msgType = require("../msgtype");
const app = getApp();
Component({
	properties: {
		username: {
			type: Object,
			value: {}
		},
		chatType: {
			type: String,
			value: msgType.chatType.SINGLE_CHAT,
		},
	},
	data: {
		recordStatus: RecordStatus.HIDE,
		RecordStatus,
		__comps__: {
			main: null,
			emoji: null,
			image: null,
			location: null,
			//video: null,
			ptopcall: null
		},
    groupList:[],
    nIndex:0,
		talk:'',
		txtpre:'<<<',
		txtnext:'>>>',

	},
	methods: {
		// 事件有长度限制：仅限 26 字符
		toggleRecordModal(){
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
								me.triggerEvent(
									"tapSendAudio",
									null,
									{
										bubbles: true,
										composed: true
									}
								);
							}
						})
					}
					else{
						me.triggerEvent(
							"tapSendAudio",
							null,
							{
								bubbles: true,
								composed: true
							}
						);

					}
				}
			})
			
		},
		onMakeVideoCall(){
			this.triggerEvent('makeVideoCall', 'single')
		},

		onMakeAudioCall(){
			this.triggerEvent('makeAudioCall', 'single')
	},
		// sendVideo(){
		// 	this.data.__comps__.video.sendVideo();
		// },
    getList(){
     
      this.data.groupList = getApp().globalData.groupList;
      for (let i = 0; i < getApp().globalData.groupList.length; i++) {
        //  console.log('show inputbar  !!!', this.username.groupId + "   " + this.data.groupList[i].roomId);
        if (this.data.username.groupId == this.data.groupList[i].groupid) {
          this.data.nIndex = i;
        //  console.log('show inputbar  !!!', this.data.username.groupId + " "  + " " +  this.data.groupList[i].roomId);
          break;
        }
      }
    //  console.log('show inputbar  !!!', getApp().globalData.groupList.length);
    //  console.log('show inputbar  !!!', this.data.nIndex);
      this.setData({
        groupList: this.data.groupList,
        nIndex: this.data.nIndex

      });

    },


    openPre() {
   //   this.getList();

      let dd = (this.data.nIndex - 1) <= 0 ? (this.data.groupList.length-1) : (this.data.nIndex - 1);
 //     console.log('openNext  !!!', this.data.nIndex + "    " + dd);
   //   console.log('openNext  !!!', this.data.groupList[dd].roomId + '&name=' + this.data.groupList[dd].name);
      //  this.loadTop(dd);
      /*  wx.navigateTo({
          url: '/pages/topic-detail/topic-detail?gid=' + this.data.groupList[dd].roomId + '&name=' + this.data.groupList[dd].name
        })*/
      wx.redirectTo({ url: '/pages/topic-detail/topic-detail?gid=' + this.data.groupList[dd].groupid + '&name=' + this.data.groupList[dd].groupname });
      
    },
    openNext() {
    //  this.getList();
      
      let dd = (this.data.nIndex + 1) >= this.data.groupList.length ? 0 : (this.data.nIndex + 1);
  //    console.log('openNext  !!!', this.data.nIndex + "    " + dd);
   //   console.log('openNext  !!!', this.data.groupList[dd].roomId + '&name=' + this.data.groupList[dd].name);
    //  this.loadTop(dd);
    /*  wx.navigateTo({
        url: '/pages/topic-detail/topic-detail?gid=' + this.data.groupList[dd].roomId + '&name=' + this.data.groupList[dd].name
      })*/
      wx.redirectTo({ url: '/pages/topic-detail/topic-detail?gid=' + this.data.groupList[dd].groupid + '&name=' + this.data.groupList[dd].groupname });
    },
		openCamera(){
			let me = this;
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
											
											me.data.__comps__.image.openCamera();
										}
									});

								}
							}
						});
					}
				}
			});
			
		},

		openEmoji(){
			this.data.__comps__.emoji.openEmoji();
		},

		cancelEmoji(){
			this.data.__comps__.emoji.cancelEmoji();
		},

		sendImage(){
			this.data.__comps__.image.sendImage();
		},

		sendLocation(){
			// this.data.__comps__.location.sendLocation();
		},

		emojiAction(evt){
			this.data.__comps__.main.emojiAction(evt.detail.msg);
		},
		callVideo(){
			console.log('this.data.__comps__.ptopcall', this.data.__comps__.ptopcall)
			this.data.__comps__.ptopcall.show()
		}
	},

	// lifetimes
	created(){},
	attached(){},
	moved(){},
	detached(){},
	ready(){
		this.setData({
			isIPX: getApp().globalData.isIPX
		})
		let comps = this.data.__comps__;
		comps.main = this.selectComponent("#chat-suit-main");
		comps.emoji = this.selectComponent("#chat-suit-emoji");
		comps.image = this.selectComponent("#chat-suit-image");
    comps.ptopcall = this.selectComponent("#chat-suit-ptopcall");
    this.getList();
		// comps.location = this.selectComponent("#chat-suit-location");
		//comps.video = this.selectComponent("#chat-suit-video");
	},

});
