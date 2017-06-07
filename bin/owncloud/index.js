#!/usr/bin/env node

import processNewCustomers from '../shared/processNewCustomers';
import killCluster from '../shared/killCluster';

const CLUSTER_NAME = 'ecs-sb-owncloud';
const TASK_DEFINITION = 'stackbee-owncloud';
const TASK_RUN_WAIT_TIMEOUT = 10000;
const TASK_RUN_MAX_WAIT_INTERVALS = 20;

// TODO: implement a database connection here -> flag already processed ones so we can do a cronjob out of it (which only processes new ones all 5mins)
const customers = ['remo'];

// processNewCustomers(customers);

killCluster(CLUSTER_NAME);