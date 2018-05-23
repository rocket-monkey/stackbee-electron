#!/bin/bash
memcacheHost1=$(echo "owncloud.odkaa3.cfg.euw1.cache.amazonaws.com")
memcachePort=$(echo "11211")

# sed -i "18i\'memcache.local' => '\OC\Memcache\APCu'," /var/www/html/config/config.php
# sed -i "18i\'memcache.local'=> '\OC\Memcache\Memcached,\n'memcache.distributed' => '\OC\Memcache\Memcached',\n'memcached_servers' =>\narray (\narray('$memcacheHost1', $memcachePort),)," /var/www/html/config/config.php