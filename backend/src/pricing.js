function applyDiscount(price) {
  return Math.round(price * 0.95 * 100) / 100;
}
function evaluateRetention(currentPrice, cheapestPrice, cheapestProduct) {
  if (currentPrice === cheapestPrice) {
    return {
      action: 'discount',
      newPrice: applyDiscount(currentPrice),
    };
  } else {
    return {
      action: 'replace',
      suggestion: {
        product: cheapestProduct,
        price: cheapestPrice,
      },
    };
  }
}

module.exports = { applyDiscount, evaluateRetention };