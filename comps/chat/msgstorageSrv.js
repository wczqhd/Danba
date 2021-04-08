let Disp = require("../../utils/Dispatcher");
let msgPackager = require("msgpackagerSrv");
let msgType = require("msgtype");
let msgStorageSrv = new Disp();
let disp = require("../../utils/broadcast");
//保存从服务器获取的聊天记录
msgStorageSrv.saveReceiveMsg = function(receiveMsg, type){
	let sendableMsg;
//	console.log("msgSrv image ", type);
//	console.log("msgSrv image ", msgType.IMAGE);
	if(type == msgType.IMAGE || type == 'image'){
//		console.log("msgSrv image ", receiveMsg);
		sendableMsg = {
			id: receiveMsg.id,
			type: type,
			body: {
				id: receiveMsg.id,
				from: receiveMsg.from,
				to: receiveMsg.to,
				type: receiveMsg.type,
				ext: receiveMsg.ext,
				chatType: receiveMsg.type,
				toJid: "",
				body: {
					type: type,
					url: receiveMsg.url,
					filename: receiveMsg.filename,
					filetype: receiveMsg.filetype,
					size: {
						width: receiveMsg.width,
						height: receiveMsg.height
					},
				},
			},
		};
	//	console.log("msgSrv 232323 ", sendableMsg);
	}
	else if(type == msgType.TEXT || type == msgType.EMOJI){
		sendableMsg = {
			id: receiveMsg.id,
			type: type,
			body: {
				id: receiveMsg.id,
				from: receiveMsg.from,
				to: receiveMsg.to,
				type: receiveMsg.type,
				ext: receiveMsg.ext,
				chatType: receiveMsg.type,
				toJid: "",
				body: {
					type: type,
					msg: receiveMsg.data,
				},
			},
			value: receiveMsg.data
		};
//		console.log("msgSrv txt  ", sendableMsg);
	}
	else if (type == msgType.FILE) {
		sendableMsg = {
			id: receiveMsg.id,
			type: type,
			body: {
				id: receiveMsg.id,
				length: receiveMsg.file_length,
				from: receiveMsg.from,
				to: receiveMsg.to,
				type: receiveMsg.type,
				ext: receiveMsg.ext,
				chatType: receiveMsg.type,
				toJid: "",
				body: {
					type: type,
					url: receiveMsg.url,
					filename: receiveMsg.filename,
					msg: "当前不支持此格式消息展示",
				},
			},
			value: receiveMsg.data
		};
	}
	else if(type == msgType.AUDIO){
 //   console.log('msgstorage  receive ', receiveMsg.id);
		sendableMsg = {
			id: receiveMsg.id,
			type: type,
			accessToken: receiveMsg.token || receiveMsg.accessToken,
      timestamp: receiveMsg.timestamp,
			body: {
				id: receiveMsg.id,
				length: receiveMsg.length,
				from: receiveMsg.from,
				to: receiveMsg.to,
				type: receiveMsg.type,
				ext: receiveMsg.ext,
				chatType: type,
				toJid: "",
				body: {
					type: type,
					url: receiveMsg.url,
					filename: receiveMsg.filename,
					filetype: receiveMsg.filetype,
					from: receiveMsg.from,
					to: receiveMsg.to
				},
			},
		};
//		console.log("msgSrv audio ", sendableMsg);
	}
	else if(type == msgType.VIDEO){
		sendableMsg = {
			id: receiveMsg.id,
			type: type,
			accessToken: receiveMsg.token || receiveMsg.accessToken,
			body: {
				id: receiveMsg.id,
				length: receiveMsg.length,
				from: receiveMsg.from,
				to: receiveMsg.to,
				type: receiveMsg.type,
				ext: receiveMsg.ext,
				chatType: type,
				toJid: "",
				body: {
					type: type,
					url: receiveMsg.url,
					filename: receiveMsg.filename,
					filetype: receiveMsg.filetype,
					from: receiveMsg.from,
					to: receiveMsg.to
				},
			},
		};
	}
	else{
		return;
	}
	this.saveMsg(sendableMsg, type, receiveMsg);
};
msgStorageSrv.saveMsg = function(sendableMsg, type, receiveMsg){
//	console.log('receiveMsgsendableMsg   ', receiveMsg,type)
//	console.log('sendableMsgsendableMsg   ', sendableMsg)
	
	let me = this;
		let myName = wx.getStorageSync("DanbaId");//因为这个是要被用做唯一标识的，不能用wx.getStorageSync("myUsername")
//		console.log('sendableMsgsendableMsg 222   ', myName)
	let sessionKey;
	// 仅用作群聊收消息，发消息没有 receiveMsg
	if(receiveMsg && receiveMsg.type == "groupchat"){
		sessionKey = receiveMsg.to + myName;
	}
	// 群聊发 & 单发 & 单收
	else{
		sessionKey = sendableMsg.body.from == myName
			? sendableMsg.body.to + myName
			: sendableMsg.body.from + myName;
	}
	let curChatMsg = wx.getStorageSync(sessionKey) || [];
	let renderableMsg = msgPackager(sendableMsg, type, myName);
	if(type == msgType.AUDIO) {
		renderableMsg.msg.length = sendableMsg.body.length;
		renderableMsg.msg.token = sendableMsg.accessToken;
	}
	curChatMsg.push(renderableMsg);
	//console.log('renderableMsgrenderableMsg', renderableMsg)
	if(type == msgType.AUDIO){
		renderableMsg.msg.token = sendableMsg.accessToken;
		//如果是音频则请求服务器转码
		// wx.downloadFile({
		// 	url: sendableMsg.body.body.url,
		// 	header: {
		// 		"X-Requested-With": "XMLHttpRequest",
		// 		Accept: "audio/mp3",
		// 		Authorization: "Bearer " + sendableMsg.accessToken
		// 	},
		// 	success(res){
		// 		// wx.playVoice({
		// 		// 	filePath: res.tempFilePath
		// 		// });
		// 		renderableMsg.msg.url = res.tempFilePath;
				
		// 		save();
		// 	},
		// 	fail(e){
		// 		console.log("downloadFile failed", e);
		// 	}
		// });
	}
	// else{
	// 	save();
	// }

	save();
	function save(){
	/*	wx.setStorage({
			key: sessionKey,
			data: curChatMsg,
			success(){
				if (type == msgType.AUDIO || type == msgType.VIDEO) {
					disp.fire('em.chat.audio.fileLoaded');
				}
				me.fire("newChatMsg", renderableMsg, type, curChatMsg, sessionKey);
		//		console.log("msgSrv newChatMsg  ", renderableMsg,type);
			}
		});*/
		if (type == msgType.AUDIO || type == msgType.VIDEO) {
			disp.fire('em.chat.audio.fileLoaded');
		}
		me.fire("newChatMsg", renderableMsg, type, curChatMsg, sessionKey);
	}
};

module.exports = msgStorageSrv;
