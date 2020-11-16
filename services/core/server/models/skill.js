'use strict'

module.exports = function (Skill) {
    Skill.validatesUniquenessOf('label', {message: 'skill is already available'})
}
