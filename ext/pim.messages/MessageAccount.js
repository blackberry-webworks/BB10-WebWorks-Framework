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
var MessageAccount,
    EnterpriseType,
    MessageFolder = require("./MessageFolder");

MessageAccount = function (args) {
    args = args || {};
    Object.defineProperty(this, "id", { "value": "" + args.id });
    this.name = args.name;
    // enterpriseType and social currently are not handled
    //this.enterpriseType = args.enterpriseType;
    //this.social = args.social;
    this.folders = MessageFolder.getArrayOfObjectsFromArrayOfJSONs(args.folders);
};

MessageAccount.prototype.getJSON = function () {
    return {
        'id': this.id,
        'name': this.name,
        // enterpriseType and social currently are not handled
        //'enterpriseType': this.enterpriseType,
        //'social': this.social,
        'folders': MessageFolder.getArrayOfJSONsFromArrayOfObjects(this.folders)
    };
};

/* EnterpriseType currently is not handled
EnterpriseType = function () {
};

Object.defineProperty(EnterpriseType, "EnterpriseUnknown", {"value": -1});
Object.defineProperty(EnterpriseType, "NonEnterprise", {"value": 0});
Object.defineProperty(EnterpriseType, "Enterprise", {"value": 0});

MessageAccount.EnterpriseType = EnterpriseType;
*/
module.exports = MessageAccount;