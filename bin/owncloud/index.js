#!/usr/bin/env node

import processNewCustomers from './shared/processNewCustomers';

// TODO: implement a database connection here -> flag already processed ones so we can do a cronjob out of it (which only processes new ones all 5mins)
const customers = ['remo'];

processNewCustomers(customers);