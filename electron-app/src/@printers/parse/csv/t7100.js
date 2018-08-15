import hash from 'object-hash'
import getValueOfField from '@helpers/getValueOfField'

const config = {
  delimiter: ',',
  comment: '#',
  relax_column_count: true
}

const detectNewLine = (line) => (
  line[0] && line[0] !== ' '
)

const processLine = (newEntry, line, fieldDefs) => {
  line.forEach((value, index) => {
    const fieldDef = fieldDefs[index]
    if (value && value !== ' ') {
      if (newEntry[fieldDef]) {
        if (typeof newEntry[fieldDef].push !== 'function') {
          newEntry[fieldDef] = [newEntry[fieldDef]]
          newEntry[fieldDef].push(value)
        } else {
          newEntry[fieldDef].push(value)
        }
      } else {
        newEntry[fieldDef] = value
      }
    }
  })

  return newEntry
};

const transformNewEntry = (newEntry) => {
  const costs = []

  for (let i = newEntry['Verbrauchte Tinte ml'].length - 1, len = 0; i >= len; i -= 1) {
    const inkUsedMl = newEntry['Verbrauchte Tinte ml'][i]
    let inkType = newEntry['Kostenart'].pop()
    if (inkType.indexOf('-') > -1) {
      inkType = inkType.split('-')[1].trim()
    }
    const inkValue = newEntry['Kostenwert'].pop()
    const costEntry = {
      inkUsedMl,
      inkType,
      inkValue,
    };
    costs.push(costEntry)
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
  }

  const objectHash = hash(data)
  data.hash = objectHash

  return data
}

export default {
  config,
  detectNewLine,
  processLine,
  transformNewEntry
}