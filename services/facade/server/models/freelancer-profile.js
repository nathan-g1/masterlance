'use strict'

module.exports = function (FreelancerProfile) {
  FreelancerProfile.details = function (FreelancerId, callback) {
    FreelancerProfile.Freelancer_findById({

      id: FreelancerId,

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

  FreelancerProfile.create = function (accessToken, skillsIDs, callback) {
    FreelancerProfile.UserAccount_validateToken({
      accessToken
    }, (err, result) => {
      if (err) {
        callback(err.obj.error, null);
      } else {
        FreelancerProfile.Freelancer_create({
          data: JSON.stringify({
            skillsIDs: skillsIDs,
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
