import processDefault from './processDefault';

const typeDefaultConfig = {
  delimiter: ',',
  comment: '#',
};

export const getConfigByType = (csvType) => {
  switch (csvType) {
    case 'default':
    default:
      return typeDefaultConfig;
  }
}

export const getProcessByType = (csvType) => {
  switch (csvType) {
    case 'default':
    default:
      return processDefault;
  }
}

export const objectEmpty = (object) => {
  let count = 0;
  let key = null;
  for (key in object) {
    if (object.hasOwnProperty(key)) {
      count += 1;
    }
  }

  return count === 0;
};
