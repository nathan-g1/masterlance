"use strict";

module.exports = function (Wallet) {
  
  Wallet.topup = function (userId, amount, callback) {
    Wallet.findById(userId, (err, wallet) => {
      if (err) callback(err)
      else {
        if (wallet) {
          if (wallet.activeTopupTransaction) {
            const err = new Error('There is an active topup transaction pending...')
            callback(err)
          } else {
            Wallet.app.models.Transaction.initiateTransaction(
              'Wallet Topup',
              amount,
              'external (YenePay)',
              userId,
              "TOPUP",
              (err, transaction) => {
                if (err) callback(err)
                else {
                  wallet.activeTopupTransaction = transaction.id
                  wallet.transactionUrl = transaction.url
                  wallet.save((err, _) => {
                    if (err) callback(err)
                    else {
                      callback(null, transaction)
                    }
                  })
                }
              }
            )
          }
        } else callback(new Error('no wallet found'))
      }
    });
  }

  Wallet.cancelTransaction = function (userId, callback) {
    Wallet.findById(userId, (err, wallet) => {
      if (err) callback(err)
      else {
        if (wallet) {
          if (wallet.activeTopupTransaction) {
            Wallet.app.models.Transaction.findById(
              wallet.activeTopupTransaction,
              (err, transaction) => {
                if (err) {
                  callback(err)
                } else {
                  transaction.status = 'CANCELLED'
                  transaction.save((err, _) => {
                    if (err) {
                      callback(err)
                    } else {
                      wallet.activeTopupTransaction = null
                      wallet.transactionUrl = null
                      wallet.save((err, _) => {
                        if (err) callback(err)
                        else {
                          callback(null, transaction)
                        }
                      })  
                    }
                  })
                }
              }
            )
          } else {
            const err = new Error('no cancellable transaction found')
            callback(err)
          }
        } else callback(new Error('no wallet found'))
      }
    });
  }

  Wallet.fetchTransactions = function (userId, filters, callback) {
    Wallet.findById(userId, (err, wallet) => {
      if (err) callback(err)
      else {
        if (wallet) {
          Wallet.app.models.Transaction.find(
            {
              where: {
                or: [
                  {
                    from: userId
                  },
                  {
                    to: userId
                  }
                ]
              }
            }
          , (err, transactions) => {
            console.log(err, transactions)
            if (err) callback(err)
            else {
              callback(null, transactions)
            }
          })
        } else {
          const err = new Error('no wallet found')
          callback(err)
        }
      }
    })
  }

  Wallet.getBalance = async function (userId) {
    let wallet = await Wallet.findById(userId);
    if (wallet) {
      return wallet
    } else {
        const err = new Error(`No wallet has been found for user: ${userId}`)
        delete err.stack
        err.statusCode = 404
        throw err;
    }
  };
};
