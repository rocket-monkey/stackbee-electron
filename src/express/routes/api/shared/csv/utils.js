import CsvData from '../../../../../shared/db/schema/csvData';
import processDefault from './processDefault';

const debug = false;

export const getProcessByType = (csvType) => {
  switch (csvType) {
    case 'default':
    default:
      return processDefault;
  }
}

export const saveEntries = (entries) => {
  if (entries.length > 0) {
    const entry = entries.shift();

    CsvData
      .find({ hash: entry.hash })
      .exec((error, datas) => {
        if (datas.length > 0) {
          return debug && console.log('Entry already exists!', entry.hash);
        }

        entry.save((err, csvData) => {
          if (err) throw err;
          saveEntries(entries);
        });
      });
  }

  return entries;
};