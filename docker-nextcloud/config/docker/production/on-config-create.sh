#!/bin/bash
file=$1

# echo "File udated: $file" | tee -a /var/log/inotify.log

nbOfLines=$(grep -c '' /var/www/html/config/config.php)
secondLast=$((nbOfLines - 1))

echo "on-config-create: number of lines: $secondLast"

# 'memcache.local' => '\OC\Memcache\APCu',
# 'filelocking.enabled' => 'true',
# 'memcache.locking' => '\\OC\\Memcache\\Redis',
# 'redis' =>
# array (
# 'host' => '/var/run/redis/redis.sock',
# 'port' => 0,
# 'timeout' => 0.0,
# ),

if grep -q memcache "/var/www/html/config/config.php"; then
  echo '*** on-config-create ***'
  echo '-> memcache config does already exist'

  echo '-> add trusted domain and apps_paths and import defaultConfig.json' &
  bash -c 'sleep 70; sudo -u www-data ./occ config:import /var/www/defaultConfig.json' &
  bash -c 'sleep 75; sudo -u www-data ./occ config:system:set trusted_domains 2 --value=$CUSTOMER_DOMAIN.stackbee.cloud'
  bash -c 'sleep 80; sudo -u www-data ./occ app:install camerarawpreviews'
  bash -c 'sleep 90; sudo -u www-data ./occ app:install metadata'
  bash -c 'sleep 100; sudo -u www-data ./occ app:install richdocuments'

  # echo '-> uninstall sudo again'
  # apt-get -y remove sudo --force-yes
else
  # the config.php is created during initial setup process of nextcloud
  # which is triggered by the first request hiting the server
  # -> to not fuck up the setup process we have to wait until we modify the config.php on our own
  bash -c 'sleep 30; /modify-config.sh' &
  echo 'on-config-create: memcache config write set to sleep!'
fi