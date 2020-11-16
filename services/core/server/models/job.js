'use strict'

module.exports = function (Job) {
  Job.addSkills = function (jobId, skillsRequired, callback) {
    Job.findById(jobId, async (err, job) => {
      if (err) {
        callback(err, null)
      } else {
        for (const skillId of skillsRequired) {
          await job.skillsRequired.add(skillId)
        }
        callback(null, job)
      }
    })
  }

  Job.postJob = function (
    title,
    price,
    description,
    noOfFreelancersNeeded,
    postedBy,
    duration,
    callback
  ) {

    Job.app.models.JobDuration.create(duration, (err, jobDuration) => {
      if (err) {
        callback(err, null);
      } else {
        Job.create({
          title,
          price,
          description,
          noOfFreelancersNeeded,
          postedBy
        }, (err, job) => {
          if (err) {
            callback(err, null);
          } else {

            const { amount, unit } = jobDuration;

            job.duration.update({
              amount,
              unit
            }, (err, duration) => {
              if (err) {
                callback(err, null);
              } else {
                callback(null, job);
              }
            })
          }
        })
      }
    })


  }

  Job.afterRemote('postJob', function (ctx, instance, next) {
    Job.app.models.Activity.create({
      jobId: instance.id
    }, (err, data) => {
      next()
    })

  })

  Job.prototype.applyProposal = function (body, price, duration, numberOfMilestones, proposedBy, callback) {

    Job.app.models.Proposal.findOne({
      jobId: this.id,
      filter: {
        where: {
          proposedBy
        }
      }
    }, (err, data) => {
      if (data) {
        callback(new Error('You have already applied on this job'), null);
      } else {
        Job.app.models.Proposal.create({
          body, price, numberOfMilestones, proposedBy, jobId: this.id
        }, (err, proposal) => {
          if (err) {
            callback(err, null);
          }
          else {
            Job.app.models.JobDuration.create({ ...duration, proposalId: proposal.id }, (err, jobDuration) => {
              if (err) {
                callback(err, null);
              } else {
                callback(null, proposal)
              }
            })
          }
        })
      }
    })
  }

  Job.prototype.approve = function (callback) {

    this.updateAttribute('isApproved', true, (err, data) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, this);
      }
    })
  }

  Job.prototype.acceptProposal = function (proposalId, callback) {

    this.contracts.find((err, data) => {
      if (data.length >= this.noOfFreelancersNeeded) {
        callback(new Error("job has reached contacts limit (no of freelancers)"), null);
      } else {
        Job.app.models.Proposal.findOne({
          jobId: this.id,
          id: proposalId
        }, (err, proposal) => {
          if (err) {
            callback(err, null);
          } else {
            Job.app.models.Contract.find({
              filter: {
                where: { proposalId, jobId: this.id }
              }
            }, (err, existingContract) => {
              if (err) {
                callback(err, null);
              } else {
                if (existingContract.length) {
                  callback(new Error('the proposal has already been accepted'), null);
                } else {
                  Job.app.models.Contract.create({
                    proposalId: proposal.id,
                    jobId: this.id
                  }, (err, contract) => {
                    if (err) {
                      callback(err, null);
                    } else {
                      callback(null, contract)
                    }
                  })
                }
              }
            })
          }
        })
      }
    })
  }
}
