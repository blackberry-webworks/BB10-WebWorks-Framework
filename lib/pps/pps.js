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

/*jshint es5:true */

var pps,
    globalId = 0,
    _ppsConnections = {};

function generateId() {
    var id = globalId++;
    if (!window.isFinite(id)) {
        globalId = 0;
        id = 0;
    }
    return id;
}

pps = {
    // Constants for use with the open() function
    /** Used with the open() function as a mode parameter. This opens the file in
     * read-only mode. */
    RDONLY: 0,
    /** Used with the open() function as a mode parameter. This opens the file in
     * write-only mode. Opening in write-only has less overhead than any other mode
     * and should be used whenever possible. */
    WRONLY: 1,
    /** Used with the open() function as a mode parameter. This opens the file in
     * read-write mode. */
    RDWR: 2,
    /** Used with the open() function as a mode parameter. This flag specifies that
     * the PPS object should be created if it does not exist. This flag can be or-ed
     * with the RDONLY, WRONLY or RDWR constants in the following manner:
     *
     * open("/pps/someppsobject",  CREATE|WRONLY),
     *
     * NOTE: O_CREAT flag is actually 0x100 (256 decimal), not '400' as is implied
     * by trunk/lib/c/public/fcntl.h.
     */
    CREATE: 256,
    /** Used with the open() function as a mode parameter. This flag specifies that
     * the PPS object should be created and opened in read-write mode. It is a
     * convenience constant equivalent to:
     *
     * open("/pps/someppsobject",  CREATE|RDWR),
     */
    RDWR_CREATE: 258,

    create: function (ppsPath) {
        var _id = generateId(),
            _path = ppsPath,
            _active;

        function isActive() {
            return _active;
        }

        function activate() {
            _active = true;
        }

        function deactivate() {
            _active = false;
            delete _ppsConnections[_id];
        }

        function open(mode, options) {
            _ppsConnections[_id] = this;
            return qnx.callExtensionMethod('pps.open', _id, _path, mode, options);
        }

        function write(data) {
            return qnx.callExtensionMethod('pps.write', _id, JSON.stringify(data));
        }

        function close() {
            // FIXME: handle close() between open() and onOpened()
            return qnx.callExtensionMethod('pps.close', _id);
        }

        return {
            open: open,
            write: write,
            close: close,
            isActive: isActive,
            onFirstReadComplete: function (data) {
                console.log('PPS connection - first read complete: ' + data);
            },
            onNewData: function (data) {
                console.log('PPS connection - new data: ' + data);
            },
            onOpened: activate,
            onClosed: deactivate,
            onOpenFailed: deactivate,
            path: _path
        };
    },

    onEvent: function (id, type, data) {
        if (!id || !type || !_ppsConnections.hasOwnProperty(id)) {
            return;
        }

        var ppsConnection = _ppsConnections[id],
            eventHandlerName = 'on' + type;
        if (ppsConnection.hasOwnProperty(eventHandlerName)) {
            ppsConnection[eventHandlerName](data);
        }
    }
};

module.exports = pps;
