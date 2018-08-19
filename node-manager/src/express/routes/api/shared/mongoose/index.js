import CsvData from '../../../../../shared/db/schema/csvData'
import { resolve } from 'path';
import User from '../../../../../shared/db/schema/user'

const debug = true

const saveEntry = (entry) => {
  return new Promise((resolve, reject) => {
    entry.save((err, csvData) => {
      if (err) {
        if (err['name'] === 'ValidationError') {
          debug && console.error('🐝🐝🐝🐝🐝🐝🐝🐝🐝🐝🐝', err['errors'])
          debug && console.error('ValidationError:', err['errors'])
          debug && console.error('🐝🐝🐝🐝🐝🐝🐝🐝🐝🐝🐝', err['errors'])
          return resolve({ error: entry.hash })
        }
        debug && console.error('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨', err['errors'])
        debug && console.error('ERROR:', err)
        debug && console.error('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨', err['errors'])
        return resolve({ exists: true })
      }
      return resolve({ success: true })
    })
  })
}

export const getCsvData = async (req, res, next) => {
  // TODO: all with role "user" or "admin" must have access, and if users, only if they have the module "printers"
  if (!req.decoded.email) {
    return res.status(403).send({
      success: false,
      message: 'Only logged-in users can access this route!'
    })
  }

  const user = await getUserByEmail(req.decoded.email)

  const perPage = parseInt(req.query.perPage, 10) || 50
  const page = parseInt(req.query.page, 10) || 0
  const sortStr = req.query.sort
  const sort = sortStr && JSON.parse(sortStr) || { printDate: 'desc' }

  CsvData
    .find({ userRef: user._id })
    .limit(perPage)
    .skip(perPage * page)
    .sort(sort)
    .exec((error, docs) => {
      if (error) {
        res.json({
          docs: [],
          total: 0
        })
        return console.error(error)
      }

      CsvData.count().exec((err, count) => {
        res.json({
          docs,
          page,
          sort,
          count,
          pages: count / perPage
        })
      })
    })
}

export const saveCsvData = async (req, res, next) => {
  debug && console.log('decoded', req.decoded)

  // TODO: all with role "user" or "admin" must have access, and if users, only if they have the module "printers"
  if (!req.decoded.email) {
    return res.status(403).send({
      success: false,
      message: 'Only logged-in users can access this route!'
    })
  }

  const user = await getUserByEmail(req.decoded.email)

  let saved = 0
  let exists = 0
  const failedEntries = []
  for (let i = 0, len = req.body.length; i < len; i++) {
    const data = req.body[i]

    data.userRef = user._id
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