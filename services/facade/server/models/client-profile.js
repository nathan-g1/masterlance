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
}
