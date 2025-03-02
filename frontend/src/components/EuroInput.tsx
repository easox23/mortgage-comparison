import React, { useState, useEffect } from 'react';

interface EuroInputProps {
  initialValue?: number;
  onChange?: (value: number) => void;
}

const EuroInput: React.FC<EuroInputProps> = ({ initialValue = 0, onChange }) => {
  const [value, setValue] = useState(initialValue);

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    const numericValue = parseInt(inputValue, 10) / 100;
    setValue(numericValue);
    if (onChange) {
      onChange(numericValue);
    }
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <input
      type="text"
      value={formatEuro(value)}
      onChange={handleChange}
      onFocus={(e) => e.target.select()}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition-colors"
    />
  );
};

export default EuroInput; 