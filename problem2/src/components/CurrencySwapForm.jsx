import { useState, useEffect, useRef } from 'react';
import './CurrencySwapForm.css';

const MOCK_DELAY_API_CALL = 500;
const DEBOUNCE_DELAY = 300;

const getCurrencyIcon = (currency) => {
  try {
    return `/token-icons/${currency.toLowerCase()}.svg`;
  } catch {
    return null;
  }
}

const CurrencyDropdown = ({ value, onChange, rates, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const iconUrl = getCurrencyIcon(value);

  const handleClickOutside = (e) => {
    if (!e.target.closest('.currency-dropdown')) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`currency-dropdown ${className}`}>
      <div 
        className="currency-dropdown-selected"
        onClick={handleToggle}
      >
        <div className="currency-option">
          {iconUrl ? (
            <img src={iconUrl} alt={value} className="currency-icon"/>
          ) : (
            <span className="currency-placeholder">💱</span>
          )}
          <span className="currency-code">{value}</span>
        </div>
        <svg 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 20 20" 
          fill="none"
        >
          <path 
            stroke="currentColor" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.5" 
            d="M6 8l4 4 4-4"
          />
        </svg>
      </div>
      
      {isOpen && (
        <div className="currency-dropdown-options">
          {rates.map(rate => {
            const optionIconUrl = getCurrencyIcon(rate.currency);
            return (
              <div
                key={rate.currency}
                className="currency-dropdown-option"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(rate.currency);
                  setIsOpen(false);
                }}
              >
                <div className="currency-option">
                  {optionIconUrl ? (
                    <img src={optionIconUrl} alt={rate.currency} className="currency-icon" onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <span className="currency-placeholder">💱</span>
                  )}
                  <span className="currency-code">{rate.currency}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CurrencySwapForm = () => {
  const timer = useRef();
  const isInputChangedByUser = useRef(true);
  
  const [rates, setRates] = useState([]);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastEdited, setLastEdited] = useState('from');

  const fetchExchangeRates = () => {
    return fetch('https://interview.switcheo.com/prices.json')
      .then(response => response.json())
      .then(data => {
        const deduped = data.reduce((acc, curr) => {
          const existing = acc.find(item => item.currency === curr.currency);
          if (!existing || new Date(curr.date) > new Date(existing.date)) {
            return [...acc.filter(item => item.currency !== curr.currency), curr];
          }
          return acc;
        }, []);

        setRates(deduped);
        
        if (deduped.length > 0) setFromCurrency(deduped[0].currency);
        if (deduped.length > 1) setToCurrency(deduped[1].currency);
      })
      .catch(e => {
        console.log(e);
      })
  }

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const getExchangeRate = (from, to) => {
    if (from === to) return 1;

    const fromRate = rates.find(rate => rate.currency === from);
    const toRate = rates.find(rate => rate.currency === to);

    if (fromRate && toRate) {
      return toRate.price / fromRate.price;
    }

    return 1;
  }

  const calculateResult = (amount, from, to, direction = 'from') => {
    if (!amount || amount <= 0) {
      return '';
    }

    const rate = getExchangeRate(from, to);
    const result = direction === 'from'
      ? (parseFloat(amount) * rate).toFixed(2)
      : (parseFloat(amount) / rate).toFixed(2);

    return result;
  }

  useEffect(() => {

    if (!isInputChangedByUser.current) return;

    timer.current && clearTimeout(timer.current);
    
    timer.current = setTimeout(() => {
      if (lastEdited === 'from' && fromAmount) {
        setIsLoading(true);
        
        setTimeout(() => {
          const result = calculateResult(fromAmount, fromCurrency, toCurrency, 'from');
          isInputChangedByUser.current = false;
          setToAmount(result);
          setIsLoading(false);
        }, MOCK_DELAY_API_CALL);
        
      } else if (lastEdited === 'to' && toAmount) {
        setIsLoading(true);
        
        setTimeout(() => {
          const result = calculateResult(toAmount, toCurrency, fromCurrency, 'to');
          isInputChangedByUser.current = false;
          setFromAmount(result);
          setIsLoading(false);
        }, MOCK_DELAY_API_CALL);
        
      } else {
        setIsLoading(false);
        isInputChangedByUser.current = true;
      }
    }, DEBOUNCE_DELAY);

    return () => {
      timer.current && clearTimeout(timer.current);
    };
  }, [fromAmount, toAmount, fromCurrency, toCurrency, lastEdited])

  const handleSwapCurrencies = () => {
    isInputChangedByUser.current = true;
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount('1');
    setToAmount('');
    setLastEdited('from');
  }

  const handleFromAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      isInputChangedByUser.current = true;
      setFromAmount(value);
      setLastEdited('from');
      if (!value) {
        setToAmount('');
      }
    }
  }

  const handleToAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      isInputChangedByUser.current = true;
      setToAmount(value);
      setLastEdited('to');
      if (!value) {
        setFromAmount('');
      }
    }
  }

  return (
    <div className="currency-swap-form">
      <div className="form-container">
        <div className="currency-input-group">
          <label className="input-label">Amount to send</label>
          <div className="currency-input">
            <div className="input-container">
              <input
                id="fromAmount"
                type="text"
                value={fromAmount}
                onChange={handleFromAmountChange}
                placeholder="0.00"
                className="amount-input"
              />
              {isLoading && lastEdited === 'to' && (
                <div className="loading-spinner"></div>
              )}
            </div>
            <CurrencyDropdown
              value={fromCurrency}
              onChange={e => {
                console.log(e);
                isInputChangedByUser.current = true;
                setFromCurrency(e);
              }}
              rates={rates}
              className="currency-select"
            />
          </div>
        </div>

        <div className="swap-button-container">
          <button
            id="swapButton"
            onClick={handleSwapCurrencies}
            className="swap-button"
            aria-label="Swap currencies"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 7V3L4 7L8 11V7H16V9H8V7Z" fill="currentColor" />
              <path d="M16 17V21L20 17L16 13V17H8V15H16V17Z" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="currency-input-group">
          <label className="input-label">Amount to receive</label>
          <div className="currency-input">
            <div className="input-container">
              <input
                id="toAmount"
                type="text"
                value={toAmount}
                onChange={handleToAmountChange}
                placeholder="0.00"
                className="amount-input"
              />
              {isLoading && lastEdited === 'from' && (
                <div className="loading-spinner"></div>
              )}
            </div>
            <CurrencyDropdown
              value={toCurrency}
              onChange={e => {
                isInputChangedByUser.current = true;
                setToCurrency(e);
              }}
              rates={rates}
              className="currency-select"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrencySwapForm