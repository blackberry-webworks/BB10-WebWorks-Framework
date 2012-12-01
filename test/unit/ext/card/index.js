/*
 * Copyright 2011-2012 Research In Motion Limited.
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

var _apiDir = __dirname + "./../../../../ext/card/",
    _libDir = __dirname + "./../../../../lib/",
    _extDir = __dirname + "./../../../../ext/",
    mockedController,
    mockedWebview,
    mockedMediaPlayer,
    mockedCamera,
    mockedFile,
    mockedIcs,
    index,
    successCB,
    failCB;

describe("invoke.card index", function () {

    beforeEach(function () {
        mockedWebview = {
            invocationlist: {
                show : jasmine.createSpy()
            }
        };
        mockedController = {
            addEventListener: jasmine.createSpy().andCallFake(function (evt, callback) {
                callback(mockedWebview);
            })
        };
        mockedMediaPlayer = {
            open: jasmine.createSpy("mediaplayerPreviewer.open")
        };
        mockedCamera = {
            open: jasmine.createSpy("camera.open")
        };
        mockedFile = {
            open: jasmine.createSpy("file.open")
        };
        mockedIcs = {
            open: jasmine.createSpy("ics.open")
        };
        GLOBAL.window = {
            qnx: {
                callExtensionMethod : function () {},
                webplatform: {
                    getApplication: function () {
                        return {
                            invocation : {
                                TARGET_TYPE_MASK_APPLICATION : 1,
                                TARGET_TYPE_MASK_CARD : 2,
                                TARGET_TYPE_MASK_VIEWER : 4
                            },
                            cards: {
                                mediaplayerPreviewer: mockedMediaPlayer,
                                camera: mockedCamera,
                                filePicker: mockedFile,
                                icsViewer: mockedIcs
                            }
                        };
                    },
                    getController: function () {
                        return mockedController;
                    },
                }
            }
        };

        GLOBAL.qnx = GLOBAL.window.qnx;
        index = require(_apiDir + "index");
        successCB = jasmine.createSpy("success callback");
        failCB = jasmine.createSpy("fail callback");
    });

    afterEach(function () {
        mockedMediaPlayer = null;
        mockedCamera = null;
        delete GLOBAL.window;
        delete GLOBAL.qnx;
        mockedFile = null;
        index = null;
        delete require.cache[require.resolve(_apiDir + "index")];
        successCB = null;
        failCB = null;
    });

    describe("invoke camera", function () {
        it("can invoke camera with mode", function () {
            var successCB = jasmine.createSpy(),
                mockedArgs = {
                    "mode": encodeURIComponent(JSON.stringify({mode: "photo"}))
                };

            index.invokeCamera(successCB, null, mockedArgs);
            expect(mockedCamera.open).toHaveBeenCalledWith({
                mode: "photo"
            }, jasmine.any(Function), jasmine.any(Function), jasmine.any(Function));
            expect(successCB).toHaveBeenCalled();
        });
    });

    describe("invoke file picker", function () {
        it("can invoke file picker with options", function () {
            var successCB = jasmine.createSpy(),
                mockedArgs = {
                    "options": encodeURIComponent(JSON.stringify({mode: "Picker"}))
                };

            index.invokeFilePicker(successCB, null, mockedArgs);
            expect(mockedFile.open).toHaveBeenCalledWith({
                    mode: "Picker"
                }, jasmine.any(Function), jasmine.any(Function), jasmine.any(Function));
            expect(successCB).toHaveBeenCalled();
        });
    });

    describe("invoke mediaplayer", function () {
        it("can invoke mediaplayer previewer with options", function () {
            var contentTitle = "Test Title",
                contentUri = "file:///accounts/1000/shared/camera/VID_00000001.mp4",
                imageUri = "",
                mockedArgs = {
                    contentTitle: contentTitle,
                    contentUri: contentUri,
                    imageUri: imageUri
                };

            index.invokeMediaPlayer(successCB, null, {options: encodeURIComponent(JSON.stringify(mockedArgs))});

            expect(mockedMediaPlayer.open).toHaveBeenCalledWith({
                    contentTitle: decodeURIComponent(contentTitle),
                    contentUri: decodeURIComponent(contentUri),
                    imageUri: decodeURIComponent(imageUri)
                }, jasmine.any(Function), jasmine.any(Function), jasmine.any(Function));
            expect(successCB).toHaveBeenCalled();
        });
    });

    describe("invoke ICS viewer", function () {
        it("can invoke ICS viewer with options", function () {
            var successCB = jasmine.createSpy(),
                mockedArgs = {
                    options: encodeURIComponent(JSON.stringify({options: {uri: "file://path/to/file.ics"}}))
                };
            index.invokeIcsViewer(successCB, null, mockedArgs);
            expect(mockedIcs.open).toHaveBeenCalledWith({
                options: { uri : "file://path/to/file.ics" }
            }, jasmine.any(Function), jasmine.any(Function), jasmine.any(Function));
            expect(successCB).toHaveBeenCalled();
        });
    });

    describe("invoke targetPicker", function () {

        it("expects invokeTargetPicker to be defined", function () {
            expect(index.invokeTargetPicker).toBeDefined();
        });

        it("can invoke the target picker ", function () {
            var mockedArgs = {
                    title : encodeURIComponent(JSON.stringify('A test title')),
                    request : encodeURIComponent(JSON.stringify({
                        uri : 'file:///a test uri.jpg',
                        target_type : ['CARD', 'APPLICATION', 'VIEWER']
                    }))
                },
            request;

            index.invokeTargetPicker(successCB, null, mockedArgs);
            request = JSON.parse(decodeURIComponent(mockedArgs.request));
            request.target_type_mask = 7;
            delete request.target_type;

            expect(mockedWebview.invocationlist.show).toHaveBeenCalledWith(
                request,
                JSON.parse(decodeURIComponent(mockedArgs.title)),
                jasmine.any(Function),
                jasmine.any(Function)
            );
            expect(successCB).toHaveBeenCalled();
        });

        it("can invoke the target picker with meta data", function () {
            var mockedArgs = {
                    title : encodeURIComponent(JSON.stringify('A test title')),
                    request : encodeURIComponent(JSON.stringify({
                        uri : 'file:///a test uri.jpg',
                        target_type : ['CARD', 'APPLICATION', 'VIEWER'],
                        metadata : {some: 'data'}
                    }))
                },
            request;

            index.invokeTargetPicker(successCB, null, mockedArgs);
            request = JSON.parse(decodeURIComponent(mockedArgs.request));
            request.target_type_mask = 7;
            delete request.target_type;
            request.metadata = JSON.stringify(request.metadata);

            expect(mockedWebview.invocationlist.show).toHaveBeenCalledWith(
                request,
                JSON.parse(decodeURIComponent(mockedArgs.title)),
                jasmine.any(Function),
                jasmine.any(Function)
            );
            expect(successCB).toHaveBeenCalled();
        });


        it("can invoke the target picker with no target-type", function () {
            var mockedArgs = {
                    title : encodeURIComponent(JSON.stringify('A test title')),
                    request : encodeURIComponent(JSON.stringify({
                        action : 'bb.action.SHARE',
                        uri : 'file:///a test uri.jpg',
                        metadata : {some: 'data'}
                    }))
                },
            request;

            index.invokeTargetPicker(successCB, null, mockedArgs);
            request = JSON.parse(decodeURIComponent(mockedArgs.request));
            request.metadata = JSON.stringify(request.metadata);

            expect(mockedWebview.invocationlist.show).toHaveBeenCalledWith(
                request,
                JSON.parse(decodeURIComponent(mockedArgs.title)),
                jasmine.any(Function),
                jasmine.any(Function)
            );
            expect(successCB).toHaveBeenCalled();
        });

    });
});
