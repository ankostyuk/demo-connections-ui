/**
 * @module desktop
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

    var template        = require('text!./views/desktop.html');

                          require('jquery');
                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular');

    var angularModules = [
        require('../lists/lists')
    ];

    //
    return angular.module('np.connections.desktop', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            template = i18n.translateTemplate(template);
        }])
        //
        .directive('npConnectionsDesktop', [function(){
            return {
                restrict: 'A',
                scope: false,
                template: template,
                link: function(scope, element, attrs) {
                    // Tab
                    element.find('.desktop-tab > li > a').click(function(e){
                        e.preventDefault();
                        $(this).tab('show');
                    });
                }
            };
        }]);
    //
});
