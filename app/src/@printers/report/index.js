import { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import classNames from 'class-names'
import config from '@config'
import H2Icon from '@core/h2Icon'
import Alert from '@core/alert'
import Grid from '@core/grid'
import WithFetch from '@decorators/withFetch'
import ReportWizard from './reportWizard'
import IconBookDetailInfoNotebookRead from '@icons/IconBookDetailInfoNotebookRead'
import { colors, spacings, fontSizes, zIndexes } from '@styles'

const PER_PAGE = config.entriesPerPage

class PrintersReport extends Component {
  state = {
    filter: {},
    createReportActive: false
  }

  render() {
    const { loading, error, data } = this.props

    const hasError = (data && data !== false && !data.docs) || error

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
              { cls: 'wide', head: 'name', name: 'documentName', focus: true },
              { cls: 'base', head: 'date', name: 'printDate', type: 'Date' },
              { cls: 'small', head: 'status', name: 'status' },
              { cls: 'small', head: 'paper type', name: 'paperType' },
              { cls: 'small', head: 'paper m2', name: 'paperUsedM2' },
              { cls: 'small', head: 'copies', name: 'copies', type: 'Number' },
            ]}
            data={data}
            perPage={PER_PAGE}
            setPage={this.props.setPage}
            setSort={this.props.setSort}
            loading={loading}
            offsetBottom={this.state.createReportActive ? 150 : 0}
          />
        }

        {hasError && <Alert type="error"><FormattedMessage id='@app.error' defaultMessage='Error ocurred!' /></Alert>}

        <ReportWizard
          setReportState={this.setState.bind(this)}
          active={this.state.createReportActive}
          setActive={() => {
            this.setState({  createReportActive: true })
          }}
        />

        <style jsx>{`
          div {
            position: relative;
          }
        `}</style>
      </div>
    )
  }
}

export default WithFetch(({ page, sort }) => {
  const sortStr = sort && JSON.stringify(sort) || 'null'
  return {
    endpoint: `/csvdata?page=${page}&perPage=${PER_PAGE}&sort=${sortStr}`
  }
})(PrintersReport)
