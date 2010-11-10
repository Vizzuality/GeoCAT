#!/bin/sh
git pull
git checkout production
git merge master
git push
git checkout master
cap deploy
