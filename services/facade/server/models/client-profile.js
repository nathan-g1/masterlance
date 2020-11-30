'use strict'

module.exports = function (ClientProfile) {
  ClientProfile.details = function (clientId, callback) {
    ClientProfile.Client_findById({

      id: clientId,

      filter: JSON.stringify({
        fields: {
          restrictionsLeft: false
        }
      })

    }, (err, result) => {
      if (err) {
        callback(err.obj.error, null)
      } else {
        callback(null, result.obj)
      }
    })
  }

  ClientProfile.create = function (accessToken, callback) {
    ClientProfile.UserAccount_validateToken({
      accessToken
    }, (err, result) => {
      if (err) {
        callback(err.obj.error, null);
      } else {
        ClientProfile.Client_create({
          data: JSON.stringify({
            userAccountId: result.obj.userId
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
}
