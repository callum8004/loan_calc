var React = require('react')
var ReactDOM = require('react-dom')
var LocalStorageMixin = require('react-localstorage')
var _ = require('lodash')
var numeral = require('numeral')
var loanCalc = require('./loancalc')

var Loan = React.createClass({
  render: function() {
    return (
      <tr>
        <td>{this.props.name}</td>
        <td>{this.props.balance}</td>
        <td>{this.props.interest_rate}</td>
        <td>{this.props.min_payment}</td>
      </tr>
    )
  }
})

var LoanTable = React.createClass({
  render: function() {
    var loanNodes = this.props.loans.map(function(loan) {
      return (
        <Loan
          name={loan.name}
          balance={loan.balance}
          interest_rate={loan.interest_rate}
          min_payment={loan.min_payment}
        ></Loan>
      )
    })
    var totals = this.props.loans.reduce(function(sums, loan) {
      sums.balance += loan.balance
      sums.interest_rate += loan.interest_rate*loan.balance
      sums.min_payment += loan.min_payment
      return sums
    }, {balance: 0, interest_rate: 0, min_payment: 0})
    if(totals.balance) { totals.interest_rate /= totals.balance }
    return (
      <table className="table loan_table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Balance</th>
            <th>Interest Rate</th>
            <th>Minimum Payment</th>
          </tr>
        </thead>
        <tbody>
          {loanNodes}
          <tr>
            <th>Totals</th>
            <th>{numeral(totals.balance).format('$0,0.00')}</th>
            <th>{numeral(totals.interest_rate/100).format('0,0.00%')}</th>
            <th>{numeral(totals.min_payment).format('$0,0.00')}</th>
          </tr>
        </tbody>
      </table>
    )
  }
})

var CSVInput = React.createClass({
  handleCSVChange: function(e) {
    var lines = e.target.value.split("\n")
    var loans = []
    lines.forEach(function(line) {
      vals = line.split(',')
      loans.push({
        name: vals[0],
        balance: parseFloat(vals[1]),
        interest_rate: parseFloat(vals[2]),
        min_payment: parseFloat(vals[3]),
      })
    })

    this.props.onLoanData(loans)
  },
  render: function() {
    return (
      <textarea placeholder="Paste CSV data here" onChange={this.handleCSVChange}></textarea>
    )
  }
})

var PlanGenerator = React.createClass({
  getInitialState: function() {
    return {
      payment: this.props.loans.reduce(
        function(sum, cur) { return sum + cur.min_payment }, 0
      ),
    }
  },
  updatePayment: function(e) {
    this.setState({payment: e.target.value})
  },
  render: function() {
    var plan = loanCalc.calculatePayments(this.props.loans, this.state.payment)
    return (
      <div>
        <input type="text" value={this.state.payment} onChange={this.updatePayment}/>
        <p>It will take you <b>{plan.length}</b> periods to be paid off</p>
        <table className="table">
          <PlanHeaders loans={this.props.loans}/>
          <PlanRows plan={plan}/>
        </table>
      </div>
    )
  }
})

var PlanHeaders = React.createClass({
  render: function() {
    var loanNames = this.props.loans.map(function(loan) {
      return (
        <th>{loan.name}</th>
      )
    })
    return (
      <thead>
        <tr>
          <th>Month</th>
          {loanNames}
        </tr>
      </thead>
    )
  }
})

var PlanRows = React.createClass({
  render: function() {
    var loanPayments = this.props.plan.map(function(period) {
      var payments = period.loans.map(function(loan) {
        return (
          <td>
            {numeral(loan.payment).format('$0,0.00')}
              ->
            {numeral(loan.balance).format('$0,0.00')}
          </td>
        )
      })
      return (
        <tr>
          <th>{period.name}</th>
          {payments}
        </tr>
      )
    })
    return (
      <tbody>
        {loanPayments}
      </tbody>
    )
  }
})

var InputtableLoanList = React.createClass({
  mixins: [LocalStorageMixin],

  getInitialState: function() {
    return {
      loans: []
    }
  },
  componentDidMount: function() {
    var stored_state, parsed_state
    if(stored_state = localStorage.getItem("loan_state")) {
      if(parsed_state = JSON.parse(localStorage.getItem("loan_state"))) {
        this.setState(parsed_state)
      }
    }
  },
  setLoanData: function(loan_data) {
    this.setState({loans: loan_data})
  },
  render: function() {
    return (
      <div>
        <CSVInput onLoanData={this.setLoanData}/>
        <LoanTable loans={this.state.loans}/>
        <PlanGenerator loans={this.state.loans}/>
      </div>
    )
  }
})

ReactDOM.render(
  <InputtableLoanList/>,
  document.getElementById('content')
)
