/**
 * @module np.connections.desktop.directives
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

    var templates = {
        'messages':     require('text!./views/messages.html'),
        'desktop':      require('text!./views/desktop.html')
    };

    var externalTemplates = {
        'np-rsearch-node-info': require('text!../../../external_components/nullpointer-rsearch/rsearch/views/rsearch-node-info.html')
    };
                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular'),
        templateUtils   = require('template-utils');

    var angularModules = [
        require('../lists/lists'),
        require('np.directives'),
        require('np.utils'),
        require('nullpointer-rsearch/rsearch/rsearch')
    ];

    //
    return angular.module('np.connections.desktop.directives', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            _.each(templates, function(template, name){
                templates[name] = templateUtils.processTemplate(template).templates;
            });

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
                template: externalTemplates['np-rsearch-node-info']
            };
        }])
        //
        .directive('npConnectionsDesktop', ['$log', '$rootScope', '$timeout', 'nkbUser', 'npUtils', function($log, $rootScope, $timeout, nkbUser, npUtils){
            return {
                restrict: 'A',
                scope: {},
                template: templates['desktop']['desktop-view'].html,
                //
                controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                    var scope   = $scope,
                        element = $element,
                        attrs   = $attrs;

                    var user = nkbUser.user();

                    _.extend(scope, {
                        loader: {}, // см. directive npLoader
                        loading: function(operation) {
                            npUtils.loading(
                                operation,
                                function(){
                                    scope.loader.show();
                                },
                                function(){
                                    scope.loader.hide();
                                },
                            500);
                        },
                        message: {}, // см. directive npMessage
                        showLoginForm: function() {
                            $('[app-login-form] input[name="login"]').focus();
                        },
                        isUserAuthenticated: function() {
                            // TODO права на "Пакетную проверку"
                            return user.isAuthenticated();
                        }
                    });

                    $rootScope.$on('np-connections-loading', function(e, operation){
                        scope.loading(operation);
                    });

                    $rootScope.$on('np-connections-error', function(){
                        scope.message.show();
                    });
                }],
                //
                link: function(scope, element, attrs) {
                    //
                    scope.message.setMessageHtml(templates['messages']['default-error'].html);

                    // Tab
                    element.find('.desktop-tab > li > a').click(function(e){
                        e.preventDefault();
                        $(this).tab('show');
                    });

                    //
                    $timeout(function(){
                        $rootScope.$emit('np-connections-do-show-lists');
                    }, 500);
                }
            };
        }]);
    //
});
