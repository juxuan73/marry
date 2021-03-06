//app.js
const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

let userInfo

App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {}
  },


  data: {
    locationAuthType: UNPROMPTED,
  },

  login({ success, error }) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo'] === false) {

          this.data.locationAuthType = UNAUTHORIZED
          // 已拒绝授权
          wx.showModal({
            title: '提示',
            content: '请授权我们获取您的用户信息',
            showCancel: false
          })
          error && error()
        } else {
          if (this.data.locationAuthType === UNAUTHORIZED) {
            this.data.locationAuthType = UNPROMPTED
            error && error()
          } else {
            this.getUserInfo({ success, error })
          }
        }
      }
    })
  },

  getUserInfo({ success, error }) {

     // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              userInfo = res.userInfo
              success && success({
                userInfo
              })
            },
            fail: ()=> {
              error && error()
            }
          })
        }
      }
    })
  },

  checkSession({ success, error }) {
    if (userInfo) {
      return success && success({
        userInfo
      })
    }

    wx.checkSession({
      success: () => {
        this.getUserInfo({
          success: res => {
            this.data.locationAuthType = AUTHORIZED
            success && success({
              userInfo
            })
          },
          fail: () => {
            if (this.data.locationAuthType === AUTHORIZED) {
              this.data.locationAuthType = UNPROMPTED
            }
            error && error()
          }
        })
      },
      fail: () => {
        if (this.data.locationAuthType === AUTHORIZED) {
          this.data.locationAuthType = UNPROMPTED
        }
        error && error()
      }
    })
  }
})
