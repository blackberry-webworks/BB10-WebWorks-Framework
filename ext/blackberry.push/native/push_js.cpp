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

#include <string>
#include "push_js.hpp"

#define EMPTY_JSON "{}"

std::string g_invokeTargetId = "com.domain.subdomain.appname.app";
std::string g_appId = "1-RDce63it6363";
std::string g_ppgUrl = "http://pushapi.eval.blackberry.com";

void* monitorMessagesStartThread(void* parent);

Push::Push(const std::string& id) :
        m_id(id) {
    m_invokeTargetId = g_invokeTargetId;
    m_appId = g_appId;
    m_ppgUrl = g_ppgUrl;
    m_pPushService = NULL;
    m_fileDescriptor = INVALID_PPS_FILE_DESCRIPTOR;
    m_monitorThread = 0;
    m_shutdownThread = false;
}

Push::~Push() {
    // TODO, wait for m_monitorThread to join
}

char* onGetObjList() {
    static char name[] = "Push";
    return name;
}

JSExt* onCreateObject(const std::string& className, const std::string& id) {
    if (className != "Push") {
        return NULL;
    }

    return new Push(id);
}

std::string Push::InvokeMethod(const std::string& command) {
    fprintf(stderr, "InvokeMethod: %s\n", command.c_str());

    int index = command.find_first_of(" ");

    string strCommand = command.substr(0, index);

    if (strCommand == "startService") {
        return startService();
    } else if (strCommand == "createChannel") {
        return createChannel();
    } else if (strCommand == "destroyChannel") {
        return destroyChannel();
    } else if (strCommand == "extractPushPayload") {
        return extractPushPayload();
    } else if (strCommand == "launchApplicationOnPush") {
        return launchApplicationOnPush();
    } else if (strCommand == "acknowledge") {
        return acknowledge();
    }

    return "Unsupported method";
}

bool Push::CanDelete() {
    return true;
}

// Notifies JavaScript of an event
void Push::notifyEvent(const std::string& eventId, const std::string& eventArgs) {
    std::string eventString = m_id;
    eventString.append(" ");
    eventString.append(eventId);
    eventString.append(" ");
    eventString.append(eventArgs);
    SendPluginEvent(eventString.c_str(), m_pContext);
}

std::string Push::startService() {
    fprintf(stderr, "startService is called\n");

    m_pPushService = new PushService(m_appId, m_invokeTargetId);
    m_pPushService->setListener(this);
    m_fileDescriptor = m_pPushService->getPushFd();

    bool started = false;

    if(m_fileDescriptor == INVALID_PPS_FILE_DESCRIPTOR) {
        fprintf(stderr, "start: Invalid PPS file descriptor.\n");
    } else {
        // Create the Push PPS file descriptor monitor thread
        if(startMonitorThread() == 0) {
            started = true;
        } else {
            fprintf(stderr, "start: Failed to create thread.\n");
        }
    }

    if (started) {
        //m_pPushService->createSession();
    }

    return "func=>startService";
}

std::string Push::createChannel() {
    return "func=>createChannel";
}

std::string Push::destroyChannel() {
    return "func=>destroyChannel";
}

std::string Push::extractPushPayload() {
    return "func=>extractPushPayload";
}

std::string Push::launchApplicationOnPush() {
    return "func=>launchApplicationOnPush";
}

std::string Push::acknowledge() {
    return "func=>acknowledge";
}

void Push::onCreateSessionComplete(const PushStatus& status) {
    // if succeeded
    notifyEvent("blackberry.push.create.successCallback", EMPTY_JSON);
    // if failed
    //notifyEvent("blackberry.push.create.failCallback", EMPTY_JSON);
}

void Push::onCreateChannelComplete(const PushStatus& status, const std::string& token) {
    notifyEvent("blackberry.push.createChannel.callback", EMPTY_JSON);
}

void Push::onDestroyChannelComplete(const PushStatus& status) {
    notifyEvent("blackberry.push.destroyChannel.callback", EMPTY_JSON);
}

void Push::onRegisterToLaunchComplete(const PushStatus& status) {
    notifyEvent("blackberry.push.launchApplicationOnPush.callback", EMPTY_JSON);
}

void Push::onUnregisterFromLaunchComplete(const PushStatus& status) {
    notifyEvent("blackberry.push.launchApplicationOnPush.callback", EMPTY_JSON);
}

void Push::onSimChange() {
    notifyEvent("blackberry.push.create.simChangeCallback", EMPTY_JSON);
}

void Push::monitorMessages()
{
    fprintf(stderr, "monitorMessages called\n");
    fprintf(stderr, "PushService: id: %s\nTargetKey: %s\nDName: %s\n", 
            m_pPushService->getProviderApplicationId().c_str(),
            m_pPushService->getTargetKey().c_str(),
            m_pPushService->getDName().c_str());

    fd_set fileDescriptorSet;
    //Initialize the list
    FD_ZERO(&fileDescriptorSet);
    int max_fd = 0;

    // The pipe is used to send a single byte dummy message to unlock the select request in the stop function
    char dummy_pipe_buf[1];
    pipe(m_pipeFileDescriptors);

    while(!m_shutdownThread)
    {
        // Add PPS file descriptor to the set to monitor in the select
        FD_SET(m_fileDescriptor, &fileDescriptorSet);
        max_fd = std::max(max_fd, m_fileDescriptor);
        fprintf(stderr, "monitorMessages: waiting for file (PPS) activity on file descriptor: [%d]\n", m_fileDescriptor);

        // Add pipe file descriptor to the set to monitor in the select
        FD_SET(m_pipeFileDescriptors[PIPE_READ_FD], &fileDescriptorSet );
        if(m_pipeFileDescriptors[PIPE_READ_FD] > max_fd) {
            max_fd = m_pipeFileDescriptors[PIPE_READ_FD];
        }

        if((select(max_fd + 1, &fileDescriptorSet, NULL, NULL, NULL)) > 0) {
            // Check which fileDescriptor that is being monitored by the select has been changed
            if(FD_ISSET(m_fileDescriptor, &fileDescriptorSet)) {
                  fprintf(stderr, "monitorMessages: PPS message received on file descriptor: [%d]\n", m_fileDescriptor);
                  m_pPushService->processMsg();
            }
            else if (FD_ISSET(m_pipeFileDescriptors[PIPE_READ_FD], &fileDescriptorSet )) {
                  // Ignore dummy data
                  fprintf(stderr, "monitorMessages: Dummy message received on pipe file descriptor\n");
                  read(m_pipeFileDescriptors[PIPE_READ_FD], dummy_pipe_buf, sizeof(dummy_pipe_buf));
            }
        }
    }

    fprintf(stderr, "monitorMessages: Exiting the thread\n");
}

int Push::startMonitorThread() {
    return pthread_create(&m_monitorThread, NULL, &monitorMessagesStartThread, static_cast<void *>(this));
}

void* monitorMessagesStartThread(void* parent) {
    fprintf(stderr, "monitorMessagesStartThread called\n");

    // Parent object is casted so we can use it
    Push *pParent = static_cast<Push *>(parent);
    pParent->monitorMessages();

    // this will definitely call the monitorMessage function associated with the object obj
    return NULL;
}
