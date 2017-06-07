#!/usr/bin/env node

import killCluster from './shared/killCluster';
import { CLUSTER_NAME, STACK_NAME } from './shared/constants';

killCluster(CLUSTER_NAME, STACK_NAME);