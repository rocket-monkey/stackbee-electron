import fs from 'fs'
import tableToCsv from 'node-table-to-csv'
import parse from 'csv-parse'
import StackbeeAPI from '@api'
import objectEmpty from '@helpers/objectEmpty'
import { getCsvConfig } from '@printers/parse/csv'

const debug = true

const isDev = require('electron-is-dev')
const api = new StackbeeAPI(isDev)

const process = async (parsed, csvCfg) => {
  return new Promise((resolve, reject) => {
    const fieldDefs = parsed.shift()
    let entries = []
    let newEntry = {}

    try {

      parsed.forEach((line) => {
        if (csvCfg.detectNewLine(line)) {
          if (!objectEmpty(newEntry)) {

            // save new entry array
            entries.push(csvCfg.transformNewEntry(newEntry))

            // reset object
            newEntry = {}
          }
        }

        newEntry = csvCfg.processLine(newEntry, line, fieldDefs)
      })

      api
        .post('/csvdata', entries)
        .then(res => res.json())
        .then(json => resolve({ processed: entries.length, success: json.received === entries.length }))

    } catch (e) {
      console.error('Parser: error ocurred!', e)
      resolve(null)
    }
  })
}

export const analyzeFile = (fileName, data) => {
  let valid = false
  let csvCfg = null
  if (data.includes('<html>')) { // html file content detected!
    csvCfg = getCsvConfig(fileName, data)
    if (csvCfg) {
      valid = true
    }
  }

  return {
    valid,
    csvCfg
  }
}

export const parseData = (fileName, data) => {
  return new Promise((resolve, reject) => {
    if (data.includes('<html>')) { // html file content detected!
      const csvData = tableToCsv(data)
      const csvCfg = getCsvConfig(fileName, data)

      if (!csvCfg) {
        return reject('No csv config found for file!')
      }

      parse(csvData, csvCfg.config, async (err, parsed) => {
        if (err) return reject(err)

        debug && console.info('Parser: parsed file content:', parsed)

        const result = await process(parsed, csvCfg)
        resolve(result)
      })
    } else {
      reject('Unsupported file given!')
    }
  })
}
