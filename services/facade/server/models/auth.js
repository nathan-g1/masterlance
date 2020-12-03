"use strict";

module.exports = function (UserAccount) {

  const MODERATOR_EMAIL_REGEX = /(.+)\@masterlance\.com/;

  const isModeratorEmail = (email) => MODERATOR_EMAIL_REGEX.test(email)

  UserAccount.validateToken = function (
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

  UserAccount.switchMode = function (
    accessToken,
    to,
    callback
  ) {
    UserAccount.UserAccount_validateToken({
      accessToken
    }, (err, result) => {
      if (err) {
        callback(err.obj.error, null);
      } else {
        if (result.obj.user.authAs === 'moderator' || to === 'moderator') {
          callback(new Error('Moderator role can\'t be switched.'))
        } else {
          UserAccount.UserAccount_prototype_patchAttributes({
            id: result.obj.userId,
            data: JSON.stringify({
              "authAs": to
            })
          }, (err, _) => {
            if (err) callback(err.obj.error, null);
            else callback(null, {
              success: true
            })
          });
        }
      }
    })
  }

  UserAccount.login = function (
    email,
    password,
    callback
  ) {
    UserAccount.UserAccount_authenticate(
      {
        email,
        password,
        ipAddress: '0.0.0.0'
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

  UserAccount.register = function (
    firstName,
    lastName,
    phoneNumber,
    address,
    dob,
    username,
    email,
    password,
    authAs,
    callback
  ) {

    if (isModeratorEmail(email) || authAs === 'moderator') {
      callback(new Error(`Can't register as moderator. Contact admins to create a moderator account.`))
    } else {
      UserAccount.UserAccount_create({
        data: JSON.stringify({
          firstName,
          lastName,
          phoneNumber,
          address,
          dob,
          authAs,
          username,
          email,
          password
        })
      },
        (err, result) => {
          if (err) {
            callback(err.obj.error, null);
          } else {
            const user = result.obj;
            UserAccount.app.models.Payment.Wallet_create({
              data: JSON.stringify({
                "userId": user.id,
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
                    "userId": user.id,
                    "action": "/tour"
                  })
                })
                callback(null, user);
              }
            })
          }
        }
      );
    }
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
