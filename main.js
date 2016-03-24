var React = require('react');
var ReactDOM = require('react-dom');
var LocalStorageMixin = require('react-localstorage');

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
        balance: vals[1],
        interest_rate: vals[2],
        min_payment: vals[3],
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

var InputtableLoanList = React.createClass({
  mixins: [LocalStorageMixin],

  getInitialState: function() {
    return {
      loans: []
    }
  },
  componentDidMount: function() {
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
      </div>
    )
  }
})

ReactDOM.render(
  <InputtableLoanList/>,
  document.getElementById('content')
)
