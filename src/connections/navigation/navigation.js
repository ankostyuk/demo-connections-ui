/**
 * @module np.connections.navigation
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

                          require('jquery');
                          require('lodash');
    var angular         = require('angular');

    var angularModules = [
    ];

    //
    return angular.module('np.connections.navigation', _.pluck(angularModules, 'name'))
        //
        .factory('npConnectionsNavigation', ['$log', '$rootScope', function($log, $rootScope){
            return function(options) {
                var me = this;

                me.currentTarget = null;
                me.prevTarget = null;

                me.doNav = function(e) {
                    e.preventDefault();
                    me.showNav($(e.currentTarget).attr('data-target'));
                };

                me.showNav = function(target, noStore) {
                    var targetProxy = _.get(options.targets, target);

                    if (targetProxy) {
                        targetProxy.showCount = targetProxy.showCount ? targetProxy.showCount + 1 : 1;
                    }

                    if (_.isFunction(_.get(targetProxy, 'before'))) {
                        targetProxy.before(targetProxy, function(){
                            showNav(target, noStore);
                        });
                    } else {
                        showNav(target, noStore);
                    }

                    if (_.isFunction(_.get(targetProxy, 'after'))) {
                        targetProxy.after(targetProxy);
                    }
                };

                me.getNavElement = function(target) {
                    return options.element
                                .find('[data-target="' + target + '"]')
                                .eq(0);
                };

                function showNav(target, noStore) {
                    var tab = me.getNavElement(target).tab('show');

                    if (!options.markActive) {
                        tab.parent('li').removeClass('active');
                    }

                    me.prevTarget = noStore ? null : me.currentTarget;
                    me.currentTarget = target;
                }

                me.showDesktopNav = function(target) {
                    $rootScope.$emit('np-connections-show-desktop-nav', target);
                };
            };
        }]);
    //
});
