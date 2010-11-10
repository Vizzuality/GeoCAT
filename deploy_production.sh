#!/bin/sh
git pull
git checkout production
git merge staging
git push
git checkout master
cap deploy
