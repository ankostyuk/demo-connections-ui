/**
 * @module np.connections.widgets
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
        require('./directives')
    ];

    return angular.module('np.connections.widgets', _.pluck(angularModules, 'name'));
});
