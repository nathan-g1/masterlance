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
}
