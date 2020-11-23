'use strict'

module.exports = function (Notification) {
  Notification.fetchNewNotifications = function (accessToken, callback) {
    Notification.app.models.UserAccount.validateToken(accessToken, (err, session) => {
      if (err) return callback(err)
      else if (session) {
        Notification.Notification_find({
          filter: JSON.stringify({
            where: {
              userId: session.userId,
            },
            order: 'dateTime DESC'
          })
        }, (err, result) => {
          if (err) {
            callback(err.obj.error, null)
          } else {
            callback(null, result.obj)
          }
        })
      }
    })
  }
  
  Notification.markNotificationsSeen = function (accessToken, callback) {
    Notification.app.models.UserAccount.validateToken(accessToken, (err, session) => {
      if (err) return callback(err)
      else if (session) {
        Notification.Notification_updateAll({
          where: JSON.stringify({
            userId: session.userId,
          }),
          data: {"visited": true}
        }, (err, _) => {
          if (err) {
            callback(err.obj.error, null)
          } else {
            callback(null, true)
          }
        })
      }
    })
  }
}
