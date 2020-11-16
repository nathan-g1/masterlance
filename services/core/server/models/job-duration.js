'use strict'

module.exports = function (JobDuration) {
    JobDuration.validatesInclusionOf('unit', { in: ['minutes', 'hours', 'days', 'weeks', 'months'] });
}
