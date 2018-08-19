import CsvData from '../../../../../shared/db/schema/csvData'
import { resolve } from 'path';
import User from '../../../../../shared/db/schema/user'

const debug = false

const saveEntry = (entry) => {
  return new Promise((resolve, reject) => {
    entry.save((err, csvData) => {
      if (err) {
        if (err['name'] === 'ValidationError') {
          debug && console.error('Shit not working', err['errors'])
          return resolve({ error: entry.hash })
        }
        return resolve({ exists: true })
      }
      return resolve({ success: true })
    })
  })
}

export const saveCsvData = async (req, res, next) => {
  debug && console.log('decoded', req.decoded)

  // TODO: all with role "user" or "admin" must have access, and if users, only if they have the module "printers"
  if (req.decoded.email !== 'admin@stackbee.io') {
    return res.status(403).send({
      success: false,
      message: 'Only stackbee.io admin can access this route!'
    })
  }

  let saved = 0
  let exists = 0
  const failedEntries = []
  for (let i = 0, len = req.body.length; i < len; i++) {
    const data = req.body[i]

    const entry = new CsvData(data)

    const result = await saveEntry(entry)
    if (result.error) {
      failedEntries.push(result.error)
    }

    if (result.exists) {
      exists++
    }

    if (result.success) {
      saved++
    }

    if (i === req.body.length - 1) {
      res.json({
        received: req.body.length,
        exists,
        saved,
        failedEntries
      })
    }
  }
}

const getUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    User
      .find({ email })
      .limit(1)
      .exec((error, users) => {
        if (error || users.length === 0) {
          console.error('API getUserByEmail: could not find user!')
          return resolve(null)
        }

        resolve(users.pop())
      })
  })
}

export const getModules = async (req, res, next) => {
  if (!req.decoded.email) {
    return res.status(403).send({
      success: false,
      message: 'Only logged-in users can access this route!'
    })
  }

  const user = await getUserByEmail(req.decoded.email)
  res.json({
    modules: user.modules
  })
}