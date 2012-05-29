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

var _self = {},
    _ID = "blackberry.push",
    PushService = {},
    PushPayload,
    SUCCESS = 0,
    INTERNAL_ERROR = 500,
    INVALID_DEVICE_PIN = 10001,
    INVALID_PROVIDER_APPLICATION_ID = 10002,
    CHANNEL_ALREADY_DESTROYED = 10004,
    CHANNEL_ALREADY_DESTROYED_BY_PROVIDER = 10005,
    INVALID_PPG_SUBSCRIBER_STATE = 10006,
    DEVICE_PIN_NOT_FOUND = 10007,
    EXPIRED_AUTHENTICATION_TOKEN_PROVIDED_TO_PPG = 10008,
    INVALID_AUTHENTICATION_TOKEN_PROVIDED_TO_PPG = 10009,
    TOO_MANY_DEVICES_WITH_ACTIVE_CREATE_CHANNELS = 10010,
    INVALID_OS_VERSION_OR_DEVICE_MODEL_NUMBER = 10011,
    CHANNEL_SUSPENDED_BY_PROVIDER = 10012,
    CREATE_SESSION_NOT_DONE = 10100,
    MISSING_PPG_URL = 10102,
    NETWORK_FAILURE = 10103,
    OPERATION_NOT_SUPPORTED = 10105,
    CREATE_CHANNEL_NOT_DONE = 10106,
    MISSING_PORT_FROM_PPG = 10107,
    MISSING_SUBSCRIPTION_RETURN_CODE_FROM_PPG = 10108,
    PPG_CURRENTLY_NOT_AVAILABLE = 10110,
    MISSING_INVOKE_TARGET_ID = 10111;

/*
 * Define methods of blackberry.push.PushService
 */
PushService.create = function (options, successCallback, failCallback, simChangeCallback) {
    var args = { "invokeTargetId" : options.invokeTargetId,
                 "appId" : options.appId,
                 "ppgUrl" : options.ppgUrl };

    // Register callbacks for blackberry.push.create()
    window.webworks.event.once(_ID, "blackberry.push.create.successCallback", successCallback);
    window.webworks.event.once(_ID, "blackberry.push.create.failCallback", failCallback);
    window.webworks.event.once(_ID, "blackberry.push.create.simChangeCallback", simChangeCallback);

    // Send command to framework to start Push service
    return window.webworks.execSync(_ID, "startService", args);
};

PushService.createChannel = function (createChannelCallback) {
    // Register callbacks for blackberry.push.createChannel()
    window.webworks.event.once(_ID, "blackberry.push.createChannel.callback", createChannelCallback);

    // Send command to framework to create Push channel
    return window.webworks.execSync(_ID, "createChannel", null);
};

PushService.destroyChannel = function (destroyChannelCallback) {
    // Register callbacks for blackberry.push.destroyChannel()
    window.webworks.event.once(_ID, "blackberry.push.destroyChannel.callback", destroyChannelCallback);

    // Send command to framework to destroy Push channel
    return window.webworks.execSync(_ID, "destroyChannel", null);
};

PushService.extractPushPayload = function (invokeObject) {
    // Send command to framework to get the Push play load object
    var payload = window.webworks.execSync(_ID, "extractPushPayload", invokeObject);

    // Create blackberry.push.PushPayload object and return it
    return new PushPayload(payload);
};

PushService.launchApplicationOnPush = function (shouldLaunch, launchApplicationCallback) {
    // Register callbacks for blackberry.push.launchApplicationOnPush()
    window.webworks.event.once(_ID, "blackberry.push.launchApplicationOnPush.callback", launchApplicationCallback);

    // Send command to framework to set the launch flag
    return window.webworks.execSync(_ID, "launchApplicationOnPush", shouldLaunch);
};

/*
 * Define constants of blackberry.push.PushService
 */
window.webworks.defineReadOnlyField(PushService, "SUCCESS", SUCCESS);
window.webworks.defineReadOnlyField(PushService, "INTERNAL_ERROR", INTERNAL_ERROR);
window.webworks.defineReadOnlyField(PushService, "INVALID_DEVICE_PIN", INVALID_DEVICE_PIN);
window.webworks.defineReadOnlyField(PushService, "INVALID_PROVIDER_APPLICATION_ID", INVALID_PROVIDER_APPLICATION_ID);
window.webworks.defineReadOnlyField(PushService, "CHANNEL_ALREADY_DESTROYED", CHANNEL_ALREADY_DESTROYED);
window.webworks.defineReadOnlyField(PushService, "CHANNEL_ALREADY_DESTROYED_BY_PROVIDER", CHANNEL_ALREADY_DESTROYED_BY_PROVIDER);
window.webworks.defineReadOnlyField(PushService, "INVALID_PPG_SUBSCRIBER_STATE", INVALID_PPG_SUBSCRIBER_STATE);
window.webworks.defineReadOnlyField(PushService, "DEVICE_PIN_NOT_FOUND", DEVICE_PIN_NOT_FOUND);
window.webworks.defineReadOnlyField(PushService, "EXPIRED_AUTHENTICATION_TOKEN_PROVIDED_TO_PPG", EXPIRED_AUTHENTICATION_TOKEN_PROVIDED_TO_PPG);
window.webworks.defineReadOnlyField(PushService, "INVALID_AUTHENTICATION_TOKEN_PROVIDED_TO_PPG", INVALID_AUTHENTICATION_TOKEN_PROVIDED_TO_PPG);
window.webworks.defineReadOnlyField(PushService, "TOO_MANY_DEVICES_WITH_ACTIVE_CREATE_CHANNELS", TOO_MANY_DEVICES_WITH_ACTIVE_CREATE_CHANNELS);
window.webworks.defineReadOnlyField(PushService, "INVALID_OS_VERSION_OR_DEVICE_MODEL_NUMBER", INVALID_OS_VERSION_OR_DEVICE_MODEL_NUMBER);
window.webworks.defineReadOnlyField(PushService, "CHANNEL_SUSPENDED_BY_PROVIDER", CHANNEL_SUSPENDED_BY_PROVIDER);
window.webworks.defineReadOnlyField(PushService, "CREATE_SESSION_NOT_DONE", CREATE_SESSION_NOT_DONE);
window.webworks.defineReadOnlyField(PushService, "MISSING_PPG_URL", MISSING_PPG_URL);
window.webworks.defineReadOnlyField(PushService, "NETWORK_FAILURE", NETWORK_FAILURE);
window.webworks.defineReadOnlyField(PushService, "OPERATION_NOT_SUPPORTED", OPERATION_NOT_SUPPORTED);
window.webworks.defineReadOnlyField(PushService, "CREATE_CHANNEL_NOT_DONE", CREATE_CHANNEL_NOT_DONE);
window.webworks.defineReadOnlyField(PushService, "MISSING_PORT_FROM_PPG", MISSING_PORT_FROM_PPG);
window.webworks.defineReadOnlyField(PushService, "MISSING_SUBSCRIPTION_RETURN_CODE_FROM_PPG", MISSING_SUBSCRIPTION_RETURN_CODE_FROM_PPG);
window.webworks.defineReadOnlyField(PushService, "PPG_CURRENTLY_NOT_AVAILABLE", PPG_CURRENTLY_NOT_AVAILABLE);
window.webworks.defineReadOnlyField(PushService, "MISSING_INVOKE_TARGET_ID", MISSING_INVOKE_TARGET_ID);

/*
 * Define blackberry.push.PushPayload
 */
PushPayload = function (payload) {
    this.payload = payload;
};

PushPayload.prototype.acknowledge = function (shouldAcceptPush) {
    var args = {"id": this.id, "shouldAcceptPush" : shouldAcceptPush};

    // Send command to framework to acknowledge the Push payload
    return window.webworks.execSync(_ID, "acknowledge", args);
};

_self.PushService = PushService;
_self.PushPayload = PushPayload;

module.exports = _self;
