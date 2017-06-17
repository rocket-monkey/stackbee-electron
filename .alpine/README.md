# Alpine Specialties

## make npm package "bcrypt" work on alpine linux

The locally built bcrypt binary is not compatible with the alpine linux distro. So to solve this, we can run the special Dockerfile here in the .alpine dir, which will install all the needed built and dev tools to run a complete fresh `npm install` which will make-install the bcrypt package from scratch.

Afterwards, let the special docker build run once, and copy (`docker cp <instance-id>:/path /path`) the whole package out of the instance into this special directory `node_modules_exceptions` here.

So in the final Dockerfile, we can just `ADD` such exceptions manually from this `node_modules_exceptions` and don't need to bloat the whole image with 200+ MB's of build-tools (and slow-down the startup to 5mins or so..)