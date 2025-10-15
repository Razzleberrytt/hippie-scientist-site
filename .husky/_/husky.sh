#!/bin/sh
# shellcheck shell=sh

if [ -z "$husky_skip_init" ]; then
  export husky_skip_init=1
fi
