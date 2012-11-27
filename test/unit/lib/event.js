/*
 * Copyright 2010-2011 Research In Motion Limited.
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
var libRoot = __dirname + "/../../../lib/";

describe("lib/event", function () {
    var event = require(libRoot + "event");

    describe("trigger", function () {
        var mockedQnx,
            mockedWebview;
        beforeEach(function () {
            mockedWebview = {
                executeJavaScript: jasmine.createSpy()
            };
            mockedQnx = {
                webplatform: {
                    createWebView : jasmine.createSpy().andReturn(mockedWebview)
                }
            };
            GLOBAL.window = {
                qnx: mockedQnx
            };
        });

        afterEach(function () {
            mockedQnx = undefined;
            mockedWebview = undefined;
            delete GLOBAL.window;
        });

        it("will not invoke anything unless a webview is listening", function () {
            event.trigger("foo", {"id": 123});
            expect(mockedWebview.executeJavaScript).not.toHaveBeenCalled();
        });

        it("can invoke the webview execute javascript", function () {
            var webviewId = (new Date()).getTime();
            event.add({event: "foo", context: {addEventListener: jasmine.createSpy()}}, webviewId);
            event.trigger("foo", {"id": 123});
            expect(mockedQnx.webplatform.createWebView).toHaveBeenCalledWith({WebViewId: webviewId});
            expect(mockedWebview.executeJavaScript).toHaveBeenCalledWith("webworks.event.trigger('foo', '" + encodeURIComponent(JSON.stringify([{"id": 123}])) + "')");
            event.remove({event: "foo", context: {removeEventListener: jasmine.createSpy()}}, webviewId);
        });

        it("sends multiple arguments passed in across as a JSONified array", function () {
            var args = [{"id": 123, "foo": "hello world", list: [1, 2, 3]}, "Grrrrrrr", "Arrrrg"],
                webviewId = (new Date()).getTime();
            event.add({event: "foo", context: {addEventListener: jasmine.createSpy()}}, webviewId);
            event.trigger.apply(null, ["foo"].concat(args));
            expect(mockedQnx.webplatform.createWebView).toHaveBeenCalledWith({WebViewId: webviewId});
            expect(mockedWebview.executeJavaScript).toHaveBeenCalledWith("webworks.event.trigger('foo', '" + encodeURIComponent(JSON.stringify(args)) + "')");
            event.remove({event: "foo", context: {removeEventListener: jasmine.createSpy()}}, webviewId);
        });

        it("invokes on all webviews that have registered", function () {
            var webviewId = (new Date()).getTime();
            event.add({event: "foo", context: {addEventListener: jasmine.createSpy()}}, webviewId);
            event.add({event: "foo", context: {addEventListener: jasmine.createSpy()}}, webviewId + 1);
            event.add({event: "foo", context: {addEventListener: jasmine.createSpy()}}, webviewId + 2);
            event.trigger("foo", {"id": 123});
            expect(mockedQnx.webplatform.createWebView).toHaveBeenCalledWith({WebViewId: webviewId});
            expect(mockedQnx.webplatform.createWebView).toHaveBeenCalledWith({WebViewId: webviewId + 1});
            expect(mockedWebview.executeJavaScript).toHaveBeenCalledWith("webworks.event.trigger('foo', '" + encodeURIComponent(JSON.stringify([{"id": 123}])) + "')");
            expect(mockedWebview.executeJavaScript.callCount).toEqual(3);
            event.remove({event: "foo", context: {removeEventListener: jasmine.createSpy()}}, webviewId);
            event.remove({event: "foo", context: {removeEventListener: jasmine.createSpy()}}, webviewId + 1);
            event.remove({event: "foo", context: {removeEventListener: jasmine.createSpy()}}, webviewId + 2);
        });
    });

    describe("add/remove would invoke action context", function () {
        var action = {
                context: {
                    addEventListener: jasmine.createSpy(),
                    removeEventListener: jasmine.createSpy()
                },
                event: "HELLO",
                trigger: function () {}
            },
            webviewId = (new Date()).getTime();

        it("can invoke action context add listener", function () {
            event.add(action, webviewId);
            expect(action.context.addEventListener).toHaveBeenCalledWith(action.event, action.trigger);
        });

        it("can invoke action context remove listener", function () {
            event.remove(action, webviewId);
            expect(action.context.removeEventListener).toHaveBeenCalledWith(action.event, action.trigger);
        });
    });
});
