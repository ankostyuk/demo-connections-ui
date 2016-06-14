/**
 * @module np.connections.current-order
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

    var orderResultTemplates = require('text!./views/order-result.html');

    var orderResultTemplatesSettings = {
        evaluate    : /\<%([\s\S]+?)%\>/g,
        interpolate : /\<%=([\s\S]+?)%\>/g,
        escape      : /\<%-([\s\S]+?)%\>/g
    };

                          require('lodash');
    var i18n            = require('i18n'),
        angular         = require('angular'),
        templateUtils   = require('template-utils'),
        download        = require('download');

    var angularModules = [
        require('./resource')
    ];

    //
    return angular.module('np.connections.current-order', _.pluck(angularModules, 'name'))
        //
        .run([function(){
            orderResultTemplates = templateUtils.processTemplate(orderResultTemplates).templates;
        }])
        //
        .factory('npConnectionsCurrentOrder', ['$log', '$rootScope', '$timeout', 'npConnectionsOrdersResource', 'npConnectionsUtils', function($log, $rootScope, $timeout, npConnectionsOrdersResource, npConnectionsUtils){
            return function() {
                var me          = this,
                    _request    = null;

                me.order = null;

                //
                me.nodeTracesView = null;
                me.nodeTracesNodes = null;
                me.nodeTracesCurrentPair = null;

                var _tracesDataSource = {
                    reverse: true,
                    srcInTrace: false,
                    depths: null,
                    tracesRequest: _.noop,
                    nodeClick: _.noop,
                    applyResult: _.noop,
                    doTrace: function(traceIndex) {
                        // ?
                    }
                };

                me.setNodeTracesView = function(nodeTracesView) {
                    me.nodeTracesView = nodeTracesView;
                    nodeTracesView.setDataSource(_tracesDataSource);
                };

                me.doNodePairTracesResult = function(pairIndex) {
                    if (me.nodeTracesCurrentPair === pairIndex) {
                        return;
                    }
                    buildNodePairTracesResult(pairIndex);
                    me.nodeTracesCurrentPair = pairIndex;
                };

                function buildNodeTraces() {
                    if (!me.isResult()) {
                        return;
                    }

                    me.nodeTracesNodes = _.pluck(me.getResultEntries(), 'node');

                    me.doNodePairTracesResult(0);
                    me.nodeTracesView.toggle(true);

                    // test
                    // buildResultText();
                }

                function buildNodePairTracesResult(pairIndex) {
                    var pair        = me.getResultPair(pairIndex),
                        firstNode   = me.getResultEntry(pair.first).node,
                        secondNode  = me.getResultEntry(pair.second).node,
                        filters     = {},
                        traceIndex  = 0;

                    var nodeTracesResult = {
                        nodes: me.nodeTracesNodes,
                        traces: pair.traces,
                        relations: []
                    };

                    me.nodeTracesView.setResult([firstNode, secondNode], filters, nodeTracesResult, traceIndex, false);
                }

                function resetNodeTraces() {
                    if (!me.nodeTracesView) {
                        return;
                    }

                    me.nodeTracesView.toggle(false);
                    me.nodeTracesView.reset();
                    me.nodeTracesNodes = null;
                    me.nodeTracesCurrentPair = null;
                }

                //
                me.getListCount = function() {
                    return _.size(_.get(me.order, 'userLists'));
                };

                me.getResultPairs = function() {
                    return _.get(me.order, 'result.pairs');
                };

                me.getResultPair = function(index) {
                    return _.get(me.getResultPairs(), index);
                };

                me.isEmptyResult = function() {
                    return _.get(me.order, 'status') === 'READY' && _.isEmpty(me.getResultPairs());
                };

                me.isResult = function() {
                    return _.get(me.order, 'status') === 'READY' && !_.isEmpty(me.getResultPairs());
                };

                me.getResultEntries = function() {
                    return _.get(me.order, 'result.entries');
                };

                me.getResultEntry = function(index) {
                    return _.get(me.getResultEntries(), index);
                };

                me.fetch = function(order, callback) {
                    me.order = order;
                    reset();
                    me.fetchOrder(callback);
                };

                me.fetchOrder = function(callback) {
                    _request = npConnectionsOrdersResource.order({
                        id: me.order.id,
                        success: function(data) {
                            _.extend(me.order, data);

                            buildNodeTraces();

                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _request
                    });
                };

                function reset() {
                    me.order.result = null;
                    resetNodeTraces();
                }

                //
                // export
                //
                me.doExportResult = function() {
                    $rootScope.$emit('np-connections-loading', function(done){
                        $timeout(function(){
                            // buildResultHTML();
                            download(buildResultHTML(), 'connections-result.html', 'text/html');
                            // download(buildResultHTML(), 'connections-result.doc', 'application/msword');
                            done();
                        }, 1000);
                    });
                };

                function buildResultHTML() {
                    var htmlView        = orderResultTemplates['order-result-view'].html,
                        htmlTemplate    = _.template(htmlView, orderResultTemplatesSettings);

                    var html = htmlTemplate({
                        me: me
                    });

                    $log.warn('html', html);

                    return html;
                }

                function __buildResultText() {
                    var resultText = ''
                        + '<body>'
                        + '<h1>Результат проверки связей</h1>'
                        + '<br>'
                        + (_.size(me.order.userLists) === 1 ? 'В списке' : 'В списках')
                        + '<br>'
                        + '';

                    _.each(me.order.userLists, function(userList){
                        resultText += ('<h2>' + userList.name + '</h2>');
                    });

                    resultText += ''
                        + '<br>'
                        + 'связаны...'
                        + '<br>'
                        + '';

                    _.each(me.getResultPairs(), function(pair){
                        var firstNode   = me.getResultEntry(pair.first).node,
                            secondNode  = me.getResultEntry(pair.second).node,
                            filters     = {},
                            traceIndex  = 0;

                        var nodeTracesResult = {
                            nodes: me.nodeTracesNodes,
                            traces: pair.traces,
                            relations: []
                        };

                        resultText += ''
                            // + '<br>'
                            + me.nodeTracesView.buildResultText([firstNode, secondNode], nodeTracesResult)
                            + '<br>'
                            + '<hr>'
                            + '';
                    });

                    resultText += ''
                        + '<i>© 2016 Национальное кредитное бюро</i><br>'
                        + '<i>+7 495 229-67-47</i><br>'
                        + '<a href="http://www.creditnet.ru"><i>www.creditnet.ru</i></a><br>'
                        + '</body>'
                        + '';

                    // $log.warn('resultText', '\n', resultText);

                    return resultText;
                }
            };
        }]);
    //
});
