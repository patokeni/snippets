// ==UserScript==
// @name         福建综合素质
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://112.111.2.107/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// @grant        GM_addElement
// @run-at       document-end
// @connect      112.111.2.107
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';

    var mini = unsafeWindow.mini;

    function Auditor() {

    }

    Auditor.prototype.messageBoxID = null;
    Auditor.prototype.multiAuditData = {
        enabled: false,
        completed: 0,
        total: 0,
        data: null,
        current: -1,
        auditState: -1
    };

    Auditor.prototype.audit = function(data, auditState) {
        console.log(data);
        this.next();
    };

    Auditor.prototype.next = function() {
        if (this.multiAuditData.enabled) {
            this.multiAuditData.current++;
            if (this.multiAuditData.current >= this.multiAuditData.total) {
                this.finish();
            } else {
                console.log(JSON.stringify(this.multiAuditData.data[auditor.multiAuditData.current]) + " " + (auditor.multiAuditData.current + 1) + "/" + auditor.multiAuditData.total);
                this.audit(this.multiAuditData.data[auditor.multiAuditData.current], this.multiAuditData.auditState);
            }
        }
    };

    Auditor.prototype.finish = function() {
        console.log("finished");

        if (this.messageBoxID != null) {
            mini.hideMessageBox(this.messageBoxID);
            this.messageBoxID = null;
        }

        mini.showMessageBox({
            title: "完成",
            message: "操作已完成",
            buttons: ["ok"],
            callback: function(action){
            }
        });

        this.multiAuditData = {
            enabled: false,
            completed: 0,
            total: 0,
            data: null,
            current: -1,
            auditState: -1
        };

        unsafeWindow.location.reload();
    };

    Auditor.prototype.auditAll = function(data, auditState) {
        var auditor = this;
        if (data.length == 0) {
            mini.showMessageBox({
                title: "无效操作",
                message: "没有数据需要被审核",
                buttons: ["ok"],
                callback: function(action){
                }
            });

            return;
        }
        auditor.multiAuditData = {
            enabled: true,
            completed: 0,
            total: data.length,
            data: data,
            current: -1,
            auditState: auditState
        };
        this.messageBoxID = mini.loading("审核中，请稍后", "审核中");
        /*mini.showMessageBox({
            title: "审核中",
            message: "正在审核",
            callback: function(action){
            }
        });*/
        this.next();
    };

    Auditor.prototype.acceptAll = function() {
        var auditor = this;
        var data = mini.get("datagrid").getData();
        var messageid = mini.loading("加载中，请稍后", "加载中");
        var toDeny = [];
        data.forEach(function(entry) {
            if (entry.auditState == 2) {
                toDeny.push(entry);
            }
        });
        mini.hideMessageBox(messageid);
        mini.confirm("确定将" + toDeny.length + "条数据审核通过？", "确定？",
            function (action) {
                if (action == "ok") {
                    auditor.auditAll(toDeny, 3);
                }
            }
        );
    };

    Auditor.prototype.denyAll = function() {
        var auditor = this;
        var data = mini.get("datagrid").getData();
        var messageid = mini.loading("加载中，请稍后", "加载中");
        var toAccept = [];
        data.forEach(function(entry) {
            if (entry.auditState == 2) {
                toAccept.push(entry);
            }
        });
        mini.hideMessageBox(messageid);
        mini.confirm("确定将" + toAccept.length + "条数据审核不通过？", "确定？",
            function (action) {
                if (action == "ok") {
                    auditor.auditAll(toAccept, 4);
                }
            }
        );
    };

    Auditor.prototype.loadMenus = function() {
        var menuParent = $('<ul id="tmscript-audit-menu" class="mini-menubar" style="width:100%;"></ul>').prependTo($("body"));
        var subMenuParent = $('<li><span>批量审核</span></li>').appendTo(menuParent);
        var auditMenuParent = $('<ul></ul>').appendTo(subMenuParent);
        $('<li onclick="auditor.acceptAll()">通过全部</li>').appendTo(auditMenuParent);
        $('<li onclick="auditor.denyAll()">不通过全部</li>').appendTo(auditMenuParent);
    };

    var auditor = new Auditor();

    unsafeWindow.auditor = auditor;
    if (unsafeWindow.config) {
        unsafeWindow.require.config(unsafeWindow.config);
    }

    console.log(self.location.pathname);
    switch (self.location.pathname) {
        case "/eedu_pro_fj/r_to_highSxpd_examine_activities_main.do":
            unsafeWindow.require(["highSxpdApi"], function(api) {
                auditor.audit = function(data, auditState) {
                    var _params = {
                        "id": data.id,
                        "auditDesc": data.auditDesc,
                        "auditState": auditState,
                        "termId": unsafeWindow.parentData.termId
                    };

                    api.auditMidschSxpdAct(_params).then(function (data, message) {
                        console.log(data + " " + message);
                        auditor.next();
                    })
                }
                auditor.loadMenus();
            });
            break;

        case "/eedu_pro_fj/r_to_highSxpd_examine_reward_main.do":
            unsafeWindow.require(["highSxpdApi"], function(api) {
                auditor.audit = function(data, auditState) {
                    var _params = {
                        "id": data.id,
                        "auditDesc": data.auditDesc,
                        "auditState": auditState,
                        "termId": unsafeWindow.parentData.termId
                    };

                    api.auditMidschSxpdHonor(_params).then(function (data, message) {
                        console.log(data + " " + message);
                        auditor.next();
                    })
                }
                auditor.loadMenus();
            });
            break;

        case "/eedu_pro_fj/r_to_highShsj_examine_activities_main.do":
            unsafeWindow.require(["highShsjApi"], function(api) {
                auditor.audit = function(data, auditState) {
                    var _params = {
                        "id": data.id,
                        "stuId": data.stuId,
                        "auditDesc": data.auditDesc,
                        "auditState": auditState,
                        "termId": unsafeWindow.parentData.termId
                    };

                    api.r_auditMidschShsjAct(_params).then(function (data, message) {
                        console.log(data + " " + message);
                        auditor.next();
                    })
                }
                auditor.loadMenus();
            });
            break;

        case "/eedu_pro_fj/r_to_highLabour_examine_practicePro_main.do":
            unsafeWindow.require(["highLabourApi"], function(api) {
                auditor.audit = function(data, auditState) {
                    var _params = {
                        "id": data.id,
                        "type": 2,
                        "auditState": auditState,
                        "termId": unsafeWindow.parentData.termId
                    };

                    api.auditHischLabor(_params).then(function (data, message) {
                        console.log(data + " " + message);
                        auditor.next();
                    })
                }
                auditor.loadMenus();
            });
            break;

        case "/eedu_pro_fj/r_to_highClassicCase_examine_main.do":
            unsafeWindow.require(["highClassicCaseApi"], function(api) {
                auditor.audit = function(data, auditState) {
                    var _params = {
                        "id": data.id,
                        "auditDesc": data.auditDesc,
                        "auditState": auditState,
                        "termId": unsafeWindow.params.termId
                    };

                    api.auditMidschClasscase(_params).then(function (data, message) {
                        console.log(data + " " + message);
                        auditor.next();
                    })
                }
                auditor.loadMenus();
            });
            break;
    }

 })();
