"use strict";

module.exports = function (Wallet) {
  Wallet.getBalance = async function (walletId) {
    let wallet = await Wallet.findOne({
      where: {
        id: walletId,
      },
    });
    if (wallet) {
      return {
        balance: wallet.balance,
      };
    } else {
        const err = new Error(`No wallet has been found with ID: ${walletId}`)
        delete err.stack
        err.statusCode = 404
        throw err;
    }
  };
};
