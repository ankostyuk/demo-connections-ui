/**
 * @module connections
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require) {'use strict';
                        require('less!./styles/connections');

    var angular = require('angular');

    var angularModules = [
        require('./directives'),
        require('./desktop/desktop')
    ];

    return angular.module('np.connections', _.pluck(angularModules, 'name'));
});
