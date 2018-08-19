import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import IconBookDetailInfoNotebookRead from '@icons/IconBookDetailInfoNotebookRead'
import H2Icon from '@core/h2Icon'
import Alert from '@core/alert'
import Grid from '@core/grid'
import WithFetch from '@decorators/withFetch'
import { colors, spacings, fontSizes, zIndexes } from '@styles'

const PER_PAGE = 42

class PrintersReport extends Component {
  render() {
    const { loading, error, data } = this.props

    const hasError = (data && !data.docs) || error

    return (
      <div>
        <h2>
          <FormattedMessage id='@app.modules.printers.report' defaultMessage='Printer reports' />
          <H2Icon><IconBookDetailInfoNotebookRead /></H2Icon>
        </h2>

        {
          !hasError &&
          <Grid
            fields={[
              { cls: 'base', head: 'name', name: 'documentName', focus: true },
              { cls: 'base', head: 'date', name: 'printDate', type: 'Date' },
              { cls: 'small', head: 'status', name: 'status' },
            ]}
            data={data}
            perPage={PER_PAGE}
            setPage={this.props.setPage}
            loading={loading}
          />
        }

        {hasError && <Alert type="error"><FormattedMessage id='@app.error' defaultMessage='Error ocurred!' /></Alert>}

        <style jsx>{`
          div {
            position: relative;
          }
        `}</style>
      </div>
    )
  }
}

export default WithFetch((props) => (
  {
    endpoint: `/csvdata?page=${props.page}&perPage=${PER_PAGE}`
  }
))(PrintersReport)
