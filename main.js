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
      payment: 0,
    }
  },
  updatePayment: function(e) {
    this.setState({payment: e.target.value})
  },
  render: function() {
    return (
      <div>
        <input type="text" value={this.state.payment} onChange={this.updatePayment}/>
        <table>
          <PlanHeaders loans={this.props.loans}/>
          <PlanRows loans={this.props.loans} payment={this.state.payment}/>
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
  calculatePayments: function(loans, payment) {
    var period = 0;
    var periods = [];
    do {
      var regular_payment = parseFloat(payment)
      var new_payoffs
      var sanity=100
      var total_balance
      do {
        // Calculate our distribution of the payment
        var total_min = loans.reduce(function(sum, cur) {
          return sum + ((cur.balance > 0 && !cur.paid) ? 0 : cur.min_payment)
        }, 0)
        loans.forEach(function(loan) {
          if(loan.balance) {
            loan.cur_payment = (loan.min_payment/total_min)*regular_payment
            if(loan.balance <= loan.cur_payment) {
              loan.cur_payment = loan.balance
              loan.paid = true
              new_payoffs = true
            }
          } else {
            loan.cur_payment = null
            loan.paid = true
          }
        })

        regular_payment = payment - loans.reduce(function(sum, cur) {
          return sum + (cur.paid ? cur.balance : 0)
        }, 0)
        sanity--
      } while(new_payoffs && sanity)

      periods.push({
        name: 'Period ' + period,
        loans: loans.map(function(loan) {
          return {
            payment: loan.cur_payment,
            balance: loan.balance - loan.cur_payment
          }
        })
      })

      total_balance = 0
      loans.forEach(function(loan) {
        loan.balance*=(1+loan.interest_rate/12/100)
        total_balance += loan.balance
      })

      period++
    } while(total_balance > 0 && period < 100)

    return periods
  },
  render: function() {
    var loanPayments = this.calculatePayments(this.props.loans, this.props.payment).map(function(period) {
      var payments = period.loans.map(function(loan) {
        return (
          <td>{loan.payment}/{loan.balance}</td>
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
