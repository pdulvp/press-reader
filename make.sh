MAIN_HOME=`pwd`
SERVER_VERSION=`date +"%Y.%m.%d"`
NODE_VERSION="23.7.0"

rm -rf *.xz
rm -rf output
mkdir -p output/shared/site
cp -r packaging/* "output/"
cp -r "site" "output/shared/"
cp -r "utils" "output/shared/"
mkdir -p output/shared/accessorh
#cp -r "accessorh" "output/shared/"
cp -r "node_modules" "output/shared/"
cp *.mts "output/shared/"
cp *.json "output/shared/"

ARCH=amd64

get() {
  URL=$1
  KEY=${URL##*/}
  KEY=$(echo $KEY | sed "s/%2B/\+/g")
  echo $KEY
  if [ -f .cache/deb/$KEY ]; then
    cp .cache/deb/$KEY .
    echo -e "\033[0;32mGet from cache \033[0m"
  else
    wget -q $URL
    mkdir -p .cache/deb;
    cp $KEY .cache/deb
  fi
}

get "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz"

if ! ./prefetch-lib.sh "$NODE_VERSION" "$ARCH"; then
    exit $?
fi

if ! ./unpack-lib.sh "$NODE_VERSION-$ARCH-lib"; then
  exit $?
fi

mkdir -p output/shared/node
mkdir -p output/shared/node/lib/

# move all libs under bin as jellyfin doesn't support other folders.
mv .tmp/lib/lib/*-linux-*/* output/shared/node/lib/
mv .tmp/lib/usr/lib/*-linux-*/* output/shared/node/lib/

tar -xf "${MAIN_HOME}/node-v${NODE_VERSION}-linux-x64.tar.xz" -C output/shared/node --strip-components=1

if ! ./package.sh $ARCH $SERVER_VERSION; then
  exit $?
fi

json=$(cat package.json | jq ".version = \"$SERVER_VERSION\"")
json=$(echo $json | jq ".node_version = \"$NODE_VERSION\"")
printf '%s\n' "$json" > package.json
