'use strict';

const escapeRegExp = require('lodash.escaperegexp');

module.exports = function (Skill) {
    Skill.fetchAllAvailableSkills = function (callback) {
        Skill.app.models.Core.Skill_find({}, (err, result) => {
            if (err) {
                callback(err.obj.error, null);
            } else {
                callback(null, result.obj);
            }
        })
    }
    
    Skill.skillById = function (id, callback) {
        Skill.app.models.Core.Skill_findById({
            id
        }, (err, result) => {
            if (err) {
                callback(err.obj.error, null);
            } else {
                callback(null, result.obj);
            }
        })
    }

    Skill.searchForAvailableSkills = function (query, callback) {
        if (query.length < 3) {
            callback('you must send at least 3 characters')
        } else {
            Skill.app.models.Core.Skill_find({
                filter: JSON.stringify(
                    {
                        where: {
                            label: {
                                like: escapeRegExp(query),
                                options: "i" 
                            }
                        }
                    }
                )
            }, (err, data) => {
                if (err) {
                    callback(err.obj.error, null);
                } {
                    callback(null, data.obj);
                }
            })

        }
    }
};
