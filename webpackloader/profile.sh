#!/usr/bin/env bash

node_modules/.bin/webpack --config webpackloader/webpack.config.js &
webpackPid=$!

cmd1="dtrace -qn 'syscall::read:return /pid == $webpackPid/ { @ = quantize(arg0); }'"
eval $cmd1 &

wait $webpackPid
pkill dtrace

