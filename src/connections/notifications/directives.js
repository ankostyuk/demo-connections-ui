/**
 * @module np.connections.notifications.directives
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

    var templates       = require('text!./views/notifications.html');

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular'),
        templateUtils   = require('template-utils');

    var angularModules = [
    ];

    //
    return angular.module('np.connections.notifications.directives', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            templates = templateUtils.processTemplate(templates).templates;
        }])
        //
        .directive('npConnectionsNotifications', ['$log', '$timeout', '$rootScope', 'npConnectionsNotificationsSet', 'npConnectionsNavigation', 'npRsearchNavigationHelper', function($log, $timeout, $rootScope, npConnectionsNotificationsSet, npConnectionsNavigation, npRsearchNavigationHelper){
            return {
                restrict: 'A',
                scope: {},
                template: templates['notifications-view'].html,
                link: function(scope, element, attrs) {
                    //
                    _.extend(scope, {
                        notificationsSet: new npConnectionsNotificationsSet()
                    });
                }
            };
        }]);
    //
});
