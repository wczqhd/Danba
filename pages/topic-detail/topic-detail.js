const app = getApp().globalData


var wxRequest = require('../../utilswm/wxRequest.js')
let msgStorageSrv = require("../../comps/chat/msgstorageSrv");
Page({
  data:{
   groupid:'',
   title:'',
   img:'',
    username: {
      type: Object,
      value: {},
    },
    __comps__: {
      chat: null
      
    },
  },
  
  
  onLoad: function (option) {
    this.setData({
      groupid: option.gid,
   
    });
    this.data.username.groupId = option.gid;
      this.data.username.myName = wx.getStorageSync("DanbaId");//因为这个是要被用做唯一标识的，不能用wx.getStorageSync("myUsername")
    this.data.username.your = option.name;
  //  
    
    this.setData({
      username: this.data.username,
      title: option.name
    });
    
   
    this.data.__comps__.chat = this.selectComponent("#chat");
    console.log("topic detail name   ", this.data.__comps__.chat);

    if (wx.canIUse('hideHomeButton')) {
			wx.hideHomeButton()
		}
   
  //  
 //   this._getTopMusicList();
  },
    onUnload: function () {//如果页面被卸载时被执行
        console.log("topic detail name  %%%%%%%% ");
        wx.navigateTo({
            url: '/pages/index/index'
        });
    },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    this.selectComponent('#groupchat').getMore()
    // 停止下拉动作
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },

    onShareAppMessage: function (options) {
      var shareobj;
    var self = this;
    if( options.from == 'button' ){
      　　　　var eData = options.target.dataset;
      　//　　　console.log( "sharedata detail topic ",getApp().globalData.groupList );  
     // console.log( "sharedata detail topic ",eData.data );   // shareBtn
             
    //  self.data.__comps__.chat.toggleShareAudio(eData);
    let imgpath = '';
          for(let i=0;i<getApp().globalData.groupList.length;i++){
            if(getApp().globalData.groupList[i].groupid == eData.data.info.to)
            {
              imgpath = getApp().globalData.groupList[i].post_thumbnail_image;
              break;
            }

          }
    
          //   self.clickBtn(options,"clickShare");
             shareobj = {
        　　　　title: self.data.title,        // 默认是小程序的名称(可以写slogan等)
        　　　　path: '/pages/index/index?gid='+eData.data.info.to + "&mid="+eData.data.mid + "&name="+self.data.title,        // 默认是当前页面，必须是以‘/’开头的完整路径
        　　　　imageUrl: imgpath,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
        　　　　success: function(res){
        　　　　　　// 转发成功之后的回调
                 console.log( "clickShare  " ,res);
        　　　　　　if(res.errMsg == 'shareAppMessage:ok'){
                    console.log( "clickShare topic detail " );
                    msgStorageSrv.fire("newShareAudio", eData);
              /*      let sid = 'sid';
                    self.triggerEvent(
                      "tapShareAudio",
                     {sid},
                      {
                          bubbles: true,
                          composed: true
                      }
                  );*/
                /*    self.data.groupList[i].hotmsg.sharecount = self.data.groupList[i].hotmsg.sharecount+1;
                         self.clickBtn(options,"clickShare");
                         self.setData({
                          groupList:self.data.groupList
                         });*/
        　　　　　　}
        　　　　},
        　　　　fail: function(res){
        　　　　　　// 转发失败之后的回调
                   console.log( "clickShare  " ,res);
        　　　　　　if(res.errMsg == 'shareAppMessage:fail cancel'){
        　　　　　　　　// 用户取消转发
        　　　　　　}else if(res.errMsg == 'shareAppMessage:fail'){
        　　　　　　　　// 转发失败，其中 detail message 为详细失败信息
        　　　　　　}
        　　　　}
        　　};
      　　　　// 此处可以修改 shareObj 中的内容
      　　　
      　　}
     // console.log('分享   ', this.data.username.your);
      else {
        shareobj=  {
          title: this.data.title,
          path: ' pages/topic-detail/topic-detail?gid=' + this.data.username.groupId + ' & name=' + this.data.username.your,
          success: function (res) {
            // 转发成功
            console.log('分享成功')
          },
          fail: function (res) {
            // 转发失败
            console.log('分享失败')
          }
        }

      }
      
      return shareobj;
    },
}
)