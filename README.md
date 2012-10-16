#BB10-WebWorks-Framework

##Prerequisites
1. Install node and npm and add to path. [Download Here](http://nodejs.org/dist/v0.6.10/)
2. Install BlackBerry Native SDK. [Download Here](https://bdsc.webapps.blackberry.com/native/)
3. [*Windows*] Add Git bin to PATH. i.e. \*Installation Directory\*\bin

##Setup and Build
1. `git clone https://github.com/blackberry-webworks/BB10-WebWorks-Framework.git`
2. `cd BB10-WebWorks-Framework`
3. `git checkout next`
4. **Configuration:**
    - [*Mac*] `./configure` [from terminal]
    - [*Windows*] `bash configure` [from command prompt]
5. Run `jake test` and check that jake runs and completes
6. **Setup bbndk environment variable:**
    - [*Mac*] Add `source \*BBNDK installation directory\*/bbndk-env.sh` to your bash profile
    - [*Windows*] Run `\*BBNDK installation directory\*\bbndk-env.bat` from the currently opened command prompt. This script must be run from the command prompt window that you intend to run `jake` from.
7. [*open-source devs only*] **Webplatform setup:**
    If building from the open-source community, copy the following webplatform files from the latest BB10 Webworks SDK into ./dependencies/webplatform/framework/clientFiles/.
    - Framework/dependencies/bootstrap/webplatform.js
    - Framework/ui-resources [folder]
    - Framework/i18n.js
8. Run `jake` or `jake build` and check that the output folder is created under the "target/zip" subfolder. If on windows, run jake from command prompt.

##Running Tests
1. `jake test`  - to run js tests using nodejs
2. `jake native-test` - to run native unit tests
    1. To setup run jake upload-ssh-key[<IP>,<ssh public key location>] eg. `jake upload-ssh-key[169.254.0.1,~/.ssh/id_rsa.pub]`
    2. To run the tests use jake native-test[<device or simulator>,<IP>] eg. `jake native-test[device,169.254.0.1]`

##Dependencies
1. cpplint is used for linting Cpp code. Source code is located under dependencies/cpplint
2. JNEXT 1.0.8.3 is used to build extensions.
Original source of JNEXT was downloaded from here - http://jnext.googlecode.com/files/jnext-src-1.0.8.3.zip
Modifications are available in source code and located udner dependencies/jnext_1_0_8_3

