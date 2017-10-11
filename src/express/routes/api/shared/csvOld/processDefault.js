import hash from 'object-hash';
import {
  objectEmpty,
  saveData,
} from './utils';
import CsvData from '../../../../../shared/db/schema/csvData';

const processLine = (newEntry, line, fieldDefs) => {
  line.forEach((value, index) => {
    const fieldDef = fieldDefs[index];
    if (value && value !== ' ') {
      if (newEntry[fieldDef]) {
        if (typeof newEntry[fieldDef].push !== 'function') {
          newEntry[fieldDef] = [newEntry[fieldDef]];
        } else {
          newEntry[fieldDef].push(value);
        }
      } else {
        newEntry[fieldDef] = value;
      }
    }
  });

  return newEntry;
};

const transformNewEntry = (newEntry) => {
  const costs = [];

  for (let i = newEntry['Verbrauchte Tinte ml'].length - 1, len = 0; i >= len; i -= 1) {
    const inkUsedMl = newEntry['Verbrauchte Tinte ml'][i];
    const inkType = newEntry['Kostenart'].pop().replace(/Tinte - /i, '');
    const inkValue = newEntry['Kostenwert'].pop();
    const costEntry = {
      inkUsedMl,
      inkType,
      inkValue,
    };
    costs.push(costEntry);
  }

  const data = {
    accountingId: newEntry['Abrechnungs-ID'],
    taskType: newEntry['Auftragstyp'],
    documentName: newEntry['Dokument'],
    printDate: newEntry['Druckdatum'],
    printQuality: newEntry['Druckqualität'],
    copies: parseInt(newEntry['Exemplare'], 10),
    paperType: newEntry['Papiersorte'],
    paperUsedM2: newEntry['Papierverbrauch Quadratmeter'],
    status: newEntry['Status'],
    costs,
  };

  const objectHash = hash(data);
  data.hash = objectHash;

  const newCsvData = new CsvData(data);

  return newCsvData;
}

export default (parsed) => {
  const fieldDefs = parsed.shift();
  let entries = [];
  let newEntry = {};

  try {

    parsed.forEach((line) => {
      if (line[0] && line[0] !== ' ') {
        if (!objectEmpty(newEntry)) {
          // save new entry to return array
          entries.push(transformNewEntry(newEntry));

          // reset object
          newEntry = {};
        }
      }

      newEntry = processLine(newEntry, line, fieldDefs);
    });

    while (entries.length > 0) {
      entries = saveData(entries);
    }

  } catch (e) {
    console.log('Error occured!', e);
    throw e;
  }

  return entries;
};
