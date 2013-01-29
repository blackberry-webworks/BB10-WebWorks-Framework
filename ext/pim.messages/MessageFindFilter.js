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
var MessageFindFilter;

MessageFindFilter = function (args) {
    args = args || {};
    this.subject = args.subject || "";
    this.body = args.body || "";
    this.fromAddress = args.fromAddress || "";
    this.recipient = args.recipient || "";
    this.read = typeof args.read === 'boolean' ? args.read :  null;
    this.flagged = typeof args.flagged === 'boolean' ? args.flagged : null;
    this.today = typeof args.today === 'boolean' ? args.today : null;
    this.yesterday = typeof args.yesterday === 'boolean' ? args.yesterday : null;
    this.lastWeek = typeof args.lastWeek === 'boolean' ? args.lastWeek : null;
};

MessageFindFilter.prototype.getJSON = function () {
    var prop,
        result = {};
    
    for (prop in this) {
        if (this.hasOwnProperty(prop)) {
            result[prop] = this[prop];
        } 
    }

    return result;
};

module.exports = MessageFindFilter;