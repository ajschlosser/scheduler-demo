#!/usr/bin/env bash

echo "Initializing 'app_demo' MySQL database..."

mysql -u root < ./data/app_demo_schema.sql

echo "Done initializing MySQL database."