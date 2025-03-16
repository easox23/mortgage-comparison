import React, { useState } from "react";

const PercentageInput = () => {
  const [percentage, setPercentage] = useState("");
  const [error, setError] = useState("");

  // Function to handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // If the input is empty, set the percentage to empty string
    if (inputValue === "") {
      setPercentage("");
      setError(""); // Clear error if input is empty
      return;
    }

    // Remove non-numeric characters except for the percentage sign
    let sanitizedValue = inputValue.replace(/[^0-9%]/g, "");

    // Ensure it has a percentage sign at the end if there's a number entered
    if (sanitizedValue && !sanitizedValue.includes('%')) {
      sanitizedValue = sanitizedValue + '%';
    }

    // Remove the percentage sign for numeric validation
    let numericValue = sanitizedValue.replace('%', '');
    const numericValueParsed = parseFloat(numericValue);

    // Validate the number is within the range 0-100
    if (numericValueParsed >= 0 && numericValueParsed <= 100 && !isNaN(numericValueParsed)) {
      setPercentage(sanitizedValue);
      setError(""); // Clear error if valid
    } else {
      setError("Please enter a valid percentage between 0 and 100.");
    }
  };

  return (
    <div>
      <label htmlFor="percentage-input">Enter Percentage: </label>
      <input
        id="percentage-input"
        type="text"
        value={percentage || "Enter percentage"}
        onChange={handleChange}
        placeholder="Enter percentage"
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default PercentageInput;
