import CsvData from '../../../../../shared/db/schema/csvData'

const debug = false

export const saveCsvData = (req, res, next) => {
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
