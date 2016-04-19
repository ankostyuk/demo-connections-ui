/**
 * @module connections
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';
    var angular = require('angular');

    var angularModules = [
        require('./desktop/desktop')
    ];

    return angular.module('np.connections', _.pluck(angularModules, 'name'));
});
