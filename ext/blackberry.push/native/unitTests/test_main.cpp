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

#include <gtest/gtest.h>
#include <gmock/gmock.h>
#include <json/reader.h>
#include <json/writer.h>
#include <semaphore.h>
#include <string>
#include <map>
#include "../push_js.hpp"

// Mock Object
class MockPush : public Push {
public:
    MockPush() : Push("") {
        sem_init(&m_waitSemaphore, 0, 0);
    }

    virtual ~MockPush() {
        sem_destroy(&m_waitSemaphore);
    }

    MOCK_METHOD1(onCreateSessionComplete, void(const PushStatus&));
    MOCK_METHOD2(onCreateChannelComplete, void(const PushStatus&, const std::string&));
    MOCK_METHOD1(onDestroyChannelComplete, void(const PushStatus&));
    MOCK_METHOD1(onRegisterToLaunchComplete, void(const PushStatus&));
    MOCK_METHOD1(onUnregisterFromLaunchComplete, void(const PushStatus&));

    void startServiceConcrete() {
        Json::FastWriter writer;
        Json::Value options;
        options["invokeTargetId"] = Json::Value("net.rim.blackberry.pushtest.target1");
        options["appId"] = Json::Value("1-RDce63it6363");
        options["ppgUrl"] = Json::Value("http://pushapi.eval.blackberry.com");

        std::string command = "startService ";
        command.append(writer.write(options));
        InvokeMethod(command);
    }

    void createChannelConcrete() {
        InvokeMethod("createChannel");
    }

    void destroyChannelConcrete() {
        InvokeMethod("destroyChannel");
    }

    std::string extractPushPayloadConcrete(const std::string& invokeData) {
        std::string command = "extractPushPayload ";
        command.append(invokeData);
        return InvokeMethod(command);
    }

    void registerToLaunchConcrete() {
        InvokeMethod("registerToLaunch");
    }

    void unregisterFromLaunchConcrete() {
        InvokeMethod("unregisterFromLaunch");
    }

    void waitForCallback() {
        sem_wait(&m_waitSemaphore);
    }

    void doneCallback() {
        sem_post(&m_waitSemaphore);
    }

private:
    sem_t m_waitSemaphore;
};


// Unit tests

TEST(PushService, CanStartService) {
    MockPush *mock_push = new MockPush;

    EXPECT_CALL(*mock_push, onCreateSessionComplete(::testing::Property(&PushStatus::getCode, bb::communications::push::PUSH_NO_ERR)))
        .Times(1)
        .WillOnce(::testing::InvokeWithoutArgs(mock_push, &MockPush::doneCallback));

    mock_push->startServiceConcrete();
    mock_push->waitForCallback();

    delete mock_push;
}

TEST(PushService, CanCreateChannel) {
    MockPush *mock_push = new MockPush;

    EXPECT_CALL(*mock_push, onCreateSessionComplete(::testing::Property(&PushStatus::getCode, bb::communications::push::PUSH_NO_ERR)))
        .Times(1)
        .WillOnce(::testing::InvokeWithoutArgs(mock_push, &MockPush::createChannelConcrete));

    EXPECT_CALL(*mock_push, onCreateChannelComplete(::testing::Property(&PushStatus::getCode, bb::communications::push::PUSH_NO_ERR), ::testing::_))
        .Times(1)
        .WillOnce(::testing::InvokeWithoutArgs(mock_push, &MockPush::doneCallback));

    mock_push->startServiceConcrete();
    mock_push->waitForCallback();

    delete mock_push;
}

TEST(PushService, CanRegisterToLaunch) {
    MockPush *mock_push = new MockPush;

    EXPECT_CALL(*mock_push, onCreateSessionComplete(::testing::Property(&PushStatus::getCode, bb::communications::push::PUSH_NO_ERR)))
        .Times(1)
        .WillOnce(::testing::InvokeWithoutArgs(mock_push, &MockPush::registerToLaunchConcrete));

    EXPECT_CALL(*mock_push, onRegisterToLaunchComplete(::testing::Property(&PushStatus::getCode, bb::communications::push::PUSH_NO_ERR)))
        .Times(1)
        .WillOnce(::testing::InvokeWithoutArgs(mock_push, &MockPush::doneCallback));

    mock_push->startServiceConcrete();
    mock_push->waitForCallback();

    delete mock_push;
}

TEST(PushService, CanUnregisterFromLaunch) {
    MockPush *mock_push = new MockPush;

    EXPECT_CALL(*mock_push, onCreateSessionComplete(::testing::Property(&PushStatus::getCode, bb::communications::push::PUSH_NO_ERR)))
        .Times(1)
        .WillOnce(::testing::InvokeWithoutArgs(mock_push, &MockPush::unregisterFromLaunchConcrete));

    EXPECT_CALL(*mock_push, onUnregisterFromLaunchComplete(::testing::Property(&PushStatus::getCode, bb::communications::push::PUSH_NO_ERR)))
        .Times(1)
        .WillOnce(::testing::InvokeWithoutArgs(mock_push, &MockPush::doneCallback));

    mock_push->startServiceConcrete();
    mock_push->waitForCallback();

    delete mock_push;
}

TEST(PushService, CanDestroyChannel) {
    MockPush *mock_push = new MockPush;

    EXPECT_CALL(*mock_push, onCreateSessionComplete(::testing::Property(&PushStatus::getCode, bb::communications::push::PUSH_NO_ERR)))
        .Times(1)
        .WillOnce(::testing::InvokeWithoutArgs(mock_push, &MockPush::createChannelConcrete));

    EXPECT_CALL(*mock_push, onCreateChannelComplete(::testing::Property(&PushStatus::getCode, bb::communications::push::PUSH_NO_ERR), ::testing::_))
        .Times(1)
        .WillOnce(::testing::InvokeWithoutArgs(mock_push, &MockPush::destroyChannelConcrete));

    EXPECT_CALL(*mock_push, onDestroyChannelComplete(::testing::Property(&PushStatus::getCode, bb::communications::push::PUSH_NO_ERR)))
        .Times(1)
        .WillOnce(::testing::InvokeWithoutArgs(mock_push, &MockPush::doneCallback));

    mock_push->startServiceConcrete();
    mock_push->waitForCallback();

    delete mock_push;
}

TEST(PushService, CanExtractPushPayload) {
    MockPush *mock_push = new MockPush;

    Json::FastWriter writer;
    Json::Value invoke_data;

    invoke_data["data"] = Json::Value("cHVzaERhdGE6anNvbjp7InB1c2hJZCI6IkNlM3JjMHlDTVRxLTYzNDc1ODg1NzQzMzA2LjQiLCJwdXNoRGF0YUxlbiI6MTEsImFwcExldmVsQWNrIjowLCJodHRwSGVhZGVycyI6eyJDb250ZW50LVR5cGUiOiJ0ZXh0L3BsYWluOyBjaGFyc2V0PVVURi04IiwiQ29ubmVjdGlvbiI6ImNsb3NlIiwiUHVzaC1NZXNzYWdlLUlEIjoiQ2UzcmMweUNNVHEtNjM0NzU4ODU3NDMzMDYuNCIsIlgtUklNLVBVU0gtU0VSVklDRS1JRCI6IjEtUkRjZTYzaXQ2MzYzIiwieC1yaW0tZGV2aWNlaWQiOiIyOWRkZTQ1NyIsIkNvbnRlbnQtTGVuZ3RoIjoiMTEifX0KAEhlbGxvIHdvcmxk");

    std::string payload_data = mock_push->extractPushPayloadConcrete(writer.write(invoke_data));

    Json::Reader reader;
    Json::Value payload_obj;
    bool parse = reader.parse(payload_data, payload_obj);
    ASSERT_TRUE(parse);

    // Check valid
    EXPECT_TRUE(payload_obj["valid"].asBool());

    // Check payload id
    std::string expected_id = "Ce3rc0yCMTq-63475885743306.4";
    EXPECT_EQ(expected_id, payload_obj["id"].asString());

    // Check isAcknowledgeRequired
    bool expected_isAcknowledgeRequired = false;
    EXPECT_EQ(expected_isAcknowledgeRequired, payload_obj["isAcknowledgeRequired"].asBool());

    // Check payload data (byte array)
    ASSERT_EQ(11, payload_obj["data"].size());
    Json::UInt expected_data[11] = {72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100};

    for (int i = 0; i < 11; i++) {
        EXPECT_EQ(expected_data[i], payload_obj["data"][i].asUInt());
    }

    // Check headers
    EXPECT_EQ(6, payload_obj["headers"].size());

    std::map<std::string, std::string> expected_headers;
    expected_headers["Content-Type"] = "text/plain; charset=UTF-8";
    expected_headers["Connection"] = "close";
    expected_headers["Push-Message-ID"] = "Ce3rc0yCMTq-63475885743306.4";
    expected_headers["X-RIM-PUSH-SERVICE-ID"] = "1-RDce63it6363";
    expected_headers["x-rim-deviceid"] = "29dde457";
    expected_headers["Content-Length"] = "11";

    std::map<std::string, std::string>::const_iterator headers_iter;

    for (headers_iter = expected_headers.begin(); headers_iter != expected_headers.end(); headers_iter++) {
        EXPECT_EQ(headers_iter->second, payload_obj["headers"][headers_iter->first].asString());
    }

    delete mock_push;
}

TEST(PushService, ChecksForInvalidPushPayload) {
    MockPush *mock_push = new MockPush;

    Json::FastWriter writer;
    Json::Value invoke_data;

    invoke_data["data"] = Json::Value("ABC");

    std::string payload_data = mock_push->extractPushPayloadConcrete(writer.write(invoke_data));

    Json::Reader reader;
    Json::Value payload_obj;
    bool parse = reader.parse(payload_data, payload_obj);
    ASSERT_TRUE(parse);

    EXPECT_FALSE(payload_obj["valid"].asBool());
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}

