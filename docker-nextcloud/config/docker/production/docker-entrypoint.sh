#!/bin/bash
set -e

# version_greater A B returns whether A > B
function version_greater() {
	[[ "$(printf '%s\n' "$@" | sort -V | head -n 1)" != "$1" ]];
}

installed_version="0.0.0~unknown"
if [ -f /var/www/html/version.php ]; then
    installed_version=$(php -r 'require "/var/www/html/version.php"; echo "$OC_VersionString";')
fi
image_version=$(php -r 'require "/usr/src/nextcloud/version.php"; echo "$OC_VersionString";')

if version_greater "$installed_version" "$image_version"; then
    echo "Can't start Nextcloud because the version of the data ($installed_version) is higher than the docker image version ($image_version) and downgrading is not supported. Are you sure you have pulled the newest image version?"
    exit 1
fi

if version_greater "$image_version" "$installed_version"; then
    if [ "$installed_version" != "0.0.0~unknown" ]; then
        su - www-data -s /bin/bash -c 'php /var/www/html/occ app:list' > /tmp/list_before
    fi

    rsync -a --delete --exclude /config/ --exclude /data/ --exclude /custom_apps/ --exclude /themes/ /usr/src/nextcloud/ /var/www/html/

    if [ ! -d /var/www/html/config ]; then
        cp -arT /usr/src/nextcloud/config /var/www/html/config
    fi

    if [ ! -d /var/www/html/data ]; then
        cp -arT /usr/src/nextcloud/data /var/www/html/data
    fi

    if [ ! -d /var/www/html/custom_apps ]; then
        cp -arT /usr/src/nextcloud/custom_apps /var/www/html/custom_apps
        cp -a /usr/src/nextcloud/config/apps.config.php /var/www/html/config/apps.config.php
    fi

    if [ ! -d /var/www/html/themes ]; then
        cp -arT /usr/src/nextcloud/themes /var/www/html/themes
    fi

    if [ "$installed_version" != "0.0.0~unknown" ]; then
        su - www-data -s /bin/bash -c 'php /var/www/html/occ upgrade --no-app-disable'

        su - www-data -s /bin/bash -c 'php /var/www/html/occ app:list' > /tmp/list_after
        echo "The following apps have beed disabled:"
        diff <(sed -n "/Enabled:/,/Disabled:/p" /tmp/list_before) <(sed -n "/Enabled:/,/Disabled:/p" /tmp/list_after) | grep '<' | cut -d- -f2 | cut -d: -f1
        rm -f /tmp/list_before /tmp/list_after
    fi
fi

# make efs volume writable for the current user
echo '--> chown /efs/data to www-data:nogroup for EFS..'
chown www-data /efs/data

echo '--> chown /efs/apps2 to www-data:nogroup for EFS..'
chown www-data /efs/apps2

# kill a possible admin user again in the db, for n- time deployment
echo '--> delete possible existing "admin" user again..'
mysql -u $DB_USER -h $DB_HOST -p$DB_PASS -e "DELETE FROM ${DB_NAME}.oc_users WHERE uid = 'admin';" || echo 'first time install'

# remove a possible "htaccesstest.txt" to prevent owncloud from warning ".htaccess is not working!"
echo '--> kill possible existing "htaccesstest.txt"..'
rm -f /efs/data/htaccesstest.txt
rm -f /var/www/html/data/htaccesstest.txt
rm -f /var/www/html/data/.htaccess

# load latest "autoconfig.php" for current customer (ENV variables driven)
echo '--> load latest "autoconfig.php" for customer $CUSTOMER_DOMAIN..'
wget http://node.stackbee.cloud/api/owncloud/autoconfig.php/$CUSTOMER_DOMAIN?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHN0YWNrYmVlLmlvIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNDk3NjQ0MTgyfQ.vBpRonrwXE2EU96NUWJT0nA9eTCpBlyjn678fAgNOO8 -O /var/www/html/config/autoconfig.php

chmod o+r /var/www/html/config

echo '--> update the route of the current customer back in mongodb..'
curl http://node.stackbee.cloud/api/owncloud/update-route/$CUSTOMER_DOMAIN?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImFkbWluQHN0YWNrYmVlLmlvIiwicm9sZXMiOlsiYWRtaW4iXSwiaWF0IjoxNDk3NjQ0MTgyfQ.vBpRonrwXE2EU96NUWJT0nA9eTCpBlyjn678fAgNOO8

echo ''
echo '--> fix file permissions'
chown -R www-data:www-data /var/www/html

# by: http://www.digitalinternals.com/unix/linux-monitor-file-system-changes/397/
inotifywait -mrq -e create /var/www/html/config | while read file; do (/on-config-create.sh $file&) done &

exec "$@"
