let audioCtxFc = require("audioCtxFactory");
let playStatus = require("playStatus");
const app = getApp();



if (wx.setInnerAudioOption) {
  wx.setInnerAudioOption({
    obeyMuteSwitch: false,
    autoplay: true
  })
}else {
  myaudio.obeyMuteSwitch = false;
  myaudio.autoplay = true;
}
Component({
	properties: {
		msg: {
			type: Object,
			val: {}
		},
    
	},
	data: {
		playStatus: playStatus,
		curStatus: playStatus.STOP,
		time: "0'",
    liscount: 0,
    zanOrcai:'',
		opcity: 1,
		__comps__: {
			audioCtx: null
		}
	},

	methods: {
    zanPlay(){
      let me = this;
      console.log("me.liscount  ", me.data.liscount);
      me.data.liscount = me.data.msg.liscount +1;
      me.setData({
        liscount: me.data.liscount,
        zanOrcai:'zan'
      });
      
   //   console.log("me.liscount  ", me.data.msg.liscount);
    },
    caiPlay() {
      let me = this;
      me.data.liscount = me.data.msg.liscount - 1;
      me.setData({
        liscount: me.data.liscount,
        zanOrcai:'cai'
      })
      
    },
    giftPlay(){
      this.data.__comps__.emoji.openEmoji();
    },
    cancelEmoji() {
      this.data.__comps__.emoji.cancelEmoji();
    },
    
		audioPlay(){
      var that = this;
			wx.inter && clearInterval(wx.inter)
			let audioCtx = this.data.__comps__.audioCtx;
			var curl = ''
      
     
          console.log('音频本地 $$$$$ ', this.data.msg.msg.data);
			wx.downloadFile({
			url: this.data.msg.msg.data,
			header: {
				"X-Requested-With": "XMLHttpRequest",
				Accept: "audio/mp3",
				Authorization: "Bearer " + this.data.msg.msg.token
			},
			success(res){
        if(res.statusCode == 200)
        {
				    curl = res.tempFilePath;
            console.log('音频本地 &&&&&&&  ', res);
            that.triggerEvent(
                "tapPlayAudio",
                null,
                {
                    bubbles: true,
                    composed: true
                }
            );
				//renderableMsg.msg.url = res.tempFilePath;
				    audioCtx.src = curl;
				    audioCtx.play();
        }
        else if (res.statusCode == 406)
        {

        }
				
			},
			fail(e){
				console.log("downloadFile failed &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", e);
				wx.showToast({
					title: "下载失败",
					duration: 1000
				});
			}
		});
		
		},

		audioPause(auCtx){
			//let audioCtx = this.data.__comps__.audioCtx;
			let audioCtx = this.data.__comps__.audioCtx = audioCtxFc.getCtx(this.data.msg.mid) || auCtx
			audioCtx&&audioCtx.pause();
		},

		addEvent(){
			let audioCtx = this.data.__comps__.audioCtx;
			audioCtx.onPlay(this.onPlaying);
			audioCtx.onPause(this.onPause);
			audioCtx.onWaiting(this.onPause);
			audioCtx.onStop(this.onDone);
			audioCtx.onEnded(this.onDone);
			audioCtx.onError(this.onDone);
			audioCtx.onWaiting(this.onWait)

			//audioCtx.onTimeUpdate(this.onTimeUpdate);
		},

		delEvent(){
			let audioCtx = this.data.__comps__.audioCtx;
			audioCtx.offPlay(this.onPlaying);
			audioCtx.offPause(this.onPause);
			audioCtx.offWaiting(this.onPause);
			audioCtx.offStop(this.onDone);
			audioCtx.offEnded(this.onDone);
			audioCtx.offError(this.onDone);
			audioCtx.offWaiting(this.onWait)
			// 多次播放会丢失这个回调，所以不用卸载
			// audioCtx.offTimeUpdate(this.onTimeUpdate);
		},
	},

	// lifetimes
	created(){},
	attached(){
		this.setData({
			time: this.properties.msg.msg.length + "''",
			style: this.properties.msg.style,
     

		});


  //  this.getClick();
    
	},
	moved(){},
	detached(){
		
		let audioCtx = this.data.__comps__.audioCtx = audioCtxFc.getCtx(this.data.msg.mid);
		this.audioPause(audioCtx);
		this.delEvent();
   // this.sendClick();
    console.log("detached  audio ", this.data.msg.mid);
		//audioCtx.destroy();
	},

	ready(){
		let self = this
       let curl = ''
     //  console.log("ready &&& ", this.data.msg);
		let audioCtx = this.data.__comps__.audioCtx = audioCtxFc.getCtx(this.data.msg.mid);

		audioCtx.autoplay = false;
		audioCtx.loop = false;
 //   console.log("onPlaying", this.data.liscount);

		//
		this.onPlaying = () => {
			//console.log("onPlaying", JSON.stringify(this.data));
			this.setData({
				curStatus: playStatus.PLAYING,
			});
			wx.inter && clearInterval(wx.inter)
			wx.inter = setInterval(() => {
				let opcity = this.data.opcity;
				this.setData({
					opcity: opcity == 1 ? 0.4 : 1
				})
			}, 500)
		};
		this.onPause = () => {
			// console.log("onPause", JSON.stringify(this.data));
			// 第二次播放会立即抛出一个异常的 onPause
			if(parseInt(this.data.time, 10) < 1){
				return;
			}
			this.setData({
				curStatus: playStatus.PAUSE,
				opcity: 1
				//time: "0'",
			});
		};
		this.onDone = () => {
			// console.log("onDone", JSON.stringify(this.data));
			this.setData({
				curStatus: playStatus.STOP,
				opcity: 1
				//time: "0'",
			});
			clearInterval(wx.inter)
		};
		// 多次播放会丢失这个回调
		this.onTimeUpdate = () => {
			this.setData({
				time: (audioCtx.currentTime >> 0) + "'"
			});
		};
		this.onWait = () => {
			wx.showToast({
					title: "下载中...",
					duration: 1000
				});
		}
		this.addEvent();
	},
});

