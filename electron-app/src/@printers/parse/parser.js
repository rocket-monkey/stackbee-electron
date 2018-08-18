import fs from 'fs'
import tableToCsv from 'node-table-to-csv'
import parse from 'csv-parse'
import StackbeeAPI from '@api'
import objectEmpty from '@helpers/objectEmpty'
import { getConfigByFieldDefs, detectNewLine, processLine, transformNewEntry } from '@printers/parse/csv'

const debug = true

const isDev = require('electron-is-dev')
let api = null

const CSV_CONFIG_DEFAULT = {
  delimiter: ',',
  comment: '#',
  relax_column_count: true
}

const process = async (parsed, appState) => {
  if (!api) {
    api = new StackbeeAPI(isDev, appState)
  }

  return new Promise((resolve, reject) => {
    const fieldDefs = parsed.shift()
    isDev && console.info('fieldDefs:', fieldDefs.length, fieldDefs)

    const { type, csvCfg } = getConfigByFieldDefs(fieldDefs)

    if (!csvCfg) {
      return reject('No csv config found for file!')
    }


    let entries = []
    let newEntry = {}

    parsed.forEach((line) => {
      if (detectNewLine(line, csvCfg.fileStructure)) {
        if (!objectEmpty(newEntry)) {

          // save new entry array
          entries.push(transformNewEntry(newEntry, csvCfg.fileStructure))

          // reset object
          newEntry = {}
        }
      }

      newEntry = processLine(newEntry, line, fieldDefs, csvCfg.fileStructure)
    })

    api
      .post('/csvdata', entries)
      .then(res => res.json && res.json() || res)
      .then(json => resolve({ processed: entries.length, success: json.received === entries.length }))
  })
}

export const analyzeFile = (fileName, data) => {
  let valid = false
  let csvCfg = null
  if (data.includes('<html>')) { // html file content detected!
    valid = true
  }

  return { valid }
}

export const parseData = (fileName, data, appState) => {
  return new Promise((resolve, reject) => {
    if (data.includes('<html>')) { // html file content detected!
      const csvData = tableToCsv(data)

      parse(csvData, CSV_CONFIG_DEFAULT, async (err, parsed) => {
        if (err) return reject(err)

        debug && console.info('Parser: parsed file content:', parsed)

        const result = await process(parsed, appState)
        resolve(result)
      })
    } else {
      reject('Unsupported file given!')
    }
  })
}
