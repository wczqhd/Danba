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

	bindUsername: function(e){
		this.setData({
			name: e.detail.value
		});
	},
  onLoad(option) {
    ////////////////////////////////////////////
    // 调用应用实例的方法获取全局数据
    var me = this;
   
    me.login();
    /////////////////////////////////////////
  },
	




	login: function(){
    
  //  console.log("loading!!!!!!!!!!", this.data.name);
    let oid = '';
    
 //   wx.removeStorageSync("DanbaId");
    oid = wx.getStorageSync("DanbaId");
    
    if(oid.length == 0)
        this.data.name = oid + '%%';
    else
        this.data.name = oid;
    this.data.psd = oid + "pwd";
		getApp().conn.open({
			apiUrl: WebIM.config.apiURL,
			user: __test_account__ || this.data.name,
			pwd: __test_psword__ || this.data.psd,
			grant_type: this.data.grant_type,
			appKey: WebIM.config.appkey
		});
	},

  

});
