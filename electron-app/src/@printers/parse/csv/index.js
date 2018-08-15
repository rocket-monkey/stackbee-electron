import { default as configDefault } from './default'
import { default as configT7100 } from './t7100'

export const getCsvConfig = (fileName, data) => {
  let csvType = 'none'
  if (fileName.includes('L25500')) {
    csvType = 'default'
  } else if (fileName.includes('Z6100')) {
    csvType = 'Z6100'
  }

  switch (csvType) {
    case 'default':
      return configDefault
    case 'Z6100':
      return configT7100
  }
}