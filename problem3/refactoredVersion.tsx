interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // fix missing blockchain
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number; // avoid recalculation usdValue
}

interface Props extends BoxProps {
}

// Move getPriority out of component to avoid recreation on every render
const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis':
      return 100;
    case 'Ethereum':
      return 50;
    case 'Arbitrum':
      return 30;
    case 'Zilliqa':
    case 'Neo':
      return 20;
    default:
      return -99;
  }
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const formattedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        return getPriority(rhs.blockchain) - getPriority(lhs.blockchain);
      })
      .map((balance: WalletBalance): FormattedWalletBalance => {
        const price = prices[balance.currency] || 0; // fallback if null
        return {
          ...balance,
          formatted: balance.amount.toFixed(2), // Added fraction digit
          usdValue: price * balance.amount,
        };
      });
  }, [balances, prices]);

  const rows = useMemo(() => {
    return formattedBalances.map((balance: FormattedWalletBalance) => (
      <WalletRow
        className={classes.row}
        key={balance.currency} // Use currency as key instead of index
        amount={balance.amount}
        usdValue={balance.usdValue}
        formattedAmount={balance.formatted}
        currency={balance.currency} // Added currency prop if needed
      />
    ));
  }, [formattedBalances]);

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

export default WalletPage;