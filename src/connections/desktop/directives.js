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
        .directive('npConnectionsDesktop', ['$log', '$rootScope', '$timeout', '$q', 'nkbUser', 'npUtils', 'npRsearchMetaHelper', 'npConnectionsNavigation', function($log, $rootScope, $timeout, $q, nkbUser, npUtils, npRsearchMetaHelper, npConnectionsNavigation){
            //
            var scrollDuration = 200;

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
                            var completer = $q.defer();

                            npUtils.loading(
                                operation,
                                function(){
                                    scope.loader.show();
                                },
                                function(){
                                    scope.loader.hide();
                                    completer.resolve();
                                },
                            500);

                            return completer.promise;
                        },
                        message: {}, // см. directive npMessage
                        isUserAuthenticated: function() {
                            // TODO права на "Пакетную проверку"
                            return user.isAuthenticated();
                        }
                    });

                    $rootScope.$on('np-connections-loading', function(e, operation){
                        $rootScope.loader = {
                            completePromise: scope.loading(operation)
                        };
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
                    var htmlbodyElement = $('html, body');

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

                                    // TODO uncomment
                                    // if (targetProxy.showCount === 1 || targetProxy.forbidden) {
                                        $rootScope.$emit('np-connections-show-lists', function(hasError, response){
                                            done();
                                        });
                                        targetProxy.forbidden = false;
                                    // } else {
                                    //     done();
                                    // }
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

                    $rootScope.$on('np-connections-scroll-top', function(e){
                        scrollTop();
                    });

                    $rootScope.$on('np-connections-scroll-to-item-or-top', function(e, itemId){
                        scrollToItemOrTop(itemId);
                    });

                    //
                    $q.all([nkbUser.initPromise(), npRsearchMetaHelper.initPromise()]).then(function(){
                        $timeout(function(){
                            $rootScope.$emit('np-connections-show-desktop-nav', '#np-connections-lists');
                            // $rootScope.$emit('np-connections-show-desktop-nav', '#np-connections-orders');
                        }, 100);
                    });

                    //
                    function scrollTop() {
                        htmlbodyElement.animate({
                            scrollTop: 0
                        }, scrollDuration);
                    }

                    function scrollToItemOrTop(itemId) {
                        var itemElement = $('#' + itemId);

                        if (_.isEmpty(itemElement)) {
                            scrollTop(element);
                            return;
                        }

                        htmlbodyElement.animate({
                            scrollTop: itemElement.offset().top
                        }, scrollDuration);
                    }
                }
            };
        }]);
    //
});
