/*
 * Copyright (C) Research In Motion Limited 2012. All rights reserved.
 */

var self,
    pps = require('./pps/pps'),
    menuControl,
    callbacks = {},
    globalId = 0;

function generateId() {
    var id = globalId++;
    if (!isFinite(id)) {
        globalId = 0;
        id = 0;
    }
    return id;
}

function onResponse(response) {
    var id = response.id,
        callback = callbacks[id];
    delete callbacks[id];
    if (callback) {
        callback(JSON.parse(response.dat));
    }
}

self = {

    // Request example
    // {
    //   action: <action>,
    //   mime: <mime-type>,
    //   uri: <URI>,
    //   data: <base64 encoded data>,
    //   target_type: <one of invocation target types>,
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
    // var menuService = require('iris/menu.service');
    // var request = {
    //     action: 'bb.action.VIEW',
    //     uri: 'tel:14161234567',
    //     target_type: invocation.TARGET_TYPE_CARD
    // };
    // menuService.getMenuItems(request, function (response) {
    //     ... Add them to the menu?
    // });
    //
    getMenuItems: function (request, callback) {
        // Initialize on demand.
        if (!menuControl) {
            menuControl = pps.create('/pps/services/menu/control');
            menuControl.onNewData = onResponse;
            menuControl.open(pps.RDWR);
        }
        var id = generateId();
        if (callback) {
            callbacks[id] = callback;
        }
        menuControl.write({msg: 'getMenuItems', id: id, dat: request});
    },
};

module.exports = self;

