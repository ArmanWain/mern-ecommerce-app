export const formatCurrency = (amountCents, options) => {
  if (!amountCents && amountCents !== 0) return "";

  const dollarFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'usd',
  })

  if (options?.replaceZeros === true) {
    return dollarFormat.format(Math.round(amountCents) / 100).replace(/\.00$/, '');
  } else {
    return dollarFormat.format(Math.round(amountCents) / 100);
  }
}