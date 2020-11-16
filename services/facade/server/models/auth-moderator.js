'use strict'

module.exports = function (AuthModerator) {
  /**
       * register as Moderator
       * @param {object} credentials
       * @param {Function(Error, object)} callback
       */

  AuthModerator.register = function (
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
    AuthModerator.Moderator_create({
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

  AuthModerator.login = function (
    username,
    password,
    callback
  ) {
    AuthModerator.Moderator_login({
      credentials: {
        username,
        password
      }

    }, (err, result) => {
      if (err) { callback(err.obj.error, null) } else {
        callback(null, result.obj)
      }
    })
  }

  AuthModerator.logout = function (accessToken, callback) {
    AuthModerator.Moderator_logout({
      body: {
        accessToken
      }
    }, (err, result) => {
      if (err) {
        callback(err.obj.error, null)
      } else {
        callback(null, {
          success: true
        })
      }
    })
  }
}
