import React, { useState, useEffect } from 'react';

interface PercentageInputProps {
  initialValue?: number;
  onChange?: (value: number) => void;
  max?: number;
}

const PercentageInput: React.FC<PercentageInputProps> = ({ initialValue = 0, onChange, max = 100 }) => {
  const [value, setValue] = useState(initialValue);

  const formatPercentage = (number: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number / 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/[^0-9.]/g, '');
    let numericValue = parseFloat(inputValue);

    // Ensure the value doesn't exceed the max
    numericValue = Math.min(numericValue, max);

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
      value={formatPercentage(value)}
      onChange={handleChange}
      onFocus={(e) => e.target.select()}
      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition-colors"
    />
  );
};

export default PercentageInput; 