import { PureComponent } from 'react'
import classNames from 'class-names'
import { colors, spacings, fontSizes } from '@styles'

export default class FieldSet extends PureComponent {

  getTypeStr = () => 'FieldSet'

  render() {
    const { children, sideBySide } = this.props
    return (
      <fieldset className={classNames({ ['sideBySide']: sideBySide })}>
        {children}

        <style jsx>{`
          fieldset {
            border: 1px solid ${colors.whiteAlpha15};
            border-radius: ${spacings.radiusTiny};
          }

          .sideBySide {
            float: left;
          }
        `}</style>
      </fieldset>
    )
  }
}