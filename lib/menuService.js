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

var self,
    pps = qnx.webplatform.pps,
    menuControl,
    callbacks = {},
    globalId = 0;

function generateId() {
    var id = globalId++;
    if (!window.isFinite(id)) {
        globalId = 0;
        id = 0;
    }
    return id.toString();
}

function onNewData(data) {
    var response = data.control,
        id,
        callback;
    if (response.res === 'getMenuItems') {
        id = response.id;
        callback = callbacks[id];
        delete callbacks[id];
        if (callback) {
            callback(response.dat, response.err);
        }
    }
}

function onFirstReadComplete(data) {
    console.log("onFirstReadComplete: " + data);
}

self = {

    MENU_INVALID_REQUEST_ERROR: 'MENU_INVALID_REQUEST_ERROR',

    // Request example
    // {
    //   action: <action>,
    //   mime: <mime-type>,
    //   uri: <URI>,
    //   data: <base64 encoded data>,
    //   target_type_mask: <one of invocation target types>,
    //   perimeter: <perimeter name>
    // }
    //
    // Response example
    //
    // {
    //   title: <title to describe the items>,
    //   title-sub: <secondary title>,
    //   title-icon1: <URI of the primary icon>,
    //   title-icon2: <URI of the secondary icon>,
    //   items:
    //   [
    //     {
    //       icon: <URI of menu item icon>,
    //       label: <localized menu item label>,
    //       label-sub1: <optional secondary label>,
    //       label-sub2: <optional tertiary label>,
    //       invoke:
    //       {
    //         type: <one of invocation target types>,
    //         target: <invocation target>,
    //         action: <action>,
    //         mime: <mime-type>,
    //         uri: <URI>,
    //         data: <base64 encoded data>
    //         perimeter: <perimeter name>
    //       },
    //       children:
    //       {
    //         // recursive structure...
    //       }
    //     }
    //     ...
    //   ]
    // }
    //
    //
    // Usage example:
    //
    // var menuService = require('lib/menuService');
    // var request = {
    //     action: 'bb.action.VIEW',
    //     uri: 'tel:14161234567',
    //     target_type: invocation.TARGET_TYPE_CARD
    // };
    // menuService.getMenuItems(request, function (response, error) {
    //     ... Add them to the menu?
    // });
    //
    getMenuItems: function (request, callback) {
        // Initialize on demand.
        if (!menuControl) {
            menuControl = pps.create('/pps/services/menu/control', pps.PPSMode.FULL);
            menuControl.onNewData = onNewData;
            menuControl.onFirstReadComplete = onFirstReadComplete;
            menuControl.onOpenFailed = function () {
                console.log("menu.service: Open Failed");
            };
            menuControl.onWriteFailed = function () {
                console.log("menu.service: Write Failed");
            };
            menuControl.open(pps.FileMode.RDWR);
        }
        var id = generateId();
        if (callback) {
            callbacks[id] = callback;
        }
        menuControl.write({msg: 'getMenuItems', id: id, dat: request});
    },
};

module.exports = self;

