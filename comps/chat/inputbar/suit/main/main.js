let WebIM = require("../../../../../utils/WebIM")["default"];
let msgType = require("../../../msgtype");
let disp = require("../../../../../utils/broadcast");
const app = getApp();
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
		inputMessage: "",		// render input 的值
		userMessage: "",		// input 的实时值
	},

	methods: {
		focus(){
			this.triggerEvent("inputFocused", null, { bubbles: true });
		},

		blur(){
			this.triggerEvent("inputBlured", null, { bubbles: true });
		},

		isGroupChat(){
			return this.data.chatType == msgType.chatType.CHAT_ROOM;
		},

		getSendToParam(){
			return this.isGroupChat() ? this.data.username.groupId : this.data.username.your;
		},

		// bindinput 不能打冒号！
		bindMessage(e){
			this.setData({
				userMessage: e.detail.value
			});
		},

		emojiAction(emoji){
			var str;
			var msglen = this.data.userMessage.length - 1;
			if(emoji && emoji != "[del]"){
				str = this.data.userMessage + emoji;
			}
			else if(emoji == "[del]"){
				let start = this.data.userMessage.lastIndexOf("[");
				let end = this.data.userMessage.lastIndexOf("]");
				let len = end - start;
				if(end != -1 && end == msglen && len >= 3 && len <= 4){
					str = this.data.userMessage.slice(0, start);
				}
				else{
					str = this.data.userMessage.slice(0, msglen);
				}
			}
			this.setData({
				userMessage: str,
				inputMessage: str
			});
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
            console.log("getShenHeTxt   ", res);
            if (res.data.conclusion === "合规") {
							me.realsendMessage();
              
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
		sendMessage(){
			let me = this;

			String.prototype.trim=function()
			{
			     return this.replace(/(^\s*)|(\s*$)/g, '');
			}
			if(!this.data.userMessage.trim()){
				return;
			}
			me.getShenHeTxt(this.data.userMessage);
		},
		uploadTextForme(des,mid){
			let me = this;

		

            let b = wx.getStorageSync("DanbaId");
          
			
      //  me.sendMsg(msg.body);
      
       
           
            var uu = app.globalData.mainSrv + '?tp=gprecord&type=txt&ur=' + app.globalData.userInfo.nickName + "&id=" + b+ "&gid=" + me.getSendToParam() + "&txtcontent=" + des + "&msgid=" + 'txt' + mid + "&len=0" + "&wid=0&hei=0&ft=0";
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
                      
                    
      
                }//200
              })
              .catch(function (response) {
              console.log("catch error uploadinfo ",response);
      
              })
              .finally(function (response) {
            //    wx.hideLoading();
                 
              });



			
			//

		},
		realsendMessage(){
			let me = this;
			let id = WebIM.conn.getUniqueId();
			let msg = new WebIM.message(msgType.TEXT, id);
	//		console.log('成功了',me)
	    me.uploadTextForme(me.data.userMessage,id);
			msg.set({
				msg: me.data.userMessage,
				from: me.data.username.myName,
				to: me.getSendToParam(),
				roomType: false,
				chatType: me.data.chatType,
				success(id, serverMsgId){
					//console.log('成功了')
					disp.fire('em.chat.sendSuccess', id, me.data.userMessage);
				},
				fail(id, serverMsgId){
					console.log('失败了')
				}
			});
			if(me.data.chatType == msgType.chatType.CHAT_ROOM){
				msg.setGroup("groupchat");
			}
			console.log('发送消息', msg)
			WebIM.conn.send(msg.body);
			this.triggerEvent(
				"newTextMsg",
				{
					msg: msg,
					type: msgType.TEXT,
				},
				{
					bubbles: true,
					composed: true
				}
			);
			//
			this.setData({
				userMessage: "",
				inputMessage: "",
			});
			console.log('成功了2222')
		},
	},

	// lifetimes
	created(){},
	attached(){},
	moved(){},
	detached(){},
	ready(){},
});
