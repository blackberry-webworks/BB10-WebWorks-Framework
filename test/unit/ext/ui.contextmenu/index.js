/*
 * Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _extDir = __dirname + "./../../../../ext/",
    _libDir = __dirname + "./../../../../lib/",
    contextmenu,
    overlayWebView = require(_libDir + "overlayWebView"),
    success = jasmine.createSpy(),
    fail = jasmine.createSpy(),
    mockedQnx = {
        webplatform: {
            getController: function () {
                return {
                    addEventListener: function (eventType, callback) {
                        callback();
                    }
                };
            },
            createUIWebView: function () {
                return {
                    contextMenu: {
                        enabled: jasmine.createSpy(),
                        addItem: jasmine.createSpy(),
                        removeItem: jasmine.createSpy()
                    }
                };
            }
        }
    };

describe("blackberry.ui.contextmenu index", function () {

    beforeEach(function () {
        GLOBAL.qnx = mockedQnx;
        GLOBAL.window = {qnx: mockedQnx};
        contextmenu = require(_extDir + "ui.contextmenu");
        overlayWebView.create();
    });

    afterEach(function () {
        success.reset();
        fail.reset();
    });

    it("can set the enabled property to false properly", function () {
        var args = {
                enabled: false
            },
            env = {};

        contextmenu.enabled(success, fail, args, env);
        expect(overlayWebView.contextMenu.enabled).toEqual(false);
    });

    it("can set and read the enabled property to true", function () {
        var args = {
                enabled: true
            },
            env = {};

        contextmenu.enabled(success, fail, args, env);
        expect(overlayWebView.contextMenu.enabled).toEqual(true);
    });

    it("Will not set the property when incorrect parameters are passed", function () {
        var args = {
                enabled: true
            },
            env = {};

        contextmenu.enabled(success, fail, args, env);
        expect(overlayWebView.contextMenu.enabled).toEqual(true);
        args = {
            enabled: "false"
        };
        env = {};
        expect(overlayWebView.contextMenu.enabled).toEqual(true);
    });
    it("can add a custom menu item", function () {
        var args = {
                contexts: encodeURIComponent(JSON.stringify(['ALL'])),
                action: encodeURIComponent(JSON.stringify({actionId: 'explosion'})),
            },
            env = {},
            expectedArgs = {
                contexts: ['ALL'],
                action: {actionId: 'explosion'},
                handler: jasmine.any(Function)
            };

        contextmenu.addItem(success, fail, args, env);
        expect(overlayWebView.contextMenu.addItem).toHaveBeenCalledWith(success, fail, expectedArgs, env);
    });

    it("can remove a custom menu item", function () {
        var id = 42,
            args = {
                contexts: encodeURIComponent(JSON.stringify(['ALL'])),
                actionId: encodeURIComponent(JSON.stringify(id)),
            },
            env = {},
            expectedArgs = {
                contexts: ['ALL'],
                actionId: id
            };

        contextmenu.removeItem(success, fail, args, env);
        expect(overlayWebView.contextMenu.removeItem).toHaveBeenCalledWith(success, fail, expectedArgs, env);
    });

});
