'use strict';

var mean = require('meanio');

exports.render = function(req, res) {

    var modules = [];

    // Preparing angular modules list with dependencies
    for (var name in mean.modules) {
        modules.push({
            name: name,
            module: 'mean.' + name,
            angularDependencies: mean.modules[name].angularDependencies
        });
    }

    function isAdmin() {
        return req.user && req.user.roles.indexOf('admin') !== -1;
    }

    // Send some basic starting info to the view
    res.render('index', {
        user: req.user ? {
            _id: req.user._id,
			follows: req.user.follows,
			followsFull: req.user.followsFull,
            name: req.user.name,
            roles: req.user.roles,
            username: req.user.username
        } : {},
        modules: modules,
        isAdmin: isAdmin,
        adminEnabled: isAdmin() && mean.moduleEnabled('mean-admin')
    });
};
