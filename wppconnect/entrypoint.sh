#!/bin/sh
set -e

corepack enable
corepack prepare yarn@4.12.0 --activate

exec yarn dev
