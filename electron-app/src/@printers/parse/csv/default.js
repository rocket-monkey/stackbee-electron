import hash from 'object-hash'
import getValueOfField from '@helpers/getValueOfField'

const config = {
  delimiter: ',',
  comment: '#',
  relax_column_count: true
}

const detectNewLine = (line) => (
  line[2]
)

const processLine = (newEntry, line, fieldDefs) => {
  let isInkSpecialCase = false;
  if (line[0].indexOf('Tinte') > -1) {
    isInkSpecialCase = true;
  }

  line.forEach((value, index) => {
    const fieldDef = isInkSpecialCase && index === 3 ? 'Verbrauchte Tinte ml' : fieldDefs[index];
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

  for (let i = newEntry['Verbrauchte Tinte ml'].length - 1, len = 0; i >= len; i -= 1) {
    const inkUsedMl = newEntry['Verbrauchte Tinte ml'][i];
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
    paperUsedM2: getValueOfField(newEntry, 'Druckmaterialverbrauch%C2%A0Quadratmeter'),
    status: newEntry['Status'],
    copies: 1,
    taskType: 'Drucken',
    costs,
  };

  const objectHash = hash(data);
  data.hash = objectHash;

  return data
}

export default {
  config,
  detectNewLine,
  processLine,
  transformNewEntry
}