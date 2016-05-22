/**
 * @module np.connections.navigation
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
    ];

    //
    return angular.module('np.connections.navigation', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsNavigation', ['$log', '$rootScope', function($log, $rootScope){
            return function(_element) {
                var me = this;

                me.currentTarget = null;
                me.prevTarget = null;

                me.showNav = function(target, noStore) {
                    _element
                        .find('[data-target="' + target + '"]')
                        .eq(0).tab('show')
                        .parent('li').removeClass('active');

                    me.prevTarget = noStore ? null : me.currentTarget;
                    me.currentTarget = target;
                };

                me.doNav = function(e) {
                    e.preventDefault();
                    me.showNav($(e.currentTarget).attr('data-target'));
                };

                me.showDesktopTab = function(target) {
                    $rootScope.$emit('np-connections-show-desktop-tab', target);
                };
            };
        }]);
    //
});
