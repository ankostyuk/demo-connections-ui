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

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular'),
        templateUtils   = require('template-utils');

    var angularModules = [
    ];

    //
    return angular.module('np.connections.desktop.directives', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            _.each(templates, function(template, name){
                templates[name] = templateUtils.processTemplate(template).templates;
            });
        }])
        //
        .directive('npConnectionsDesktop', ['$log', '$rootScope', '$timeout', 'nkbUser', 'npUtils', 'npConnectionsNavigation', function($log, $rootScope, $timeout, nkbUser, npUtils, npConnectionsNavigation){
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

                    //
                    var navOptions = {
                        element: element,
                        markActive: true,
                        targets: {
                            '#np-connections-lists': {
                                before: function(targetProxy, done) {
                                    if (!scope.isUserAuthenticated()) {
                                        targetProxy.forbidden = true;
                                        return;
                                    }

                                    if (targetProxy.showCount === 1 || targetProxy.forbidden) {
                                        $rootScope.$emit('np-connections-show-lists', function(hasError, response){
                                            done();
                                        });
                                        targetProxy.forbidden = false;
                                    } else {
                                        done();
                                    }
                                }
                            },
                            '#np-connections-orders': {
                                before: function(targetProxy, done) {
                                    // TODO uncomment
                                    // if (targetProxy.showCount === 1) {
                                        $rootScope.$emit('np-connections-show-orders', done);
                                    // } else {
                                    //     done();
                                    // }
                                }
                            }
                        }
                    };

                    _.extend(scope, {
                        navigation: new npConnectionsNavigation(navOptions),
                        showLoginForm: function() {
                            $('[app-login-form] input[name="login"]').focus();
                        }
                    });

                    //
                    $rootScope.$on('np-connections-show-desktop-nav', function(e, target){
                        scope.navigation.showNav(target);
                    });

                    $timeout(function(){
                        $rootScope.$emit('np-connections-show-desktop-nav', '#np-connections-lists');
                        // $rootScope.$emit('np-connections-show-desktop-nav', '#np-connections-orders');
                    }, 500);
                }
            };
        }]);
    //
});
