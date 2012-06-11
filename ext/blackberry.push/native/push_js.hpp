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

#ifndef PUSH_JS_H_
#define PUSH_JS_H_

#include <bb/communications/push/PushErrno.hpp>
#include <bb/communications/push/PushService.hpp>
#include <bb/communications/push/PushPayload.hpp>

#include <pthread.h>
#include <string>
#include "../common/plugin.h"

// groups
#define PNS_ENTERPRISE_GROUP    1200        // enterprise
#define PNS_PERSONAL_GROUP      1000        // personal

#define INVALID_PPS_FILE_DESCRIPTOR     -1

enum PipeFileDescriptor {
       PIPE_READ_FD = 0,
       PIPE_WRITE_FD,
       PIPE_FD_SIZE
};

typedef bb::communications::push::PushListener PushListener;
typedef bb::communications::push::PushService PushService;
typedef bb::communications::push::PushStatus PushStatus;
typedef bb::communications::push::PushPayload PushPayload;

class Push: public JSExt, public PushListener {
public:
    explicit Push(const std::string& id);
    virtual ~Push();

// Interfaces defined in JSExt
    virtual std::string InvokeMethod(const std::string& command);
    virtual bool CanDelete();

// Interfaces defined in PushListener
    virtual void onCreateSessionComplete(const PushStatus& status);
    virtual void onCreateChannelComplete(const PushStatus& status, const std::string& token);
    virtual void onDestroyChannelComplete(const PushStatus& status);
    virtual void onRegisterToLaunchComplete(const PushStatus& status);
    virtual void onUnregisterFromLaunchComplete(const PushStatus& status);
    virtual void onSimChange();

// Class-specific members
    void notifyEvent(const std::string& eventId, const std::string& eventArgs);
    void monitorMessages();
    static void* monitorMessagesStartThread(void* parent);

private:
    void startService();
    void createChannel();
    void destroyChannel();
    std::string extractPushPayload(const std::string& invokeData);
    void registerToLaunch();
    void unregisterFromLaunch();
    void acknowledge(const std::string& payloadId, bool shouldAccept);

    void stopService();
    int startMonitorThread();
    std::string decodeBase64(const std::string& encodedString);

private:
    std::string m_id; // JNext id

    std::string m_invokeTargetId;
    std::string m_appId;
    std::string m_ppgUrl;
    PushService* m_pPushService;
    int m_fileDescriptor;                       // Push service file descriptor
    pthread_t m_monitorThread;
    int m_pipeFileDescriptors[PIPE_FD_SIZE];    // pipe to write dummy data to wake up select
    bool m_shutdownThread;
};

#endif /* PUSH_JS_H_ */
