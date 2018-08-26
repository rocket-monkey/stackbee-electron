#!/usr/bin/env bash

# stupid workaround to make electron-builder publish work
# -> next installs it's own package "url" so we end up not using the native module anymore in "httpExecutor.js" of "builder-util-runtime", so we need to change a className from "URL" to "Url" -.-

while read a ; do echo ${a//_url().URL/_url().Url} ; done < ./node_modules/builder-util-runtime/out/httpExecutor.js > ./node_modules/builder-util-runtime/out/httpExecutor.js.t ; mv ./node_modules/builder-util-runtime/out/httpExecutor.js{.t,}