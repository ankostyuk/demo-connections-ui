/**
 * @module np.connections.current-order
 * @desc RequireJS/Angular module
 * @author ankostyuk
 */
define(function(require, exports, module) {'use strict';

    var orderResultTemplates = require('text!./views/order-result.html');

    var orderResultTemplatesSettings = {
        evaluate:       /<%([\s\S]+?)%>/g,
        interpolate:    /<%=([\s\S]+?)%>/g,
        escape:         /<%-([\s\S]+?)%>/g
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
                var me                      = this,
                    _tracesInfo             = {},
                    _request                = null,
                    _sendOrdersViewRequest  = null;

                me.order = null;

                //
                me.nodeTracesView = null;
                me.nodeTracesNodes = null;
                me.nodeTracesCurrentPair = null;
                me.nodeTracesCurrentTrace = null;

                var _tracesDataSource = {
                    reverse: true,
                    srcInTrace: false,
                    depths: null,
                    tracesRequest: _.noop,
                    nodeClick: _.noop,
                    applyResult: null,
                    doTrace: function(traceIndex) {
                        me.nodeTracesCurrentTrace = traceIndex;
                    }
                };

                me.getCurrentTraceInfo = function() {
                    if (_.isNull(me.nodeTracesCurrentPair) || _.isNull(me.nodeTracesCurrentTrace)) {
                        return {};
                    }

                    var info = _.get(_tracesInfo, [me.nodeTracesCurrentPair, me.nodeTracesCurrentTrace]);

                    if (info) {
                        return info;
                    }

                    info = {
                        checked: false
                    };

                    _.set(_tracesInfo, [me.nodeTracesCurrentPair, me.nodeTracesCurrentTrace], info);

                    return info;
                };

                me.isCurrentTraceChecked = function() {
                    return me.isTraceChecked(me.nodeTracesCurrentPair, me.nodeTracesCurrentTrace);
                };

                me.isTraceChecked = function(pairIndex, traceIndex) {
                    return _.get(_tracesInfo, [pairIndex, traceIndex, 'checked']);
                };

                me.isTracesChecked = function() {
                    var checked = false;

                    _.each(_tracesInfo, function(p){
                        _.each(p, function(t){
                            checked = t.checked;
                            return !checked;
                        });
                        return !checked;
                    });

                    return checked;
                };

                me.isPairTracesChecked = function(pairIndex) {
                    var checked = false;

                    _.each(_tracesInfo[pairIndex], function(t){
                        checked = t.checked;
                        return !checked;
                    });

                    return checked;
                };

                me.getPairCheckedTraces = function(pairIndex) {
                    var pair = me.getResultPair(pairIndex);

                    if (!pair) {
                        return null;
                    }

                    var traces = _.filter(pair.traces, function(trace, traceIndex){
                        return me.isTraceChecked(pairIndex, traceIndex);
                    });

                    return traces;
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

                    _tracesInfo = {};

                    me.nodeTracesView.toggle(false);
                    me.nodeTracesView.reset();
                    me.nodeTracesNodes = null;
                    me.nodeTracesCurrentPair = null;
                    me.nodeTracesCurrentTrace = null;
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

                me.isFailResult = function() {
                    return _.get(me.order, 'status') === 'FAILED';
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

                            normalizeResult();
                            buildNodeTraces();

                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function() {
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _request
                    });
                };

                me.sendOrderView = function(callback) {
                    _sendOrdersViewRequest = npConnectionsOrdersResource.ordersView({
                        data: [me.order.id],
                        success: function(data) {
                            npConnectionsUtils.requestDone(false, arguments, callback);
                        },
                        error: function(data, status) {
                            npConnectionsUtils.requestDone(true, arguments, callback);
                        },
                        previousRequest: _sendOrdersViewRequest
                    });
                };

                // Убрать дубликаты цепочек
                // TODO убрать данный код,
                // когда дубликаты цепочек будут убраны на сервере
                function normalizeResult() {
                    _.each(_.get(me.order, 'result.pairs'), function(pair){
                        var uniqTraces = [];

                        _.each(pair.traces, function(trace, i){
                            if (!_.isEqual(trace, pair.traces[i - 1])) {
                                uniqTraces.push(trace);
                            }
                        });

                        pair.traces = uniqTraces;
                    });
                }

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
                            // download(buildResultHTML(), 'connections-result.html', 'text/html');
                            download(buildResultHTML(), 'connections-result.doc', 'application/msword');
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

                    return html;
                }
            };
        }]);
    //
});
