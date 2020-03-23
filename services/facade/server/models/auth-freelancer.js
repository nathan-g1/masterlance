'use strict';

module.exports = function (Authfreelancer) {

    /**
     * register as freelancer
     * @param {object} credentials 
     * @param {Function(Error, object)} callback
     */

    Authfreelancer.register = function (credentials, callback) {
        Authfreelancer.Freelancer_create({
            data: credentials
        }, (err, result) => {
            if (err)
                callback(err.obj.error, null)
            else
                callback(null, result.get('obj'))
        });

    };
};
