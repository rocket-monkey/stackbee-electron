import CsvData from '../../../../../shared/db/schema/csvData';
import processDefault from './processDefault';
import processL25500 from './processL25500';

const debug = false;

const typeDefaultConfig = {
  delimiter: ',',
  comment: '#',
  relax_column_count: true,
};

export const getConfigByType = (csvType) => {
  switch (csvType) {
    case 'default':
    case 'L25500':
    default:
      return typeDefaultConfig;
  }
}

export const getProcessByType = (csvType) => {
  switch (csvType) {
    case 'L25500':
      return processL25500;
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
}

export const saveEntries = (entries, callback) => {
  if (entries.length > 0) {
    const entry = entries.shift();

    CsvData
      .find({ hash: entry.hash })
      .exec((error, datas) => {
        if (datas.length > 0) {
          debug && console.log('Entry already exists!', entry.hash);
          return saveEntries(entries);
        }

        entry.save((err, csvData) => {
          if (err) throw err;
          saveEntries(entries);
        });
      });
  } else {
    callback();
  }
};