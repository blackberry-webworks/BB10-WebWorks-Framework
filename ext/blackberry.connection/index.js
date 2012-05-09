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
var connection;

module.exports = {
    type: function (success, fail, args) {
        try {
            success(connection.getType());
        } catch (e) {
            fail(-1, e);
        }
    }
};

///////////////////////////////////////////////////////////////////
// JavaScript wrapper for JNEXT plugin
///////////////////////////////////////////////////////////////////

JNEXT.Connection = function () {
    var self = this;

    self.getType = function () {
        var val = JNEXT.invoke(self.m_id, "getType");
        return JSON.parse(val);
    };

    self.getId = function () {
        return self.m_id;
    };

    self.init = function () {
        if (!JNEXT.require("netstatus")) {
            return false;
        }

        self.m_id = JNEXT.createObject("netstatus.Connection");

        if (self.m_id === "") {
            return false;
        }
    };

    self.m_id = "";

    self.init();
};

connection = new JNEXT.Connection();
