#!/usr/bin/env bash

# stupid workaround to make electron-builder publish work
# -> next installs it's own package "url" so we end up not using the native module anymore in "httpExecutor.js" of "builder-util-runtime", so we need to change a className from "URL" to "Url" -.-

sed -i '' 's/      const parsedNewUrl = new (_url().URL)(redirectUrl);/      const parsedNewUrl = new (_url().Url)(redirectUrl);/' node_modules/builder-util-runtime/out/httpExecutor.js