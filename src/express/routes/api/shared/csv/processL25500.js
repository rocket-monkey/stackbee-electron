import hash from 'object-hash';
import {
  objectEmpty,
  saveEntries,
} from './utils';
import CsvData from '../../../../../shared/db/schema/csvData';

const processLine = (newEntry, line, fieldDefs) => {
  let isInkSpecialCase = false;
  if (line[0].indexOf('Tinte') > -1) {
    isInkSpecialCase = true;
  }

  line.forEach((value, index) => {
    const fieldDef = isInkSpecialCase && index === 3 ? 'Verbrauchte Tinte ml' : fieldDefs[index];
    if (value && value !== ' ') {
      if (newEntry[fieldDef]) {
        if (typeof newEntry[fieldDef].push !== 'function') {
          newEntry[fieldDef] = [newEntry[fieldDef]];
          newEntry[fieldDef].push(value);
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

  for (let i = newEntry['Verbrauchte Tinte ml'].length - 1, len = 0; i >= len; i -= 1) {
    const inkUsedMl = newEntry['Verbrauchte Tinte ml'][i];
    let inkType = newEntry['Kostenart'].pop();
    if (inkType.indexOf('-') > -1) {
      inkType = inkType.split('-')[1].trim();
    }
    const inkValue = newEntry['Kostenwert'].pop();
    const costEntry = {
      inkUsedMl,
      inkType,
      inkValue,
    };

    if (inkType !== 'Sonstige') {
      costs.push(costEntry);
    }
  }

  // missing:
  // accountingId
  // taskType
  // copies

  const data = {
    documentName: newEntry['Dokument'],
    printDate: newEntry['Druckdatum'],
    printQuality: newEntry['Druckmodus'],
    paperType: newEntry['Druckmaterialsorte'],
    paperUsedM2: newEntry['Druckmaterialverbrauch Quadratmeter'],
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
      if (line[2]) {
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
      entries = saveEntries(entries);
    }

  } catch (e) {
    console.log('Error occured!', e);
    throw e;
  }

  return entries;
};
