import CsvData from '../../../../../shared/db/schema/csvData';
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

export const saveData = (entries) => {
  if (entries.length > 0) {
    const entry = entries.shift();

    CsvData
      .find({ hash: entry.hash })
      .exec((error, datas) => {
        if (datas.length > 0) {
          return console.log('Entry already exists!', entry.hash);
        }

        entry.save((err, csvData) => {
          if (err) throw err;
          saveData(entries);
        });
      });
  }

  return entries;
};
