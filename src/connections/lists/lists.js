/**
 * @module np.connections.lists
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
        require('./lists-set'),
        require('./new-list'),
        require('./current-list'),
        require('./directives'),
        require('./resource')
    ];

    //
    return angular.module('np.connections.lists', _.pluck(angularModules, 'name'));
});
