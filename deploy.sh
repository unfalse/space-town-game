#!/usr/bin/env bash
set -e

HOST=homepagedo
DEST=/opt/space-town

yarn install --immutable
yarn build
yarn compile

rsync -avz --delete dist/ $HOST:$DEST/dist/
rsync -avz package.json yarn.lock $HOST:$DEST/

ssh $HOST "cd $DEST && yarn workspaces focus --production && sudo systemctl restart spacetown"

echo "OK: https://st.unfalsecoding.net"