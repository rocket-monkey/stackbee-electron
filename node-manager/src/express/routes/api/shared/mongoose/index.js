import CsvData from '../../../../../shared/db/schema/csvData'
import User from '../../../../../shared/db/schema/user'

const debug = false

export const saveCsvData = (req, res, next) => {
  console.log('wtf', req.decoded)
  // TODO: all with role "user" or "admin" must have access, and if users, only if they have the module "printers"
  if (req.decoded.email !== 'admin@stackbee.io') {
    return res.status(403).send({
      success: false,
      message: 'Only stackbee.io admin can access this route!'
    })
  }

  let saved = 0
  let exists = 0
  req.body.forEach(async (data, index) => {
    const entry = new CsvData(data)

    CsvData
      .find({ hash: entry.hash })
      .exec((err, docs) => {
        if (err) throw err

        if (docs.length > 0) {
          debug && console.log('Entry already exists!', entry.hash)
        } else {
          entry.save((err, csvData) => {
            if (err) throw err
          })
        }
      })

    if (index === req.body.length - 1) {
      res.json({
        received: req.body.length
      })
    }
  })
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