'use strict'

module.exports = function (Job) {
  Job.all = async function () {
    return Job.Job_find({}).get('obj')
  }
}
