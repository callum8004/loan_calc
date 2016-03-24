var React = require('react');
var ReactDOM = require('react-dom');

var Loan = React.createClass({
    render: function() {
      return (
        <tr>
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
            balance={loan.balance}
            interest_rate={loan.interest_rate}
            min_payment={loan.min_payment}
          ></Loan>
        )
      })
      return (
        <table className="table loan_table">
          <tbody>
            {loanNodes}
          </tbody>
        </table>
      )
    }
})

var CSVInput = React.createClass({
    render: function() {
      return (
        <div>
          <input type="textbox"/>
          <button className="btn">Add loans</button>
        </div>
      )
    }
})

var loans = [
  {balance: 100, interest_rate: 6.5, min_payment: 20}
]
ReactDOM.render(
  <LoanTable loans={loans}/>,
  document.getElementById('content')
)
