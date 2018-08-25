import hash from 'object-hash'
import getValueOfField from '@helpers/getValueOfField'

const CSV_CONFIG_DEFAULT = {
  delimiter: ',',
  comment: '#',
  relax_column_count: true
}

const CONFIGS = {
  L25500: {
    csvConfig: CSV_CONFIG_DEFAULT,
    fileStructure: {
      headerLength: 11,
      header: ["Kostenart", "Kostenwert", "Dokument", "Status", "Druckmaterialsorte", ["Druckmaterialverbrauch", "Quadratmeter"], ["Verbrauchte", "Tinte"], "Benutzername", "Druckdatum", "Druckmodus", ["Versatzverz", "zw"]],
      spreading: [0, 0, 0, 3, 3, 3, 3],
      costFields: ['Kostenart', 'Kostenwert']
    }
  },
  T2300: {
    csvConfig: CSV_CONFIG_DEFAULT,
    fileStructure: {
      headerLength: 16,
      header: ["Dokument", "Auftragstyp", "Auftragsquelle", "Status", "Exemplare", "Kostenart", "Kostenwert", "Papiersorte", ["Papierverbrauch", "Quadratmeter"], ["Verbrauchte", "Tinte"], ["Kategorie", "Farbdeckungsgrad"], "Benutzername", "Druckdatum", "Druckqualit", "Abrechnungs-ID", ["Gescannter", "Bereich"]],
      spreading: [0, 3, 3, 3, 3, 3, 3, 3],
      costFields: ['Exemplare', 'Kostenart']
    }
  },
  T7100: {
    csvConfig: CSV_CONFIG_DEFAULT,
    fileStructure: {
      headerLength: 14,
      header: ["Dokument", "Auftragstyp", "Status", "Exemplare", "Kostenart", "Kostenwert", "Papiersorte", "Papierverbrauch Quadratmeter", "Verbrauchte Tinte ml", "Kategorie Farbdeckungsgrad", "Benutzername", "Druckdatum", "Druckqualität", "Abrechnungs-ID"],
      spreading: [0, 3, 3, 3, 3, 3, 3, 3],
      costFields: ['Kostenart', 'Kostenwert']
    }
  },
  Z3200: {
    csvConfig: CSV_CONFIG_DEFAULT,
    fileStructure: {
      headerLength: 13,
      header: ["Kostenart", "Kostenwert", "Dokument", "Status", "Exemplare", "Papiersorte", ["Papierverbrauch", "Quadratmeter"], ["Verbrauchte", "Tinte"], ["Kategorie", "Farbdeckungsgrad"], "Benutzername", "Druckdatum", "Druckqualit", "Abrechnungs-ID"],
      spreading: [0, 0, 0, 4, 4],
      costFields: ['Kostenart', 'Kostenwert']
    }
  },
  Z6100: {
    csvConfig: CSV_CONFIG_DEFAULT,
    fileStructure: {
      headerLength: 13,
      header: ["Kostenart", "Kostenwert", "Dokument", "Status", "Exemplare", "Papiersorte", ["Papierverbrauch", "Quadratmeter"], ["Verbrauchte", "Tinte"], ["Kategorie", "Farbdeckungsgrad"], "Benutzername", "Druckdatum", "Abrechnungs-ID", "Druckqualit"],
      spreading: [0, 0, 0, 4, 4],
      costFields: ['Kostenart', 'Kostenwert']
    }
  }
}

export const getConfigByFieldDefs = (fieldDefs) => {
  let type = null
  let csvCfg = null
  Object.keys(CONFIGS).forEach(key => {
    let allHeaderFieldsAreMatching = true
    fieldDefs.forEach((def, index) => {
      const headerDef = CONFIGS[key].fileStructure.header[index]
      if (Array.isArray(headerDef)) {
        if (def.indexOf(headerDef[0]) === -1 && def.indexOf(headerDef[1]) === -1) {
          // fieldDef field is NOT matching with fileStructure.header definition
          allHeaderFieldsAreMatching = false
        }
      } else {
        if (def.indexOf(headerDef) === -1) {
          // fieldDef field is NOT matching with fileStructure.header definition
          allHeaderFieldsAreMatching = false
        }
      }
    })
    if (!type && allHeaderFieldsAreMatching) {
      type = key
      csvCfg = CONFIGS[key]
    }
  })

  return { type, csvCfg }
}

export const detectNewLine = (line, fileStructure) => line.length === fileStructure.headerLength

export const processLine = (newEntry, line, fieldDefs, fileStructure) => {
  const isFullLine = line.length === fileStructure.headerLength

  line.forEach((value, index) => {
    const fieldDef = isFullLine ? fieldDefs[index] : fieldDefs[index + fileStructure.spreading[index]]
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
}

export const transformNewEntry = (newEntry, fileStructure) => {
  const costs = []

  const inkUsedArr = getValueOfField(newEntry, ['Verbrauchte', 'Tinte'])
  for (let i = inkUsedArr.length - 1, len = 0; i >= len; i -= 1) {
    const inkUsedMl = inkUsedArr[i]
    const inkTypes = newEntry[fileStructure.costFields[0]]
    if (Array.isArray(inkTypes)) { // no costs - probably a scan, not a print
      let inkType = inkTypes.pop()
      if (inkType.indexOf('-') > -1) {
        inkType = inkType.split('-')[1].trim()
      }
      const inkValue = newEntry[fileStructure.costFields[1]].pop()
      const costEntry = {
        inkUsedMl,
        inkType,
        inkValue,
      }

      if (
        inkType !== 'Medium' &&
        inkType !== 'Sonstige'
      ) {
        costs.push(costEntry);
      }
    }
  }

  const data = { costs }
  Object.keys(newEntry).forEach(key => {
    if (key === 'Abrechnungs-ID') {
      data.accountingId = newEntry[key]
    } else if (key === 'Auftragstyp') {
      data.taskType = newEntry[key]
    } else if (key === 'Dokument') {
      data.documentName = newEntry[key]
    } else if (key === 'Druckdatum') {
      data.printDate = newEntry[key]
    } else if (key.indexOf('Druckqualit') > -1) {
      data.printQuality = newEntry[key]
    } else if (key === 'Exemplare') {
      if (Array.isArray(newEntry[key])) {
        data.copies = parseInt(newEntry[key].shift(), 10)
      } else {
        data.copies = parseInt(newEntry[key], 10)
      }
    } else if (key === 'Papiersorte') {
      data.paperType = newEntry[key]
    } else if (key.indexOf('Papierverbrauch') > -1 && key.indexOf('Quadratmeter') > -1) {
      data.paperUsedM2 = newEntry[key]
    } else if (key === 'Status') {
      data.status = newEntry[key]
    }
  })

  // TODO: add, printer-type, stackbee-user-ref, more meta data from file-name-pattern like customer-id, project-id, whatever

  const objectHash = hash(data)
  data.hash = objectHash

  return data
}
