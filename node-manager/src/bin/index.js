import colors from 'colors';
import printManual from '../shared/printManual';
import ecsService from './ecs/index';
import sbusrService from './sbusr/index';
import taskService from './task/index';
import testAmazonOps from './test';

const service = process.argv[2];

switch (service) {

  case 'ecs':
    ecsService();
    break;

  case 'sbusr':
    sbusrService();
    break;

  case 'task':
    taskService();
    break;

  case 'test':
    testAmazonOps();
    break;

  case 'man':
    printManual();
    break;

  default:
    console.log('unknown command entered - read the manual by entering "man" 📚'.blue);
    break;

}