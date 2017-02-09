#!/bin/sh

WEBDIRECTORY=/var/www/site.com; 
GITDIRECTORY=/var/project/site.git;

echo "Pushing $COMMIT to repository."
echo "Suspending Application"  
cd $WEBDIRECTORY  
php artisan down

echo "Checking out latest"  
cd $GITDIRECTORY  
GIT_WORK_TREE=$WEBDIRECTORY git fetch origin master;  
GIT_WORK_TREE=$WEBDIRECTORY git checkout -f;

cd $WEBDIRECTORY
echo "Prep Packages"    
npm install

echo "Running Gulp tasks"
gulp

echo "Updating composer (Optional)"
composer self-update

echo "Running composer install"
composer install --optimize-autoloader --no-dev

echo "Running outstanding migrations"  
php artisan migrate --force

echo "Clearing Cache"  
php artisan cache:clear
php artisan config:cache

echo "Bringing Application Online"  
php artisan up

echo "Deployment finished!"