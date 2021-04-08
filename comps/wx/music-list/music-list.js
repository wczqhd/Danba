const app = getApp().globalData
const util = require('../../../utils/util.js')
let msgStorage = require("../../chat/msgstorage");
let msgType = require("../../chat/msgtype");
let LIST_STATUS = {
  SHORT: "scroll_view_change",
  NORMAL: "scroll_view"
};
Component({
  
  properties: {
    username: {
      type: Object,
      value: {},
    },
    chatType: {
      type: String,
      value: msgType.chatType.CHAT_ROOM,
    },
    title: {
      type: String,
      value: '蛋吧',
      observer: function (newVal) {
        this._setTitle(newVal)
      }
    },
    image: {
      type:String,
      value: '',
      observer: function (newVal) {
        this.setData({
          bgStyle: `background-image:url(${newVal})`
        })
      }
    },
    songs: {
      type: Array,
      value: []
    },
    groupid: {
      type: String,
      value: '',
      observer: function (newVal) {
        this._setGroupId(newVal)
      }
    }
  },
  data: {
    zIndex: 50,
    view: LIST_STATUS.NORMAL,
    bshowImage:true,
    chatMsg: [],
    __visibility__: false,
    __comps__: {
        msglist: null,
        inputbar: null,
        audio: null,
      },
  },

  
  ready: function () {
   
    this._setTitle(this.properties.title)
    this.data.__comps__.inputbar = this.selectComponent("#chat-inputbar");
    this.data.__comps__.msglist = this.selectComponent("#chat-msglist");
    this.data.__comps__.audio = this.selectComponent("#chat-suit-audio");

    const _this = this
    wx.createSelectorQuery().in(this).select('#bgImage').boundingClientRect((rect) => {
      rect.height
    }).exec((res) => {
      _this.setData({
        top: res[0].height,
        oldTop: res[0].height //记录原始的top值
      })
    })
  
    let me = this;
    console.log("music  reload  !!!!!!!");
    if (getApp().globalData.isIPX) {
      this.setData({
        isIPX: true
      })
    }
    
    let uname = this.data.username;
      let myUsername = wx.getStorageSync("DanbaId");//因为这个是要被用做唯一标识的，不能用

    let sessionKey = uname.groupId
      ? uname.groupId + myUsername
      : uname.your + myUsername;
    console.log("music  _setTitle  " + uname);
    this._setTitle(uname.your);
    this.setData({
      username: uname
    })
    //  let chatMsg = wx.getStorageSync(sessionKey) || [];

    // this.renderMsg(null, null, chatMsg, sessionKey);

    // 动态设置歌手头像背景图

    var uu = app.mainSrv + '/gpimg/' + uname.groupId + '/cover.jpg';


    /*   this.properties.image = uu;
           this.setData({
             bgStyle: `background-image:url(${this.properties.image})`
           });*/
    wx.downloadFile({
      url: uu,

      success(res) {
        if (res.statusCode == 200) {
          //  curl = res.tempFilePath;
          //   console.log('cover  本地', res)
          me.properties.image = res.tempFilePath;
          me.setData({
            bgStyle: `background-image:url(${me.properties.image})`
          });
          //renderableMsg.msg.url = res.tempFilePath;
          //  audioCtx.src = curl;
          //    audioCtx.play();
        }
        else if (res.statusCode == 406) {

        }

      },
      fail(e) {
        console.log("downloadFile failed &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", e);
      /*  wx.showToast({
          title: "下载失败",
          duration: 1000
        });*/
      }
    });


   
  },
  methods: {



    ////////////////////
    toggleRecordModal() {
      this.data.__comps__.audio.toggleRecordModal();
    },
    reload(uname)
    {
      this.setData({
        username: uname
      });
    },
    normalScroll() {
      this.setData({
        view: LIST_STATUS.NORMAL
      });
      this.data.__comps__.msglist.normalScroll();
      this.data.__comps__.inputbar.cancelEmoji();
    },

    shortScroll() {
      this.setData({
        view: LIST_STATUS.SHORT
      });
      this.data.__comps__.msglist.shortScroll();
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

    

    
    saveSendMsg(evt) {
    //  evt.detail.msg.openId = wx.getStorageSync("DanbaId");
      msgStorage.saveMsg(evt.detail.msg, evt.detail.type);
      console.log('saveSendMsg   ###### ', evt.detail.msg);
     // this.data.__comps__.inputbar.cancelEmoji();
    },
    getMore() {
      this.selectComponent('#chat-msglist').getHistoryMsg()
    },
  ////////////////////////////////////
    /*针对不同手机设置songlist的top值*/
    setSonglistTop: function () {
    
      
    },
    _setTitle: function (title) {
      wx.setNavigationBarTitle({
        title: title
      })
    },
    _setGroupId: function (gid) {

    },

    scroll: function (e) {
      let top = this.data.oldTop - e.detail.scrollTop -30> 0 ? this.data.oldTop - e.detail.scrollTop - 30 : 0
      const percent = Math.abs(e.detail.scrollTop / this.data.oldTop)
      
      if (e.detail.scrollTop > 20) {
        console.log("e.detail.scrollTop >20  ", e.detail.scrollTop + "   " + this.data.oldTop + "  " + top);
        this.setData({
          zIndex: 0,
          bgZindex: 0
        })
      } else if (e.detail.scrollTop < 20 && e.detail.scrollTop > 0) {
        console.log("e.detail.scrollTop  0---20 ", e.detail.scrollTop + "   " + this.data.oldTop + "  " + top);
        this.setData({
          zIndex: 50,
          bgZindex: 0
        })
      } else if (e.detail.scrollTop < 0) {
        console.log("e.detail.scrollTop <0  ", e.detail.scrollTop + "   " + this.data.oldTop + "  " + top);
        this.setData({
          scale: `scale(${1 + percent})`,
          translate: `transform:translate3d(0px,${Math.abs(e.detail.scrollTop)}px,0px)`,
          bgZindex: 1,
          zIndex: 50
        })
        return
      }
      this.setData({
        top: top
      })
    },
    randomPlayall: function () {
      app.currentIndex = util.randomNum(this.properties.songs.length)
      app.songlist = this.properties.songs
      wx.switchTab({
        url: '/pages/player/player'
      })
    },
    /*向父组件推送滚动到底部的事件*/
    getMoreSongs: function () {
      this.triggerEvent('myevent', this.properties.songs.length)
    }
  }
})