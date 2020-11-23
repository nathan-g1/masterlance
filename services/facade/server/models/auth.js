"use strict";

module.exports = function (UserAccount) {
  /**
   * register as Client
   * @param {object} credentials
   * @param {Function(Error, object)} callback
   */

  UserAccount.validateToken = function(
    accessToken,
    callback
  ) {
    UserAccount.UserAccount_validateToken({
      accessToken
    }, (err, result) => {
      if (err) {
        callback(err.obj.error, null);
      } else {
        callback(null, result.obj);
      }
    })
  }

  UserAccount.login = function (
    phoneNumber,
    username,
    email,
    password,
    authAs,
    callback
  ) {
    UserAccount.UserAccount_authenticate(
      {
        phoneNumber,
        username,
        email,
        password,
        ipAddress: '0.0.0.0',
        authAs,
      },
      (err, result) => {
        if (err) {
          callback(err.obj.error, null);
        } else {
          callback(null, result.obj);
        }
      }
    );
  };

  UserAccount.logout = function (accessToken, callback) {
    UserAccount.UserAccount_signout({
      accessToken,
    },
      (err, _) => {
        if (err) {
          callback(err.obj.error, null);
        } else {
          callback(null, {
            success: true,
          });
        }
      }
    );
  };

  UserAccount.registerClient = function (
    firstName,
    lastName,
    phoneNumber,
    address,
    dob,
    username,
    email,
    password,
    callback
  ) {
    UserAccount.UserAccount_registerClient(
      {
        firstName,
        lastName,
        phoneNumber,
        address,
        dob,
        username,
        email,
        password,
      },
      (err, result) => {
        if (err) {
          callback(err.obj.error, null);
        } else {
          const user = result.obj;
          UserAccount.app.models.Payment.Wallet_create({
            data: JSON.stringify({
              "userId": user.userAccountId,
              "activeBalance": 0
            })
          }, (err, _) => {
            if (err) {
              callback(err.obj.error, null);
            } else {
              UserAccount.app.models.Notification.Notification_create({
                data: JSON.stringify({
                  "title": "Welcome to Masterlance",
                  "body": "Welcome to Masterlance! Take the site tour to learn how to use Masterlance.",
                  "userId": user.userAccountId,
                  "action": "/tour/client"
                })
              })
              callback(null, user);
            }
          })
        }
      }
    );
  };

  UserAccount.registerFreelancer = function (
    firstName,
    lastName,
    phoneNumber,
    address,
    dob,
    username,
    email,
    password,
    callback
  ) {
    UserAccount.UserAccount_registerFreelancer(
      {
        firstName,
        lastName,
        phoneNumber,
        address,
        dob,
        username,
        email,
        password,
      },
      (err, result) => {
        if (err) {
          callback(err.obj.error, null);
        } else {
          const user = result.obj;
          UserAccount.app.models.Payment.Wallet_create({
            data: JSON.stringify({
              "userId": user.userAccountId,
              "activeBalance": 0
            })
          }, (err, _) => {
            if (err) {
              callback(err.obj.error, null);
            } else {
              UserAccount.app.models.Notification.Notification_create({
                data: JSON.stringify({
                  "title": "Welcome to Masterlance",
                  "body": "Welcome to Masterlance! Take the site tour to learn how to use Masterlance.",
                  "userId": user.userAccountId,
                  "action": "/tour/freelancer"
                })
              })
              callback(null, user);
            }
          })
        }
      }
    );
  };

  UserAccount.sessions = function (accessToken, callback) {
    UserAccount.UserAccount_sessions(
      {
        accessToken
      },
      (err, result) => {
        if (err) {
          callback(err.obj.error, null);
        } else {
          callback(null, result.obj);
        }
      }
    );
  };
};
