const ypco = require("yenepaysdk");

const sellerCode = process.env.SELLER_CODE || "";
const successUrlReturn = `${process.env.FRONTEND_URL}/payments/success`; // "YOUR_SUCCESS_URL`
const ipnUrlReturn = "http://localhost:3000/payments/Transactions/ipn"; // "YOUR_IPN_URL",
const cancelUrlReturn = "http://localhost:3003/api/Transactions/cancel"; // "YOUR_CANCEL_URL"
const failureUrlReturn = "http://localhost:3003/api/Transactions/failure"; // "YOUR_FAILURE_URL",

const pdtToken = process.env.PDT_TOKEN || "";
const useSandbox = true;

module.exports = function (Transaction) {
  Transaction.initiateTransaction = function (
    reason,
    amount,
    from,
    to,
    type,
    callback
  ) {
    Transaction.create(
      {
        dateTime: Date.now(),
        reason: reason,
        amount: amount,
        from: from,
        to: to,
        status: "PENDING",
        type: type
      },
      (err, transaction) => {
        if (err) {
          callback(err);
        } else {
          const expiresAfter = null; //"NUMBER_OF_MINUTES_BEFORE_THE_ORDER_EXPIRES"; //setting null means it never expires
          const checkoutOptions = ypco.checkoutOptions(
            sellerCode,
            transaction.id.toString(),
            ypco.checkoutType.Express,
            useSandbox,
            expiresAfter,
            successUrlReturn,
            cancelUrlReturn,
            ipnUrlReturn,
            failureUrlReturn
          );
          const url = ypco.checkout.GetCheckoutUrlForExpress(checkoutOptions, {
            ItemName: reason,
            UnitPrice: amount.toString(),
            DeliveryFee: "0",
            Discount: "0",
            Tax1: "0",
            Tax2: "0",
            HandlingFee: "0",
            Quantity: "1",
          });

          transaction.updateAttribute('url', url, (err, data) => {
            if (err) callback(err)
            else callback(null, data)
          })
          // callback(null, {
          //   ...transaction.toJSON(),
          //   url,
          // });
        }
      }
    );
    // const merchantOrderId = '12-34'; //"YOUR_UNIQUE_ID_FOR_THIS_ORDER";  //can also be set null
    // const expiresAfter = 2880; //"NUMBER_OF_MINUTES_BEFORE_THE_ORDER_EXPIRES"; //setting null means it never expires
    // const checkoutOptions = ypco.checkoutOptions(sellerCode, merchantOrderId, ypco.checkoutType.Express, useSandbox, expiresAfter, successUrlReturn, cancelUrlReturn, ipnUrlReturn, failureUrlReturn);
    // const checkoutItem = req.body;
    // const url = ypco.checkout.GetCheckoutUrlForExpress(checkoutOptions, checkoutItem);
  };

  Transaction.createJobPostingTransaction = function (
    amount,
    from,
    jobId,
    callback
  ) {
    Transaction.create(
      {
        dateTime: Date.now(),
        reason: 'Job posted',
        amount: amount,
        from: from,
        jobId: jobId,
        to: 'system',
        status: "COMPLETE",
        type: 'JOB_POSTED'
      },
      (err, transaction) => {
        if (err) callback(err)
        else {
          Transaction.app.models.Wallet.findById(from, (err, wallet) => {
            if (err) {
              callback(err)
            } else {
              wallet.activeBalance -= Number(amount)
              wallet.save((err, _) => {
                if (err) callback(err)
                else callback(null, transaction)
              })
            }
          })                
        }
      }
    );
  };

  Transaction.verifyTransaction = function (
    params,
    callback
  ) {
    var pdtRequestModel = new ypco.pdtRequestModel(pdtToken, params.TransactionId, params.MerchantOrderId, useSandbox);

    ypco.checkout.RequestPDT(pdtRequestModel).then((pdtJson) => {
      if(pdtJson.result === 'SUCCESS') {
        if (pdtJson.Status === 'Paid') {
          // console.log("success url called - Paid");
          // console.log(pdtJson)
          Transaction.findById(pdtJson.MerchantOrderId, (err, transaction) => {
            if (err) {
              callback(err)
            } else {
              if (transaction.status === "COMPLETE") {
                const err = new Error('Transaction has already been completed')
                callback(err)
              } else {
                transaction.status = "COMPLETE"

                transaction.save((err, _) => {
                  if (err) {
                    callback(err)
                  } else {
                    if (transaction.type === "TOPUP") {
                      Transaction.app.models.Wallet.findById(transaction.to, (err, wallet) => {
                        if (err) {
                          callback(err)
                        } else {
                          wallet.activeTopupTransaction = null
                          wallet.transactionUrl = null
                          wallet.activeBalance += Number(pdtJson.TotalAmount)
                          wallet.save((err, _) => {
                            if (err) callback(err)
                            else callback(null, transaction)
                          })
                        }
                      })                
                    } else {
                      callback(null, {})
                    }
                  }
                })
              }
            }
          })
        } else {
          callback(null, transaction)
        }
      }
    }).catch(err => {
      console.log(err)
    })
  };

  Transaction.success = function (accountNumber) {
    const params = req.query;
    const pdtRequestModel = new ypco.pdtRequestModel(
      pdtToken,
      params.TransactionId,
      params.MerchantOrderId,
      useSandbox
    );
    console.log("success url called");
    ypco.checkout
      .RequestPDT(pdtRequestModel)
      .then((pdtJson) => {
        if ((pdtJson.Status = "SUCCESS")) {
          console.log("success url called - Paid");
          //This means the payment is completed.
          //You can extract more information of the transaction from the pdtResponse
          //You can now mark the order as "Paid" or "Completed" here and start the delivery process
        }
        res.redirect("/");
      })
      .catch((err) => {
        //This means the pdt request has failed.
        //possible reasons are
        //1. the TransactionId is not valid
        //2. the PDT_Key is incorrect

        res.redirect("/");
      });
  };
  Transaction.ipn = function (accountNumber) {
    const ipnModel = req.body;
    ypco.checkout
      .IsIPNAuthentic(ipnModel, useSandbox)
      .then((ipnStatus) => {
        //This means the payment is completed
        //You can now mark the order as "Paid" or "Completed" here and start the delivery process
        res.json({ "IPN Status": ipnStatus });
      })
      .catch((err) => {
        res.json({ Error: err });
      });
  };
  Transaction.cancel = function (accountNumber) {
    const params = req.query;
    const pdtRequestModel = new ypco.pdtRequestModel(
      pdtToken,
      params.TransactionId,
      params.MerchantOrderId,
      useSandbox
    );
    ypco.checkout
      .RequestPDT(pdtRequestModel)
      .then((pdtJson) => {
        if ((pdtJson.Status = "Canceled")) {
          //This means the payment is canceled.
          //You can extract more information of the transaction from the pdtResponse
          //You can now mark the order as "Canceled" here.
        }
        res.json({ result: pdtJson.result });
      })
      .catch((err) => {
        //This means the pdt request has failed.
        //possible reasons are
        //1. the TransactionId is not valid
        //2. the PDT_Key is incorrect

        res.json({ result: "Failed" });
      });
  };
  Transaction.failure = function (accountNumber) {
    return Transaction.find({
      where: {
        accountNo: accountNumber,
      },
    });
  };
};
