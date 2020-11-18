"use strict";

module.exports = function (UserAccount) {
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
      (err, sessionInfo) => {
        if (err) {
          callback(err, null);
        } else {
          UserAccount.app.models.Session.findById(
            sessionInfo.id,
            (err, session) => {
              session.ipAddress = ipAddress;
              if (authAs) {
                UserAccount.findById(sessionInfo.userId, (err, user) => {
                  if (err) callback(err);
                  else {
                    user.updateAttribute("authAs", authAs, (err, _) => {
                      if (err) callback(err);
                      else session.save(callback);
                    });
                  }
                });
              } else session.save(callback);
            }
          );
        }
      }
    );
  };
};
