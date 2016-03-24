var _ = require('lodash')

module.exports = {
  calculatePayments: function(loans, payment) {
    var loans = _.cloneDeep(loans)
    var period = 0;
    var periods = [];
    do {
      var regular_payment = parseFloat(payment)
      var new_payoffs
      var sanity=100
      var total_balance
      do {
        new_payoffs = false
        // Calculate our distribution of the payment
        var total_min = loans.reduce(function(sum, cur) {
          return sum + ((cur.balance > 0 && !cur.paid) ? cur.min_payment : 0)
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

      loans.forEach(function(loan) { loan.balance -= loan.cur_payment })

      periods.push({
        name: 'Period ' + period,
        loans: loans.map(function(loan) {
          return {
            payment: loan.cur_payment,
            balance: loan.balance
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
  }
}
