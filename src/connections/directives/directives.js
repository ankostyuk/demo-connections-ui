/**
 * @module directives
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
// TODO перенести в [commons-js](https://github.com/newpointer/commons-js)
//
define(function(require, exports, module) {'use strict';

                          require('less!./styles/directives');

    var template        = require('text!./views/directives.html'),
        templateData, viewTemplates;

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular'),
        templateUtils   = require('template-utils');

    var angularModules = [];

    //
    return angular.module('np.connections.directives', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            templateData    = templateUtils.processTemplate(template);
            viewTemplates   = templateData.templates;
        }])
        //
        .directive('npInlineEdit', ['$log', '$timeout', function($log, $timeout){
            return {
                restrict: 'A',
                scope: {
                    model: '=npInlineEdit',
                    proxy: '=proxy',
                    data: '=data'
                },
                template: viewTemplates['inline-edit'].html,
                link: function(scope, element, attrs) {
                    var inputElement  = element.find('.inline-edit-input input');

                    //
                    inputElement.keyup(function(e){
                        // esc
                        if (e.keyCode === 27) {
                            scope.$apply(function(){
                                scope.off();
                            });
                        } else
                        // enter
                        if (e.keyCode === 13) {
                            scope.$apply(function(){
                                scope.edit();
                            });
                        }
                    });

                    //
                    _.extend(scope, {
                        active: false,
                        on: function() {
                            if (!scope.active) {
                                initText();

                                scope.active = true;
                                element.addClass('active');
                            }

                            $timeout(function(){
                                inputElement.focus();
                            });
                        },
                        off: function() {
                            if (!scope.active) {
                                return;
                            }

                            scope.active = false;
                            element.removeClass('active');
                        },
                        edit: function() {
                            scope.off();

                            if (scope.newText === scope.oldText) {
                                return;
                            }

                            if (_.isFunction(scope.proxy.onEdit)) {
                                scope.proxy.onEdit(scope.newText, scope.oldText, scope.data);
                            }
                        }
                    });

                    _.extend(scope.proxy, {
                        on: function() {
                            scope.on();
                        },
                        off: function() {
                            scope.off();
                        }
                    });

                    function initText() {
                        var text = '' + scope.model;
                        scope.oldText = text;
                        scope.newText = text;
                    }
                }
            };
        }])
        //
        .directive('npInlineConfirm', ['$log', function($log){
            return {
                restrict: 'A',
                scope: false,
                link: function(scope, element, attrs) {
                    var confirmText = attrs['confirmText'];

                    var confirmElement = $('<span>', {
                        html: viewTemplates['inline-confirm'].html
                    });

                    confirmElement.find('.inline-confirm-text').text(confirmText);

                    var confirmExp      = attrs['npInlineConfirm'],
                        confirmHTML     = confirmElement.html(),
                        originalHTML    = element.html(),
                        confirm         = true;

                    element
                        .click(function(){
                            doConfirm();
                        })
                        .blur(function(){
                            reset();
                        });

                    function setConfirmHTML() {
                        element.html(confirmHTML);
                    }

                    function setOriginalHTML() {
                        element.html(originalHTML);
                    }

                    function doConfirm() {
                        if (confirm) {
                            setConfirmHTML();
                        } else {
                            setOriginalHTML();
                            scope.$eval(confirmExp);
                        }

                        confirm = !confirm;
                    }

                    function reset() {
                        if (confirm) {
                            return;
                        }

                        setOriginalHTML();
                        confirm = true;
                    }
                }
            };
        }]);
    //
});
