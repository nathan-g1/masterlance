"use strict";

module.exports = function (UserAccount) {
  
  UserAccount.validateToken = function(
    accessToken,
    callback
  ) {
    UserAccount.app.models.Session.findById(
      accessToken,
      {
        include: {
          relation: 'user'
        }
      },  
      async (err, data) =>{
        if (err) return callback(err)
        else {
          if (data)
            callback(null, {
              ...data.toJSON(),
              user: await data.user.get()
            })
          else {
            const err = new Error("not authenticated")
            err.statusCode = 401
            callback(err)
          }
        }
      }
  );
  }

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
    UserAccount.create(
      {
        firstName,
        lastName,
        phoneNumber,
        address,
        dob,
        username,
        email,
        password,
        authAs: "client",
      },
      (err, user) => {
        if (err) {
          callback(err);
        } else {
          user.clientprofile.create(
            {
              ...user,
              password: undefined,
              id: undefined,
            },
            callback
          );
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
    UserAccount.create(
      {
        firstName,
        lastName,
        phoneNumber,
        address,
        dob,
        username,
        email,
        password,
        authAs: "freelancer",
      },
      (err, user) => {
        if (err) {
          callback(err);
        } else {
          user.freelancerprofile.create(
            {
              ...user,
              password: undefined,
              id: undefined,
            },
            callback
          );
        }
      }
    );
  };

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
    phoneNumber,
    username,
    email,
    password,
    ipAddress,
    authAs,
    callback
  ) {
    UserAccount.login(
      {
        username,
        email,
        password,
      },
      'user',
      (err, sessionInfo) => {
        if (err) {
          callback(err, null);
        } else {
          const loginCallback = (userInfo, callback) => (err, session) => {
            if (err) { callback(err) }
            else {
              callback(null, {
                ...session.toJSON(),
                user: userInfo
              })
            }
          }
          UserAccount.app.models.Session.findById(
            sessionInfo.id,
            async (err, session) => {
              if (err) {callback(err)}
              else {
                session.ipAddress = ipAddress;
                if (authAs) {
                  UserAccount.findById(sessionInfo.userId, (err, user) => {
                    if (err) callback(err);
                    else {
                      user.updateAttribute("authAs", authAs, (err, user) => {
                        if (err) callback(err);
                        else session.save(loginCallback(user, callback));
                      });
                    }
                  });
                } else {
                  session.save(loginCallback(await session.user.get(), callback));
                }
              }
            }
          );
        }
      }
    );
  };
};
