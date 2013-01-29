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
#include <string>
#include <QThreadPool>
#include "pim_message_js.hpp"
#include "pim_message_ndk.hpp"

PimMessage::PimMessage(const std::string& id) : m_id(id), m_thread(0)
{
    messageController = new webworks::PimMessageNdk();
}

PimMessage::~PimMessage()
{
    messageController->~PimMessageNdk();
}

char* onGetObjList()
{
    // Return list of classes in the object
    static char name[] = "PimMessage";
    return name;
}

JSExt* onCreateObject(const std::string& className, const std::string& id)
{
    // Make sure we are creating the right class
    if (className != "PimMessage") {
        return 0;
    }

    return new PimMessage(id);
}

bool PimMessage::CanDelete()
{
    return true;
}

// Notifies JavaScript of an event
void PimMessage::NotifyEvent(const std::string& eventId, const std::string& event)
{
    std::string eventString = m_id + " result ";
    eventString.append(eventId);
    eventString.append(" ");
    eventString.append(event);
    SendPluginEvent(eventString.c_str(), m_pContext);
}

std::string PimMessage::InvokeMethod(const std::string& command)
{
    int index = command.find_first_of(" ");

    string strCommand = command.substr(0, index);
    string jsonObject = command.substr(index + 1, command.length());

    Json::Reader reader;
    Json::Value *obj = new Json::Value;

    if (strCommand == "getAccounts")
    {
        fprintf(stderr, "InvokeMethod getAccounts\n");
        Json::Value result = messageController->getAccounts();
        Json::FastWriter writer;
        std::string jsonString = writer.write(result);
        return jsonString;
    }
    else if (strCommand == "dummyFunction")
    {
        fprintf(stderr, "InvokeMethod dummyFunction\n");
        Work work;
        work.setAutoDelete(false);
        QThreadPool *threadPool = QThreadPool::globalInstance();
        threadPool->start(&work);
        fprintf(stderr, "hello from dummyFunction\n");
        threadPool->waitForDone();
        return "";
    }
    else if (strCommand == "getDefaultAccount")
    {
        fprintf(stderr, "InvokeMethod getDefaultAccount\n");
        Json::Value result = messageController->getDefaultAccount();
        Json::FastWriter writer;
        std::string jsonString = writer.write(result);
        return jsonString;
    }
    else if (strCommand == "getMessage")
    {
        fprintf(stderr, "InvokeMethod getMessage");
        Json::Value result;
        Json::FastWriter writer;
        fprintf(stderr, "arguments before parsing: %s\n", jsonObject.c_str());
        bool parse = reader.parse(jsonObject, *obj);
        if (!parse) {
            fprintf(stderr, "error parsing\n");
            return "Cannot parse JSON object";
        }
        fprintf(stderr, "obj after parsing: %s\n", obj->toStyledString().c_str());
        result = messageController->getMessage(*obj);
        fprintf(stderr, "result: %s\n", result.toStyledString().c_str());
        std::string jsonString = writer.write(result);
        fprintf(stderr, "jsonString: %s\n", jsonString.c_str());
        return jsonString;
    }
    else if (strCommand == "sendMessage")
    {
        fprintf(stderr, "InvokeMethod send\n");
        bool parse = reader.parse(jsonObject, *obj);
        if (!parse) {
            fprintf(stderr, "%s", "error parsing\n");
            return "Cannot parse JSON object";
        }

        startThread(sendThread, obj);
    }
    else if (strCommand == "saveAttachment")
    {
        bool parse = reader.parse(jsonObject, *obj);
        if (!parse) {
            fprintf(stderr, "%s", "error parsing\n");
            return "Cannot parse JSON object";
        }
        fprintf(stderr, "Made it to saveAttachment in InvokeMethod \n");

        startThread(saveAttachmentThread, obj);
    }
    return "";
}

bool PimMessage::startThread(ThreadFunc threadFunction, Json::Value *jsonObj)
{
    webworks::PimMessageThreadInfo *threadInfo = new webworks::PimMessageThreadInfo;
    threadInfo->parent = this;
    threadInfo->jsonObj = jsonObj;
    threadInfo->eventId = jsonObj->removeMember("_eventId").asString();

    pthread_attr_t thread_attr;
    pthread_attr_init(&thread_attr);
    pthread_attr_setdetachstate(&thread_attr, PTHREAD_CREATE_DETACHED);

    pthread_t thread;
    pthread_create(&thread, &thread_attr, threadFunction, static_cast<void *>(threadInfo));
    pthread_attr_destroy(&thread_attr);

    if (!thread) {
        fprintf(stderr, "thread was not created\n");
        return false;
    }

    fprintf(stderr, "hit the end of startThread\n");
    return true;
}

void* PimMessage::sendThread(void *args)
{
    fprintf(stderr, "executing sendThread\n");

    webworks::PimMessageThreadInfo *thread_info = static_cast<webworks::PimMessageThreadInfo *>(args);

    webworks::PimMessageNdk pimNdk;

    fprintf(stderr, "before send\n");
    Json::Value result = pimNdk.send(*(thread_info->jsonObj));
    fprintf(stderr, "after send\n");

    Json::FastWriter writer;
    std::string event = writer.write(result);

    fprintf(stderr, "result from send %s\n", result.toStyledString().c_str());

    thread_info->parent->NotifyEvent(thread_info->eventId, event);
    return NULL;
}

void* PimMessage::saveAttachmentThread(void *args)
{
    fprintf(stderr, "executing saveAttachmentThread\n");

    webworks::PimMessageThreadInfo *thread_info = static_cast<webworks::PimMessageThreadInfo *>(args);

    webworks::PimMessageNdk pimNdk;

    fprintf(stderr, "before saveAttachment\n");
    Json::Value result = pimNdk.saveAttachment(*(thread_info->jsonObj));
    fprintf(stderr, "after saveAttachment\n");

    Json::FastWriter writer;
    std::string event = writer.write(result);

    fprintf(stderr, "result from saveAttachment %s\n", result.asCString());

    thread_info->parent->NotifyEvent(thread_info->eventId, event);
    return NULL;
}
