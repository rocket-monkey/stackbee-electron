#!/usr/bin/env bash

# stupid workaround to make electron-builder publish work
# -> next installs it's own package "url" so we end up not using the native module anymore in "httpExecutor.js" of "builder-util-runtime", so we need to change a className from "URL" to "Url" -.-

if [ "$TRAVIS_OS_NAME" == "linux" ]; then
  sed -i 's/      const parsedNewUrl = new (_url().URL)(redirectUrl);/      const parsedNewUrl = new (_url().Url)(redirectUrl);/' node_modules/builder-util-runtime/out/httpExecutor.js
else
  sed -i '' 's/      const parsedNewUrl = new (_url().URL)(redirectUrl);/      const parsedNewUrl = new (_url().Url)(redirectUrl);/' node_modules/builder-util-runtime/out/httpExecutor.js
fi