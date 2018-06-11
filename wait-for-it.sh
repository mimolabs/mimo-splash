#!/bin/bash

set -e

while [ ! -f '/etc/mimo/build.config.js' ] ; do
  sleep 1
done

>&2 echo "Config found, running installation"
