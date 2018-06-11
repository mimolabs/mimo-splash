#!/bin/bash

set -e

cmd="$1"

while [ ! -f '/etc/mimo/build.config.js' ] ; do
  sleep 1
done

>&2 echo "Config found, running installation"
exec $cmd
