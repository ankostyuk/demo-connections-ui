/**
 * @module np.connections.orders
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
        require('./orders-set'),
        require('./current-order'),
        require('./directives'),
        require('./resource')
    ];

    return angular.module('np.connections.orders', _.pluck(angularModules, 'name'));
});
