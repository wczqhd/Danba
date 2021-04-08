'use strict';

 var HOST_URI = 'https://www.tingwx.com';
 
 var AllGpList = '?tp=list&ur=';


function _obj2uri(obj){
	return Object.keys(obj).map(function(k) {
		return encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]);
	}).join('&');
}


function _getAllGpList(usr) {
  
  return HOST_URI + AllGpList + usr;
}
function _getGpContent(timest, gpid, usr){
  console.log("ggggggggggggggggggggggggggggggg  dsfdfgdf  ", HOST_URI + "?tp=content&id=" + gpid + "&tst=" + timest + "&ur=" + usr);
  return HOST_URI + "?tp=content&id=" + gpid + "&tst=" + timest + "&ur=" + usr;
}


module.exports = {
  getAllGpList: _getAllGpList,
    getGpContent: _getGpContent
}