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
var _ID = "blackberry.push",
    _extDir = __dirname + "./../../../../ext",
    _apiDir = _extDir + "/" + _ID,
    client,
    mockedWebworks = {},
    constants = {
        "SUCCESS" : 0,
        "INTERNAL_ERROR" : 500,
        "INVALID_DEVICE_PIN" : 10001,
        "INVALID_PROVIDER_APPLICATION_ID" : 10002,
        "CHANNEL_ALREADY_DESTROYED" : 10004,
        "CHANNEL_ALREADY_DESTROYED_BY_PROVIDER" : 10005,
        "INVALID_PPG_SUBSCRIBER_STATE" : 10006,
        "DEVICE_PIN_NOT_FOUND" : 10007,
        "EXPIRED_AUTHENTICATION_TOKEN_PROVIDED_TO_PPG" : 10008,
        "INVALID_AUTHENTICATION_TOKEN_PROVIDED_TO_PPG" : 10009,
        "TOO_MANY_DEVICES_WITH_ACTIVE_CREATE_CHANNELS" : 10010,
        "INVALID_OS_VERSION_OR_DEVICE_MODEL_NUMBER" : 10011,
        "CHANNEL_SUSPENDED_BY_PROVIDER" : 10012,
        "CREATE_SESSION_NOT_DONE" : 10100,
        "MISSING_PPG_URL" : 10102,
        "NETWORK_FAILURE" : 10103,
        "OPERATION_NOT_SUPPORTED" : 10105,
        "CREATE_CHANNEL_NOT_DONE" : 10106,
        "MISSING_PORT_FROM_PPG" : 10107,
        "MISSING_SUBSCRIPTION_RETURN_CODE_FROM_PPG" : 10108,
        "PPG_CURRENTLY_NOT_AVAILABLE" : 10110,
        "MISSING_INVOKE_TARGET_ID" : 10111
    },
    constantsLength = 0,
    defineROFieldArgs = [];

beforeEach(function () {
    GLOBAL.window = GLOBAL;
});

afterEach(function () {
    delete GLOBAL.window;
});

function unloadClient() {
    // explicitly unload client for it to be loaded again
    delete require.cache[require.resolve(_apiDir + "/client")];
    client = null;
}

describe("blackberry.connection", function () {
    beforeEach(function () {
        mockedWebworks.execSync = jasmine.createSpy().andReturn(2);
        mockedWebworks.event = { once : jasmine.createSpy().andReturn(3),
                                 isOn : jasmine.createSpy().andReturn(4) };
        mockedWebworks.defineReadOnlyField = jasmine.createSpy();
        GLOBAL.window.webworks = mockedWebworks;
        // client needs to be required for each test
        client = require(_apiDir + "/client");
        Object.getOwnPropertyNames(constants).forEach(function (c) {
            defineROFieldArgs.push([client.PushService, c, constants[c]]);
            constantsLength += 1;
        });
        spyOn(console, "error");
    });

    afterEach(function () {
        unloadClient();
        defineROFieldArgs = [];
    });

    describe("blackberry.push constants", function () {
        it("call defineReadOnlyField for each constant", function () {
            expect(mockedWebworks.defineReadOnlyField.callCount).toEqual(constantsLength);
        });

        it("call defineReadOnlyField with right params", function () {
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("SUCCESS")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("INTERNAL_ERROR")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("INVALID_DEVICE_PIN")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("INVALID_PROVIDER_APPLICATION_ID")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("CHANNEL_ALREADY_DESTROYED")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("CHANNEL_ALREADY_DESTROYED_BY_PROVIDER")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("INVALID_PPG_SUBSCRIBER_STATE")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("DEVICE_PIN_NOT_FOUND")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("EXPIRED_AUTHENTICATION_TOKEN_PROVIDED_TO_PPG")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("INVALID_AUTHENTICATION_TOKEN_PROVIDED_TO_PPG")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("TOO_MANY_DEVICES_WITH_ACTIVE_CREATE_CHANNELS")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("INVALID_OS_VERSION_OR_DEVICE_MODEL_NUMBER")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("CHANNEL_SUSPENDED_BY_PROVIDER")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("CREATE_SESSION_NOT_DONE")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("MISSING_PPG_URL")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("NETWORK_FAILURE")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("OPERATION_NOT_SUPPORTED")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("CREATE_CHANNEL_NOT_DONE")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("MISSING_PORT_FROM_PPG")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("MISSING_SUBSCRIPTION_RETURN_CODE_FROM_PPG")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("PPG_CURRENTLY_NOT_AVAILABLE")]);
            expect(mockedWebworks.defineReadOnlyField.argsForCall).toContain(defineROFieldArgs[Object.getOwnPropertyNames(constants).indexOf("MISSING_INVOKE_TARGET_ID")]);
        });
    });


    describe("blackberry.push.PushService methods", function () {
        it("blackberry.push.PushService.create", function () {
            var options = { "invokeTargetId" : "invokeTargetId",
                 "appId" : "appId",
                 "ppgUrl" : "ppgUrl" },
                 successCallback,
                 failCallback,
                 simChangeCallback;

            expect(client.PushService.create(options, successCallback, failCallback, simChangeCallback)).toEqual(2);
            expect(mockedWebworks.event.once).toHaveBeenCalledWith(_ID, "blackberry.push.create.successCallback", successCallback);
            expect(mockedWebworks.event.once).toHaveBeenCalledWith(_ID, "blackberry.push.create.failCallback", failCallback);
            expect(mockedWebworks.event.once).toHaveBeenCalledWith(_ID, "blackberry.push.create.simChangeCallback", simChangeCallback);
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "startService", options);
        });

        it("blackberry.push.PushService.createChannel", function () {
            var createChannelCallback;

            expect(client.PushService.createChannel(createChannelCallback)).toEqual(2);
            expect(mockedWebworks.event.once).toHaveBeenCalledWith(_ID, "blackberry.push.createChannel.callback", createChannelCallback);
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "createChannel", null);
        });

        it("blackberry.push.PushService.destroyChannel", function () {
            var destroyChannelCallback;

            expect(client.PushService.destroyChannel(destroyChannelCallback)).toEqual(2);
            expect(mockedWebworks.event.once).toHaveBeenCalledWith(_ID, "blackberry.push.destroyChannel.callback", destroyChannelCallback);
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "destroyChannel", null);
        });

        it("blackberry.push.PushService.extractPushPayload", function () {
            var invokeObject = {},
                pushPayload = client.PushService.extractPushPayload(invokeObject);

            expect(pushPayload).toBeDefined();
            expect(pushPayload).toEqual(jasmine.any(client.PushPayload));
            expect(pushPayload.payload).toEqual(2);
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "extractPushPayload", invokeObject);
        });

        it("blackberry.push.PushService.launchApplicationOnPush", function () {
            var shouldLaunch = true,
                launchApplicationCallback;

            expect(client.PushService.launchApplicationOnPush(shouldLaunch, launchApplicationCallback)).toEqual(2);
            expect(mockedWebworks.event.once).toHaveBeenCalledWith(_ID, "blackberry.push.launchApplicationOnPush.callback", launchApplicationCallback);
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "launchApplicationOnPush", shouldLaunch);
        });
    });

    describe("blackberry.push.PushPayload", function () {
        it("blackberry.push.PushPayload constructor", function () {
            var pushPayload = new client.PushPayload("hello");

            expect(pushPayload).toBeDefined();
            expect(pushPayload).toEqual(jasmine.any(client.PushPayload));
            expect(pushPayload.payload).toEqual("hello");
        });

        it("blackberry.push.PushPayload.acknowledge", function () {
            var shouldAcceptPush = true,
                pushPayload = new client.PushPayload("hello"),
                args = {"id": "id", "shouldAcceptPush": shouldAcceptPush };

            pushPayload.id = "id";
            expect(pushPayload.acknowledge(shouldAcceptPush)).toEqual(2);
            expect(mockedWebworks.execSync).toHaveBeenCalledWith(_ID, "acknowledge", args);
        });
    });
});
