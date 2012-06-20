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

#ifndef FILETRANSFER_CURL_H_
#define FILETRANSFER_CURL_H_

#include <curl/curl.h>
#include <string>
#include <vector>

class FileTransfer;

namespace webworks {

struct FileUploadInfo {
    std::string eventId;
    std::string sourceFile;
    std::string targetURL;
    std::string fileKey;
    std::string fileName;
    std::string mimeType;
    std::vector<std::string> params;
    FileTransfer *pParent;
    bool chunkedMode;
    int chunkSize;
};

enum FileTransferErrorCodes {
    FILE_NOT_FOUND_ERR = 1,
    INVALID_URL_ERR = 2,
    CONNECTION_ERR = 3
};

class FileTransferCurl {
public:
    static int MAX_CHUNK_SIZE;
    FileTransferCurl();
    ~FileTransferCurl();
    std::string Upload(FileUploadInfo *uploadInfo);
    static size_t UploadReadCallback(void *ptr, size_t size, size_t nmemb, void *userdata);
    static size_t UploadWriteCallback(void *ptr, size_t size, size_t nmemb, void *userdata);
private:
    std::string buildUploadSuccessString(const int bytesSent, const int responseCode, const std::string& response);
    std::string buildUploadErrorString(const int errorCode, const std::string& sourceFile, const std::string& targetURL, const int httpStatus);
};

} // namespace webworks

#endif // FILETRANSFER_CURL_H_

