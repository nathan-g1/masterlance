'use strict'

module.exports = function (Authfreelancer) {
  /**
     * register as freelancer
     * @param {object} credentials
     * @param {Function(Error, object)} callback
     */

  Authfreelancer.register = function (
    firstName,
    lastName,
    phoneNumber,
    address,
    dob,
    email,
    username,
    password,
    callback
  ) {
    Authfreelancer.Freelancer_create({
      data: {
        firstName,
        lastName,
        phoneNumber,
        address,
        dob,
        email,
        username,
        password
      }
    }, (err, result) => {
      if (err) { callback(err.obj.error, null) } else {
        const { username, email, id } = result.obj
        callback(null, {

          username,
          email,
          id
        }
        )
      }
    })
  }
}
