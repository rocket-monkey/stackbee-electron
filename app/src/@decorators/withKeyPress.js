import {
  compose,
  withState,
  withHandlers
} from 'recompose'
import config from '@config'

const withKeyPressCodeState = withState('keyPressedCode', 'setKeyPressedCode', null)
const withKeyPressTstampState = withState('keyPressedTstamp', 'setKeyPressedTstamp', null)

const extendWithHandlers = withHandlers({
  saveLastKeyDown: props => code => {
    props.setKeyPressedCode(code)
    props.setKeyPressedTstamp(new Date().getTime())
  },
  wasLastKeyCodeEqualTo: props => code => {
    if (!props.keyPressedTstamp) {
      return false
    }

    const timeDiff = new Date().getTime() - props.keyPressedTstamp
    if (timeDiff > config.doubleKeyPressTolerance) {
      return false
    }

    return code === props.keyPressedCode
  }
})

const withKeyPressHOC = Component => props => {
  return <Component {...props} saveLastKeyDown={saveLastKeyDown} wasLastKeyCodeEqualTo={wasLastKeyCodeEqualTo} />
}

export default WithKeyPress => compose(
  withKeyPressCodeState,
  withKeyPressTstampState,
  extendWithHandlers
)(WithKeyPress)
