#!/bin/sh
basedir=$(dirname "$0")
exec "$basedir/backend/mvnw" "$@"
