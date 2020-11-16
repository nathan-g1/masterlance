'use strict'

module.exports = function (RoleResolver) {
  RoleResolver.resolveToken = function (accessToken, callback) {
    if (accessToken) {
      RoleResolver.app.models.AccessToken.findById(accessToken, {

        fields: {
          id: false
        }

      }, (err, result) => {
        if (err) { callback(err, null) } else {
          if (result) {
            if (result.clientId) {
              RoleResolver.app.models.Client.findById(result.clientId, (err, client) => {
                const { restrictionsLeft } = JSON.parse(JSON.stringify(client))
                callback(null, {
                  ...JSON.parse(JSON.stringify(result)),
                  restrictionsLeft
                })
              })
            } else if (result.freelancerId) {
              RoleResolver.app.models.Freelancer.findById(result.freelancerId, (err, freelancer) => {
                const { restrictionsLeft } = JSON.parse(JSON.stringify(freelancer))
                callback(null, {
                  ...JSON.parse(JSON.stringify(result)),
                  restrictionsLeft
                })
              })
            } else {
              callback(null, result)
            }
          } else {
            callback(new Error('not authenticated'), null)
          }
        }
      })
    } else { callback(new Error('not authenticated'), null) }
  }
}
