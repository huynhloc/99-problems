**There are several computational inefficiencies and anti-patterns:**

- `FormattedWalletBalance` interface should extend from `WalletBalance` interface

<br>

- `children` is not used anywhere, and should be removed

<br>

- missing `blockchain` property in `WalletBalance` interface
```
interface WalletBalance {
  currency: string;
  amount: number;
  // Missing: blockchain: string;
}
```

<br>

- Type inconsistency - Using `any` type for blockchain parameter, should be `blockchain: string`
```
const getPriority = (blockchain: any): number => {
```
<br>

- `balancePriority` is not used and `lhsPriority` is not defined anywhere, the condition here should be `balancePriority > -99`
```
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) { 
```
<br>

- Incorrect filter logic - The filter condition is inverted, condition should be `balance.amount > 0`
```
if (balance.amount <= 0) {
  return true;
}
```
<br>

- should avoid nested if statements in filter logic
```
if (lhsPriority > -99) {
  if (balance.amount <= 0) {
    return true;
  }
}
```
<br>

- Missing return 0 for equal case, or just return `rightPriority - leftPriority`
```
if (leftPriority > rightPriority) {
  return -1;
} else if (rightPriority > leftPriority) {
  return 1;
}
// Missing: return 0;
```
<br>

- looping `sortedBalances` twice to compute `formattedBalances` and `rows` but `formattedBalances` is not used anywhere, 
<br>


- Incorrect type usage, type of `balance`  should be `WalletBalance` since sortedBalances contains WalletBalance items
```
const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
```
<br>

- `prices` should be removed from depencies as it's not needed for filtering/sorting, or we actually should combine mapping operations of calculating `formatted` and `usdValue`  into single where we can compute 2 these properties  to avoid recalculation. `usdValue` will be a porperty of `FormattedWalletBalance`.
```
}, [balances, prices]);
```
<br>

- should add fraction digit `.toFixed(2)`
```
formatted: balance.amount.toFixed()
```
<br>

- Using array index as React key, should use unique identifier like balance.currency
```
<WalletRow key={index} ... />
```
<br>

- No null checks for `prices[balance.currency]`, what happen if prices[balance.currency] is undefined
```
const usdValue = prices[balance.currency] * balance.amount;
```
<br>

- `getPriority` function should move out of the component to prevent re-created every render, or you can memoized it and add it as a depenency of  `const sortedBalances = useMemo(()`
