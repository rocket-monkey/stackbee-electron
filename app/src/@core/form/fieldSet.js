import { PureComponent } from 'react'

export default class FieldSet extends PureComponent {

  getTypeStr = () => 'FieldSet'

  render() {
    const { children } = this.props
    return (
      <fieldset>
        {children}
      </fieldset>
    )
  }
}