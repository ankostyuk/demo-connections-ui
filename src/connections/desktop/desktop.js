/**
 * @module desktop
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

    var template        = require('text!./views/desktop.html');

    var externalTemplates = {
        'np-rsearch-node-info':     require('text!../../../external_components/nullpointer-rsearch/rsearch/views/rsearch-node-info.html')
    };
                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular');

    var angularModules = [
        require('../lists/lists'),
        require('nullpointer-rsearch/rsearch/rsearch')
    ];

    //
    return angular.module('np.connections.desktop', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            template = i18n.translateTemplate(template);

            _.each(externalTemplates, function(template, name){
                externalTemplates[name] = i18n.translateTemplate(template);
            });
        }])
        //
        .directive('npConnectionsNodeInfo', ['$log', function($log){
            return {
                restrict: 'A',
                scope: {
                    node: '=npConnectionsNodeInfo'
                },
                template: externalTemplates['np-rsearch-node-info'],
                link: function(scope, element, attrs) {
                }
            };
        }])
        //
        .directive('npConnectionsDesktop', ['$log', '$rootScope', '$timeout', 'nkbUser', function($log, $rootScope, $timeout, nkbUser){
            return {
                restrict: 'A',
                scope: false,
                template: template,
                link: function(scope, element, attrs) {
                    var user = nkbUser.user();

                    // Tab
                    element.find('.desktop-tab > li > a').click(function(e){
                        e.preventDefault();
                        $(this).tab('show');
                    });

                    //
                    _.extend(scope, {
                        showLoginForm: function() {
                            $('[app-login-form] input[name="login"]').focus();
                        },
                        isUserAuthenticated: function() {
                            // TODO права на "Пакетную проверку"
                            return user.isAuthenticated();
                        }
                    });

                    //
                    // $timeout(function(){
                        $rootScope.$emit('np-connections-do-show-lists');
                    // }, 1000);
                }
            };
        }]);
    //
});
