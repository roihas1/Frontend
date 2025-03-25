#!/bin/sh

echo "Generating config.js from template..."

envsubst < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js

echo "Resulting config.js:"
cat /usr/share/nginx/html/config.js

exec "$@"
