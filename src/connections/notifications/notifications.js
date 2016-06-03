/**
 * @module np.connections.notifications
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
// @Deprecated
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
        require('./notifications-set'),
        require('./directives')
    ];

    return angular.module('np.connections.notifications', _.pluck(angularModules, 'name'));
});
