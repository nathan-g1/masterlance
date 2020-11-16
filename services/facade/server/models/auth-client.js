'use strict'

module.exports = function (AuthClient) {
  /**
       * register as Client
       * @param {object} credentials
       * @param {Function(Error, object)} callback
       */

  AuthClient.register = function (
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
    AuthClient.Client_create({
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

  AuthClient.login = function (
    username,
    password,
    callback
  ) {
    AuthClient.Client_login({
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

  AuthClient.logout = function (accessToken, callback) {
    AuthClient.Client_logout({
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
