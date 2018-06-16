import fs from 'fs'
import tableToCsv from 'node-table-to-csv'
import parse from 'csv-parse'
import {
  getConfigByType,
  getProcessByType,
  getCsvTypeByFileName
} from './csv/utils'

export const tryToParseFiles = (fileNames) => {
  return new Promise((resolve, reject) => {
    fileNames.forEach((fileName) => {
      try {
        const data = fs.readFileSync(fileName, 'utf-8')
        parseData(fileName, data)
      } catch (err) {
        reject(err)
      }
    })
  })
}

const parseData = (fileName, data) => {
  if (data.includes('<html>')) {
    // html file content detected!
    const csvData = tableToCsv(data);
    const csvType = getCsvTypeByFileName(fileName);

    parse(csvData, getConfigByType(csvType), (err, parsed) => {
      if (err) throw err

      console.log('parsed', parsed);

      const processFunction = getProcessByType(csvType)
      processFunction.apply(undefined, [parsed])
    })
  }
}
