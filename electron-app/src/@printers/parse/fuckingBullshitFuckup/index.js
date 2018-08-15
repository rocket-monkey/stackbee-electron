import tableToCsv from 'node-table-to-csv'
import parse from 'csv-parse'
import objectEmpty from '@helpers/objectEmpty'

const debug = false

const typeDefaultConfig = {
  delimiter: ',',
  comment: '#',
  relax_column_count: true
}

const getCsvTypeByFileName = (fileName) => {
  if (fileName.includes('L25500')) {
    return 'default'
  }

  return 'woot'
}

const getConfigByType = (csvType) => {
  switch (csvType) {
    case 'default':
    default:
      return typeDefaultConfig;
  }
}

const detectNewLine = (csvType, line) => {
  switch (csvType) {
    case 'woot':
      return line[0] && line[0] !== ' '

    case 'default':
    default:
      return line[2]
  }
}

const getTransformerByType = (csvType) => {
  switch (csvType) {
    case 'woot':
      return require('./transformWoot').transform

    case 'default':
    default:
      return require('./transformDefault').transform
  }
}

const getProcessByType = (csvType) => {
  switch (csvType) {
    case 'woot':
      return require('./transformWoot').process

    case 'default':
    default:
      return require('./transformDefault').process
  }
}

const wtf = (csvType, parsed) => {
  const fieldDefs = parsed.shift()
  let entries = []
  let newEntry = {}

  try {

    const transformer = getTransformerByType(csvType)

    parsed.forEach((line) => {
      if (detectNewLine(line, csvType)) {
        if (!objectEmpty(newEntry)) {
          // save new entry to return array

          transformer.transform.apply(undefined, [newEntry])

          // reset object
          newEntry = {}
        }
      }

      newEntry = transformer.process.apply(undefined, [newEntry, line, fieldDefs])
    });

    const entriesCount = entries.length
    // saveEntries(entries, () => {
    //   debug && console.log(`${entriesCount} entries saved!`)
    // })

  } catch (e) {
    console.log('Error occured!', e)
    throw e
  }

  return entries
}

export const parseCsv = (fileName, fileData) => {
  return new Promise((resolve, reject) => {
    if (fileData.includes('<html>')) {
      // html file content detected!
      const csvData = tableToCsv(fileData)
      const csvType = getCsvTypeByFileName(fileName)

      parse(csvData, getConfigByType(csvType), (err, parsed) => {
        if (err) throw err

        debug && console.info('CsvParser: parsed file content:', parsed)

        const processCsv = getProcessByType(csvType)
        processCsv(csvType, parsed)
      })
    }
  })
}
