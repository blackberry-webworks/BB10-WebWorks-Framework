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

#include <json/reader.h>
#include <json/writer.h>
#include <sys/select.h>
#include <pthread.h>
#include <stdio.h>
#include <string>
#include <sstream>
#include <map>
#include <algorithm>
#include "push_js.hpp"


Push::Push(const std::string& id) : m_id(id)
{
    m_pPushService = NULL;
    m_fileDescriptor = INVALID_PPS_FILE_DESCRIPTOR;
    m_monitorThread = 0;
    m_shutdownThread = false;
}

Push::~Push()
{
    if (m_monitorThread) {
        stopService();
    }
}

char* onGetObjList()
{
    static char name[] = "Push";
    return name;
}

JSExt* onCreateObject(const std::string& className, const std::string& id)
{
    if (className != "Push") {
        return NULL;
    }

    return new Push(id);
}

std::string Push::InvokeMethod(const std::string& command)
{
    int index = command.find_first_of(" ");
    string strCommand = command.substr(0, index);

    // Parse JSON object
    Json::Value obj;

    if (command.length() > index) {
        std::string jsonObject = command.substr(index + 1, command.length());
        Json::Reader reader;

        bool parse = reader.parse(jsonObject, obj);
        if (!parse) {
            fprintf(stderr, "%s", "error parsing\n");
            return "Cannot parse JSON object";
        }
    }

    if (strCommand == "startService") {
        m_invokeTargetId = obj["invokeTargetId"].asString();
        m_appId = obj["appId"].asString();
        m_ppgUrl = obj["ppgUrl"].asString();

        startService();
        return "";

    } else if (strCommand == "createChannel") {
        createChannel();
        return "";

    } else if (strCommand == "destroyChannel") {
        destroyChannel();
        return "";

    } else if (strCommand == "extractPushPayload") {
        // NOTE: The push data uses a NULL character to seperate the metadata and
        // the payload. If the invoke framework changes and does not use base64 anymore,
        // we should check if the NULL character will cause problems with the string
        // library functions.
        std::string data = obj["data"].asString();
        return extractPushPayload(data);

    } else if (strCommand == "registerToLaunch") {
        registerToLaunch();
        return "";

    } else if (strCommand == "unregisterFromLaunch") {
        unregisterFromLaunch();
        return "";

    } else if (strCommand == "acknowledge") {
        std::string payloadId = obj["id"].asString();
        bool shouldAccept = obj["shouldAcceptPush"].asBool();

        acknowledge(payloadId, shouldAccept);
        return "";
    }

    return "Unsupported method";
}

bool Push::CanDelete()
{
    return true;
}

// Notifies JavaScript of an event
void Push::notifyEvent(const std::string& eventId, const std::string& eventArgs)
{
    std::string eventString = m_id;
    eventString.append(" ");
    eventString.append(eventId);
    eventString.append(" ");
    eventString.append(eventArgs);
    SendPluginEvent(eventString.c_str(), m_pContext);
}

void Push::startService()
{
    if (m_monitorThread) {
        stopService();
    }

    if (m_pPushService) {
        delete m_pPushService;
        m_pPushService = NULL;
    }

    m_pPushService = new PushService(m_appId, m_invokeTargetId);
    m_pPushService->setListener(this);
    m_fileDescriptor = m_pPushService->getPushFd();

    bool started = false;
    m_shutdownThread = false;

    if (m_fileDescriptor == INVALID_PPS_FILE_DESCRIPTOR) {
        fprintf(stderr, "start: Invalid PPS file descriptor.\n");
    } else {
        // Create the Push PPS file descriptor monitor thread
        if (startMonitorThread() == 0) {
            started = true;
        } else {
            fprintf(stderr, "start: Failed to create thread.\n");
        }
    }

    if (started) {
        m_pPushService->createSession();
    } else {
        onCreateSessionComplete(bb::communications::push::PUSH_ERR_INTERNAL_ERROR);
    }
}

void Push::createChannel()
{
    if (m_pPushService) {
        m_pPushService->createChannel(m_ppgUrl);
    } else {
        onCreateChannelComplete(bb::communications::push::PUSH_ERR_INTERNAL_ERROR, "");
    }
}

void Push::destroyChannel()
{
    if (m_pPushService) {
        m_pPushService->destroyChannel();
    } else {
        onDestroyChannelComplete(bb::communications::push::PUSH_ERR_INTERNAL_ERROR);
    }
}

std::string Push::extractPushPayload(const std::string& invokeData)
{
    std::string decoded_data = decodeBase64(invokeData);
    PushPayload pushPayload(reinterpret_cast<const unsigned char *>(decoded_data.c_str()), decoded_data.length());

    Json::Value payload_obj;

    if (pushPayload.isValid()) {
        payload_obj["valid"] = Json::Value(true);

        // Retrieve the push information
        payload_obj["id"] = Json::Value(pushPayload.getId());
        payload_obj["isAcknowledgeRequired"] = Json::Value(pushPayload.isAckRequired());

        // Retrieve the headers
        Json::Value headers;
        std::map<std::string, std::string> headers_map = pushPayload.getHeaders();
        std::map<std::string, std::string>::const_iterator headers_iter;

        for (headers_iter = headers_map.begin(); headers_iter != headers_map.end(); headers_iter++) {
            headers[headers_iter->first] = Json::Value(headers_iter->second);
        }

        payload_obj["headers"] = headers;

        // Retrieve the data (return as byte array)
        const unsigned char *data = pushPayload.getData();
        Json::UInt current;

        for (int i = 0; i < pushPayload.getDataLength(); i++) {
            current = data[i];
            payload_obj["data"].append(Json::Value(current));
        }
    } else {
        payload_obj["valid"] = Json::Value(false);
    }

    // Write the final JSON object
    Json::FastWriter writer;
    return writer.write(payload_obj);
}

void Push::registerToLaunch()
{
    if (m_pPushService) {
        m_pPushService->registerToLaunch();
    } else {
        onRegisterToLaunchComplete(bb::communications::push::PUSH_ERR_INTERNAL_ERROR);
    }
}

void Push::unregisterFromLaunch()
{
    if (m_pPushService) {
        m_pPushService->unregisterFromLaunch();
    } else {
        onUnregisterFromLaunchComplete(bb::communications::push::PUSH_ERR_INTERNAL_ERROR);
    }
}

void Push::acknowledge(const std::string& payloadId, bool shouldAccept)
{
    if (m_pPushService) {
        if (shouldAccept) {
            m_pPushService->acceptPush(payloadId);
        } else {
            m_pPushService->rejectPush(payloadId);
        }
    }
}

void Push::stopService()
{
    if (!m_monitorThread) {
        return;
    }

    // Write 1 byte to the pipe to wake up the select which will kick out of the loop by setting the boolean below to true
    m_shutdownThread = true;
    if (write(m_pipeFileDescriptors[PIPE_WRITE_FD], "a", 1) < 0) {
        fprintf(stderr, "stop: Failed to write to pipe\n");
    }

    // Wait for other thread to finish
    pthread_join(m_monitorThread, NULL);
    m_monitorThread = 0;
}

void Push::onCreateSessionComplete(const PushStatus& status)
{
    std::stringstream ss;
    ss << status.getCode();

    notifyEvent("blackberry.push.create.callback", ss.str());
}

void Push::onCreateChannelComplete(const PushStatus& status, const std::string& token)
{
    std::stringstream ss;
    ss << status.getCode();
    ss << " ";

    if (status.getCode() == bb::communications::push::PUSH_NO_ERR) {
        ss << token;
        notifyEvent("blackberry.push.createChannel.callback", ss.str());
    } else {
        notifyEvent("blackberry.push.createChannel.callback", ss.str());
    }
}

void Push::onDestroyChannelComplete(const PushStatus& status)
{
    std::stringstream ss;
    ss << status.getCode();
    notifyEvent("blackberry.push.destroyChannel.callback", ss.str());
}

void Push::onRegisterToLaunchComplete(const PushStatus& status)
{
    std::stringstream ss;
    ss << status.getCode();
    notifyEvent("blackberry.push.launchApplicationOnPush.callback", ss.str());
}

void Push::onUnregisterFromLaunchComplete(const PushStatus& status)
{
    std::stringstream ss;
    ss << status.getCode();
    notifyEvent("blackberry.push.launchApplicationOnPush.callback", ss.str());
}

void Push::onSimChange()
{
    notifyEvent("blackberry.push.create.simChangeCallback", "{}");
}

void Push::monitorMessages()
{
    fd_set fileDescriptorSet;
    //Initialize the list
    FD_ZERO(&fileDescriptorSet);
    int max_fd = 0;

    // The pipe is used to send a single byte dummy message to unlock the select request in the stop function
    char dummy_pipe_buf[1];
    pipe(m_pipeFileDescriptors);

    while (!m_shutdownThread)
    {
        // Add PPS file descriptor to the set to monitor in the select
        FD_SET(m_fileDescriptor, &fileDescriptorSet);
        max_fd = std::max(max_fd, m_fileDescriptor);

        // Add pipe file descriptor to the set to monitor in the select
        FD_SET(m_pipeFileDescriptors[PIPE_READ_FD], &fileDescriptorSet);
        if (m_pipeFileDescriptors[PIPE_READ_FD] > max_fd) {
            max_fd = m_pipeFileDescriptors[PIPE_READ_FD];
        }

        if ((select(max_fd + 1, &fileDescriptorSet, NULL, NULL, NULL)) > 0) {
            // Check which fileDescriptor that is being monitored by the select has been changed
            if (FD_ISSET(m_fileDescriptor, &fileDescriptorSet)) {
                m_pPushService->processMsg();
            }
            else if (FD_ISSET(m_pipeFileDescriptors[PIPE_READ_FD], &fileDescriptorSet )) {
                // Ignore dummy data
                read(m_pipeFileDescriptors[PIPE_READ_FD], dummy_pipe_buf, sizeof(dummy_pipe_buf));
            }
        }
    }
}

int Push::startMonitorThread()
{
    return pthread_create(&m_monitorThread, NULL, &monitorMessagesStartThread, static_cast<void *>(this));
}

void* Push::monitorMessagesStartThread(void* parent)
{
    Push *pParent = static_cast<Push *>(parent);
    pParent->monitorMessages();

    return NULL;
}

std::string Push::decodeBase64(const std::string& encodedString)
{
    static const std::string base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                                            "abcdefghijklmnopqrstuvwxyz"
                                            "0123456789+/";

    size_t remaining = encodedString.size();
    size_t position;
    int i = 0, j = 0, current = 0;
    unsigned char current_set[4];
    std::string decoded_string;

    while ((remaining--) && ((position = base64_chars.find(encodedString[current++])) != std::string::npos)) {
        current_set[i++] = static_cast<unsigned char>(position);

        if (i == 4) {
            i = 0;
            decoded_string += (current_set[0] << 2) | ((current_set[1] & 0x30) >> 4);
            decoded_string += ((current_set[1] & 0xf) << 4) | ((current_set[2] & 0x3c) >> 2);
            decoded_string += ((current_set[2] & 0x3) << 6) | current_set[3];
        }
    }

    if (i) {
        if (i >= 2) {
            decoded_string += (current_set[0] << 2) | ((current_set[1] & 0x30) >> 4);
        }

        if (i >= 3) {
            decoded_string += ((current_set[1] & 0xf) << 4) | ((current_set[2] & 0x3c) >> 2);
        }
    }

    return decoded_string;
}

