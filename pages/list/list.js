

const app = getApp();
var util = require('../../utilswm/util.js');
//var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utilswm/wxApi.js')
var wxRequest = require('../../utilswm/wxRequest.js')

var webSiteName = "蛋吧";
var domain = app.globalData.mainSrv;




Page({
  data: {
    title: '文章列表',
      postsList: [],
      getList: [],
      
      taName: "",
      isLastPage: false,
    page: 1,
      search: '',
      showerror: "none",
    isCategoryPage: "none",
    isSearchPage: "none",
    showallDisplay: "block",
    displaySwiper: "block",
    floatDisplay: "none",
    searchKey: "",
    topBarItems: [
      // id name selected 选中状态
      {
        id: '1',
        name: '最新',
        selected: true
      },
      {
        id: '2',
        name: 'TA发起',
        selected: false
      },
      {
        id: '3',
          name: 'TA回复',
        selected: false
      },
      // { id: '4', name: '鼓励数', selected: false }
    ],
    tab: '1',
    webSiteName: webSiteName,
    domain: domain

  },

  onShareAppMessage: function () {
    var title = "TA的声音";
    var path = "pages/list/list";
    return {
      title: title,
      path: path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  reload: function (e) {
    var self = this;
    self.fetchPostsData();
  },

  onTapTag: function (e) {
    var self = this;
    var tab = e.currentTarget.id;
    var topBarItems = self.data.topBarItems;
    // 切换topBarItem 
    for (var i = 0; i < topBarItems.length; i++) {
      if (tab == topBarItems[i].id) {
        topBarItems[i].selected = true;
      } else {
        topBarItems[i].selected = false;
      }
    }
    self.setData({
      topBarItems: topBarItems,
      tab: tab

    })
   
        self.setPostsData(tab);
   


    },
  

  onLoad: function (options) {
      var self = this;
      this.data.taName = options.id;//id
      this.fetchPostsData();
      
   
    },
    setPostsData: function (tab) {
        var self = this;
        if (tab == 1) {
            self.setData({
                showallDisplay: "block",
                floatDisplay: "block",
                postsList: self.data.getList.map(function (item) {
                    if (item.owner == self.data.taName)
                        return item;
                }),

            });

        }
        else if (tab == 2) {
            self.setData({
                showallDisplay: "block",
                floatDisplay: "block",
                postsList: self.data.getList.map(function (item) {
                    if (item.owner != self.data.taName)
                        return item;
                }),

            });
        }
        else {
            self.setData({
                showallDisplay: "block",
                floatDisplay: "block",
                postsList: self.data.getList

            });
        }
        
    },
  //获取文章列表数据
  fetchPostsData: function () {
    var self = this;
    self.setData({
        getList: []
    });

    wx.showLoading({
      title: '正在加载',
      mask: true
    });
     
      var tt = 0, gid = 0;
      let myname = wx.getStorageSync("myUsername");
      var uu = app.globalData.mainSrv + "?tp=listta&id=" + self.data.taName + "&tst=" + tt + "&ur=" + myname;
    var getTopHotPostsRequest = wxRequest.getRequest(uu);
    getTopHotPostsRequest.then(response => {
        if (response.statusCode === 200) {
          self.setData({
            showallDisplay: "block",
            floatDisplay: "block",
              getList: self.data.postsList.concat(response.data.map(function (item) {
              var strdate = item.post_date
              
              item.post_date = util.cutstr(strdate, 10, 1);
              return item;
            })),

          });
            self.setPostsData("1");
        } else if (response.statusCode === 404) {

          // wx.showModal({
          //     title: '加载失败',
          //     content: '加载数据失败,可能缺少相应的数据',
          //     showCancel: false,
          // });

          console.log('加载数据失败,可能缺少相应的数据');
        }
      })
      .catch(function () {
        wx.hideLoading();
      

          self.setData({
            showerror: "block",
            floatDisplay: "block"
          });

       
      })
      .finally(function () {

        setTimeout(function () {
          wx.hideLoading();

        }, 1500);

      });
  },
  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
      const data = event.currentTarget.dataset.data;
      console.log("_selectItemRank   ####  ", data);

      //  console.log("topic-detail   ", data.name);
      wx.navigateTo({
          url: '/pages/topic-detail/topic-detail?gid=' + data.groupid + '&name=' + data.groupname + '&reload=0'
          // url: '/pages/icon/icon'
      })
  },
  onShow: function () {
  
    this.setData({
        skinStyle: wx.getStorageSync('skinStyle') || 'green'
    })
     

  },



})