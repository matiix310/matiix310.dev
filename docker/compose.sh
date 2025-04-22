#!/bin/bash

OUTPUT=frontend-builds

cd ../
rm -rf $OUTPUT
mkdir $OUTPUT
bun --filter='frontend-*' run build

for f in $(ls packages/ | grep frontend-); do
    mkdir $OUTPUT/$f
    cp -r packages/$f/dist $OUTPUT/$f/dist
done;

cd docker
docker compose up --build -d