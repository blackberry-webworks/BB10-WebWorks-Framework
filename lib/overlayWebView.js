/*
 *  Copyright 2012 Research In Motion Limited.
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

var request = require('./request'),
    CHROME_HEIGHT = 0,
    overlayWebView,
    _overlayWebViewObj;

overlayWebView =
    {

    create: function (ready, configSettings) {

        _overlayWebViewObj = window.qnx.webplatform.createUIWebView(function () {

            _overlayWebViewObj.visible = true;
            _overlayWebViewObj.active = true;
            _overlayWebViewObj.zOrder = 1;
            _overlayWebViewObj.enableCrossSiteXHR = true;
            _overlayWebViewObj.setGeometry(0, 0, screen.width, screen.height);
            _overlayWebViewObj.addEventListener("DocumentLoadFinished", function () {
                _overlayWebViewObj.default.setDefaultFont();
                _overlayWebViewObj.visible = true;
            });

            _overlayWebViewObj.allowRpc = true;
            _overlayWebViewObj.backgroundColor = 0x00FFFFFF;
            _overlayWebViewObj.sensitivity = "SensitivityTest";
            _overlayWebViewObj.devicePixelRatio = 1;
            _overlayWebViewObj.allowQnxObject = true;

            if (ready && typeof ready === 'function') {
                ready();
            }

            window.qnx.webplatform.getController().dispatchEvent("overlayWebView.initialized", [_overlayWebViewObj]);

        });
    },

    destroy: function () {
        _overlayWebViewObj.destroy();
    },

    setURL: function (url) {
        _overlayWebViewObj.url = url;
    },

    setGeometry: function (x, y, width, height) {
        _overlayWebViewObj.setGeometry(x, y, width, height);
    },

    setSensitivity : function (sensitivity) {
        _overlayWebViewObj.sensitivity = sensitivity;
    },

    setApplicationOrientation: function (angle) {
        _overlayWebViewObj.setApplicationOrientation(angle);
    },

    notifyApplicationOrientationDone: function () {
        _overlayWebViewObj.notifyApplicationOrientationDone();
    },

    executeJavascript: function (js) {
        _overlayWebViewObj.executeJavaScript(js);
    },

    windowGroup: function () {
        return _overlayWebViewObj.windowGroup;
    },

    notifyContextMenuCancelled: function () {
        _overlayWebViewObj.notifyContextMenuCancelled();
    },

    renderContextMenuFor: function (targetWebView) {
        return _overlayWebViewObj.contextMenu.subscribeTo(targetWebView);
    },

    handleDialogFor: function (targetWebView) {
        return _overlayWebViewObj.dialog.subscribeTo(targetWebView);
    },

    showDialog: function (description, callback) {
        return _overlayWebViewObj.dialog.show(description, callback);
    }
};

overlayWebView.__defineGetter__('id', function () {
    if (_overlayWebViewObj) {
        return _overlayWebViewObj.id;
    }
});

overlayWebView.__defineGetter__('contextMenu', function () {
    if (_overlayWebViewObj) {
        return _overlayWebViewObj.contextMenu;
    }
});

module.exports = overlayWebView;
