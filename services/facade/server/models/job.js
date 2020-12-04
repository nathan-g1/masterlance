'use strict'

module.exports = function (Job) {
  Job.all = function (callback) {
    Job.Job_find({
      filter: JSON.stringify({
        include: [
          'skillsRequired',
          {
            relation: 'activities',
            scope: {
              fields: ['lastInterviewDate', 'interviewing']
            }
          }
        ],
        order: 'createdAt DESC'
      })
    }, (err, result) => {
      if (err) { callback(err.obj.error, null) } else { callback(null, result.obj) }
    })
  }

  Job.feed = function (accessToken, callback) {
    Job.app.models.UserAccount.validateToken(accessToken, (err, session) => {
      if (err) return callback(err)
      else if (session) {
        const { user } = session

        if (user.authAs == 'freelancer' && user.freelancerprofile) {
          Job.Job_find({
            filter: JSON.stringify({
              include: [
                'skillsRequired',
                {
                  relation: 'activities',
                  scope: {
                    fields: ['lastInterviewDate', 'interviewing']
                  }
                }
              ],
              order: 'createdAt DESC'
            })
          }, (err, result) => {
            if (err) { callback(err.obj.error, null) } else {
              const jobs = result.obj.sort((jobA, jobB) => {
                const skillsRequiredForJobA = jobA.skillsRequired.map(({ id }) => id)
                const skillsRequiredForJobB = jobB.skillsRequired.map(({ id }) => id)
                
                const skillsRequiredForJobAIntersectionFreelancerSkills = skillsRequiredForJobA.filter(skillID => user.freelancerprofile.skillsIDs.includes(skillID))
                const skillsRequiredForJobBIntersectionFreelancerSkills = skillsRequiredForJobB.filter(skillID => user.freelancerprofile.skillsIDs.includes(skillID))

                return skillsRequiredForJobBIntersectionFreelancerSkills.length - skillsRequiredForJobAIntersectionFreelancerSkills.length
              })

              callback(null, jobs)
            }
          })

        } else {
          callback(new Error('you must be authenticated as a freelancer and have a profile'))
        }
      }
    })
  }

  Job.myJobs = function (accessToken, callback) {
    Job.app.models.UserAccount.validateToken(accessToken, (err, session) => {
      if (err) return callback(err)
      else if (session) {
        const { user } = session

        if (user.authAs == 'client' && user.clientprofile) {
          Job.Job_find({
            filter: JSON.stringify({
              include: [
                'skillsRequired',
                {
                  relation: 'activities',
                  scope: {
                    fields: ['lastInterviewDate', 'interviewing']
                  }
                }
              ],
              order: 'createdAt DESC'
            })
          }, (err, result) => {
            if (err) { callback(err.obj.error, null) } else {
              callback(null, result.obj.filter(({ postedBy }) => user.clientprofile.id === postedBy))
            }
          })

        } else {
          callback(new Error('you must be authenticated as a client and have a profile'))
        }
      }
    })
  }

  Job.create = function (
    accessToken,
    title,
    price,
    description,
    noOfFreelancersNeeded,
    skillsRequired,
    duration,
    callback
  ) {

    Job.app.models.UserAccount.validateToken(accessToken, (err, session) => {
      if (err) return callback(err)
      else if (session) {
        const { user } = session
        if (user.authAs === 'client') {
          const { userId } = session
          Job.app.models.Payment.Wallet_getBalance({
            userId
          }, (err, data) => {
            if (err) callback(err.obj.error)
            else {

              const wallet = data.obj;

              if (Number(price) <= Number(wallet.activeBalance) - 1) {
                const profile = user.clientprofile;
                if (profile.restrictionsLeft >= 1) {
                  Promise.all(
                    skillsRequired.map(skillId => Job.app.models.Job.Skill_findById({
                      id: skillId
                    })
                  )).then(() => {
                    Job.app.models.Job.Job_postJob({
                      title,
                      price,
                      description,
                      noOfFreelancersNeeded,
                      postedBy: profile.id,
                      duration: JSON.stringify(duration)
                    }, (err, job) => {
                      if (err) {
                        callback(err.obj.error)
                      } else {
                        Job.app.models.Job.Job_addSkills({
                          jobId: job.obj.id,
                          skillsRequired
                        }, (err, data) => {
                          if (err) {
                            callback(err.obj.error)
                          } else {
                            Job.app.models.Payment.Transaction_createJobPostingTransaction({
                              amount: Number(price),
                              from: userId,
                              jobId: job.obj.id
                            }, (err, data) => {
                              if (err) callback(err.obj.error)
                              else {
                                callback(null, job.obj)
                              }
                            })
                          }
                        })
                      }
                    })
                  }).catch(err => {
                    callback(err.obj.error, null)
                  })
                } else {
                  callback(new Error('You have been restricted from posting jobs'), null)
                }
              } else {
                callback(new Error(`You don't have sufficient balance in your wallet account. please top-up balance over 'settings'.`))
              }

            }
          })

        } else {
          callback(new Error('You must be logged in as CLIENT to post jobs'), null)
        }
      }
    })
  }


  Job.fetchJobsBySkill = function (skillId, callback) {
    Job.Job_find({
      filter: JSON.stringify({
        include: [
          'skillsRequired',
          {
            relation: 'activities',
            scope: {
              fields: ['lastInterviewDate', 'interviewing']
            }
          }
        ],
        order: 'createdAt DESC'
      })
    }, (err, result) => {
      if (err) { callback(err.obj.error, null) } else {
        callback(null, result.obj.filter(x => x.skillsRequired.filter(y => y.id == skillId).length > 0))
      }
    })
  }

  Job.applyProposal = function (accessToken, jobId, body, price, duration, numberOfMilestones, callback) {
    Job.app.models.AuthFreelancer.RoleResolver_resolveToken(
      {
        accessToken
      },
      (err, data) => {
        if (err) { callback(err.obj.error, null) } else {
          const userData = data.obj
          if (userData.freelancerId) {
            if (userData.restrictionsLeft >= 1) {
              Job.Job_prototype_applyProposal({
                id: jobId,
                body, price, duration: JSON.stringify(duration), numberOfMilestones, proposedBy: userData.freelancerId
              }, (err, data) => {
                if (err) {
                  callback(err.obj.error, null);
                } else {
                  callback(null, data.obj);
                }
              })

            } else {
              callback(new Error('You have been restricted from applying proposals for jobs'), null)
            }
          } else {
            callback(new Error('You must be logged in as FREELANCER role to apply proposals for jobs'), null)
          }
        }
      }
    )
  }

  Job.approveJob = function (accessToken, jobId, callback) {
    Job.app.models.AuthModerator.RoleResolver_resolveToken(
      {
        accessToken
      },
      (err, data) => {
        if (err) { callback(err.obj.error, null) } else {
          const userData = data.obj
          if (userData.moderatorId) {
            Job.Job_prototype_approve({
              id: jobId
            }, (err, data) => {
              if (err) {
                callback(err.obj.error, null);
              } else {
                callback(null, data.obj);
              }
            })
          } else {
            callback(new Error('You must be logged in as MODERATOR role to approve jobs'), null)
          }
        }
      }
    )
  }

  Job.proposals = function (accessToken, jobId, callback) {
    Job.app.models.AuthClient.RoleResolver_resolveToken(
      {
        accessToken
      },
      (err, data) => {
        if (err) { callback(err.obj.error, null) } else {
          const userData = data.obj
          if (userData.clientId) {
            Job.Job_findById({
              id: jobId.toString(),
              filter: JSON.stringify({
                include: [
                  'proposals'
                ],
                order: 'createdAt DESC'
              })
            }, (err, data) => {
              if (err) {
                callback(err.obj.error, null);
              } else {
                if (data.obj.postedBy == userData.clientId.toString()) {
                  callback(null, data.obj);
                } else {
                  callback(new Error("NOT authorized to see the proposals"), null);
                }
              }
            })
          } else {
            callback(new Error('You must be logged in as the CLIENT user who posted the job'), null)
          }
        }
      }
    )
  }


  Job.acceptProposal = function (accessToken, jobId, proposalId, callback) {

    Job.app.models.AuthClient.RoleResolver_resolveToken(
      {
        accessToken
      },
      (err, data) => {
        if (err) { callback(err.obj.error, null) } else {
          const userData = data.obj
          if (userData.clientId) {
            Job.Job_findById({
              id: jobId.toString()
            }, (err, data) => {
              if (err) {
                callback(err.obj.error, null);
              } else {
                if (data.obj.postedBy == userData.clientId.toString()) {

                  Job.Job_prototype_acceptProposal({
                    id: jobId,
                    proposalId
                  }, (err, data) => {
                    if (err) {
                      callback(err.obj.error, null);
                    } else {
                      callback(null, data.obj);
                    }
                  })


                } else {
                  callback(new Error("NOT authorized to accept that proposal"), null);
                }
              }
            })
          } else {
            callback(new Error('You must be logged in as the CLIENT user who posted the job'), null)
          }
        }
      }
    )
  }

  Job.contracts = function (accessToken, jobId, callback) {
    Job.app.models.AuthClient.RoleResolver_resolveToken(
      {
        accessToken
      },
      (err, data) => {
        if (err) { callback(err.obj.error, null) } else {
          const userData = data.obj
          if (userData.clientId) {
            Job.Job_findById({
              id: jobId.toString(),
              filter: JSON.stringify({
                include: [
                  'contracts'
                ],
                order: 'createdAt DESC'
              })
            }, (err, data) => {
              if (err) {
                callback(err.obj.error, null);
              } else {
                if (data.obj.postedBy == userData.clientId.toString()) {
                  callback(null, data.obj);
                } else {
                  callback(new Error("NOT authorized to see the proposals"), null);
                }
              }
            })
          } else {
            callback(new Error('You must be logged in as the CLIENT user who posted the job'), null)
          }
        }
      }
    )
  }


  Job.reviews = function (jobId, callback) {
    Job.Job_findOne({
      filter: JSON.stringify({
        where: {
          id: jobId
        },
        fields: ["id", "postedBy"],
        include: "reviews"
      })
    },
      (err, data) => {
        if (err) {
          callback(err.obj, null);
        } else {
          callback(null, data.obj);
        }
      })
  }

  Job.reviewJob = function (accessToken, jobId, rate, comment, callback) {
    if (!accessToken) {
      callback(new Error("You must be authenticated"), null);
    } else {
      Job.app.models.AuthClient.RoleResolver_resolveToken(
        {
          accessToken
        },
        (err, data) => {
          if (err) { callback(err.obj.error, null) } else {
            const userData = data.obj;

            if (userData.freelancerId) {
              Job.Review_create({
                data: {
                  jobId,
                  rate,
                  comment,
                  reviewerId: userData.freelancerId,
                  reviewerRole: 'FREELANCER'
                }
              }, (err, data) => {
                if (err) {
                  callback(err.obj, null);
                } else {
                  callback(null, data.obj);
                }
              })
            } else {
              callback(new Error("only freelancers are authorized to give review to jobs"), null);
            }
          }
        }
      )
    }
  }
}


