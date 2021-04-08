let WebIM = require("../../utils/WebIM")["default"];

let __test_account__, __test_psword__;
// __test_account__ = "easezy";
// __test_psword__ = "111111";
var app = getApp();
Page({
	data: {
		name: "",
    hidden: false,
		psd: "",
    grant_type: "password",
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
	},


  onLoad(option) {
    ////////////////////////////////////////////
    // 调用应用实例的方法获取全局数据
    var me = this;
   // console.log("loading!!!!!!!!!!", app.globalData.userInfo);

    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
             // console.log(res.userInfo)
             
              
            }
          })
        }
      }
    })
 

  
    /////////////////////////////////////////
  },
	
    operAvatar: function () {

              ///////////////////////
            //  console.log('that.globalData.userInfo    ', app.globalData.userInfo);
              wx.downloadFile({
                  url: app.globalData.userInfo.avatarUrl, //仅为示例，并非真实的资源
                success(res) {
                  // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
                  if (res.statusCode === 200) {
                    console.log("res.tempFilePath    ##### ",res.tempFilePath);
                
                //    console.log("res.savedFilePath    ##### ", re1.userInfo.nickName);
                      let b = wx.getStorageSync("DanbaId");
                    wx.uploadFile({
                        url: app.globalData.mainSrv + '?tp=avatar&uname=' + app.globalData.userInfo.nickName + "&usr=" + b, //仅为示例，非真实的接口地址
                      filePath: res.tempFilePath,
                      name: 'file',
                      formData: {
                        'user': 'test'
                      },
                      success(res1) {
                    //    const data = res1.data
                        //do something
                        console.log("res.savedFilePath  uploadfile   ##### ");
                      }
                    });
                    
                  }
                }
              });



    },

  bindGetUserInfo: function (e) {
      var me = this;
    console.log(e.detail.userInfo)
    app.globalData.userInfo = e.detail.userInfo;
    
      wx.setStorageSync("myUsername", app.globalData.userInfo.nickName);
      me.operAvatar();
  //  app.getAvatar();
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
   /* prevPage.setData({
      mydata: {
        id: 1,
        b: 125
      }
    })*/
    wx.navigateBack({//返回
      delta: 1
    });
   
  },

});
