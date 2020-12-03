"use strict";

module.exports = function (UserAccount) {

  const MODERATOR_EMAIL_REGEX = /(.+)\@masterlance\.com/;

  const isModeratorEmail = (email) => MODERATOR_EMAIL_REGEX.test(email)

  UserAccount.validateToken = function (
    accessToken,
    callback
  ) {
    UserAccount.app.models.Session.findById(
      accessToken,
      async (err, session) => {
        if (err) return callback(err)
        else if (session) {
          UserAccount.findById(session.userId, {
            "include": ["freelancerprofile", "clientprofile"]
          }, (err, user) => {
            if (err) callback(err);
            else {
              if (isModeratorEmail(user.email)) {
                user.authAs = 'moderator'
                user.save((err, user) => {
                  callback(null, {
                    ...session.toJSON(),
                    user,
                  })
                })
              } else {
                callback(null, {
                  ...session.toJSON(),
                  user
                })
              }
            }
          })
        } else {
          const err = new Error("not authenticated")
          err.statusCode = 401
          callback(err)
        }
      }
    );
  }

  UserAccount.sessions = function (accessToken, callback) {
    if (!accessToken) {
      return callback(new Error("not authenticated"), null);
    }

    UserAccount.app.models.Session.findById(
      accessToken,
      {
        fields: {
          id: false,
        },
      },
      (err, session) => {
        if (err) {
          callback(err, null);
        } else {
          if (session) {
            UserAccount.app.models.Session.find(
              {
                where: {
                  userId: session.userId,
                },
                fields: {
                  id: false,
                },
              },
              callback
            );
          } else {
            callback(new Error("not authenticated"), null);
          }
        }
      }
    );
  };

  UserAccount.signout = function (accessToken, callback) {
    if (!accessToken) {
      return callback(new Error("not authenticated"), null);
    }

    UserAccount.logout(accessToken, callback);
  };

  UserAccount.authenticate = function (
    email,
    password,
    ipAddress,
    callback
  ) {
    UserAccount.login(
      {
        email,
        password,
      },
      'user',
      (err, sessionInfo) => {
        if (err) {
          callback(err, null);
        } else {
          UserAccount.app.models.Session.findById(
            sessionInfo.id,
            async (err, session) => {
              if (err) { callback(err) }
              else {
                session.ipAddress = ipAddress;
                UserAccount.findById(sessionInfo.userId, {
                  "include": ["freelancerprofile", "clientprofile"]
                }, (err, user) => {
                  if (err) callback(err);
                  else {
                    if (isModeratorEmail(user.email)) {
                      user.authAs = 'moderator'
                      user.save((err, user) => {
                        callback(null, {
                          ...session.toJSON(),
                          user,
                        })
                      })
                    } else {
                      callback(null, {
                        ...session.toJSON(),
                        user
                      })
                    }
                  }
                })
              }
            }
          );
        }
      }
    );
  };
};
