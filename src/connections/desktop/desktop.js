/**
 * @module np.connections.desktop
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
        require('./directives'),
        require('../lists/lists'),
        require('../orders/orders'),
        require('../notifications/notifications'),
        require('../navigation/navigation'),
        require('../utils/utils'),
        require('np.directives'),
        require('np.utils'),
        require('nullpointer-rsearch/rsearch/rsearch')
    ];

    return angular.module('np.connections.desktop', _.pluck(angularModules, 'name'));
});
