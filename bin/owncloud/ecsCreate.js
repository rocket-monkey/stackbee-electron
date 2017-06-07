#!/usr/bin/env node

import createCluster, { createClusterDependencies } from './shared/createCluster';
import { STACK_NAME } from './shared/constants';

// createClusterDependencies(STACK_NAME);
createCluster(STACK_NAME);