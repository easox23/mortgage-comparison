'use client'
import { useState } from 'react'
import styles from './page.module.css'
import { AverageResultsVisualizer } from '../components/AverageResultsVisualizer';
import CurrencyInput from 'react-currency-input-field';
interface Condition {
  name: string;
  rate: number;
  fixedPeriod: number;
  euriborDelta: number;
  totalYears: number;
  fixedPeriodBonification: number;
  afterFixedPeriodBonification: number;
}

interface SimulationResultEntry {
  average_euribor: number;
  average_interest_rate: number;
  equivalent_fixed_interest_rate: number;
  total_interest_paid: number;
  total_capital_paid: number;
  total_expenses: number;
  total_bonification_payments: number;
  total_paid: number;
  total_paid_without_expenses: number;
  average_monthly_payment: number;
  total_years: number;
  type: string;
}

interface SimulationResults {
  average_results: {
    [conditionName: string]: SimulationResultEntry[];
  };
}


const API_URL = 'https://8tx3zsb2b5.execute-api.eu-west-1.amazonaws.com/v1/api/simulate';

export default function MortgageSimulator() {
  const [conditions, setConditions] = useState<Condition[]>([])
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResults, setSimulationResults] = useState<SimulationResults | null>(null)

  const [generalInput, setFormData] = useState({
    principal: 0,
    currentEuribor: 0.025,
    yearlyVariance: 0.003,
    yearlyExpenses: 0
  })

  const [inputWarnings, setInputWarnings] = useState<{ [key: string]: string }>({})

  const [showDescriptions, setShowDescriptions] = useState(false)

  const handleConditionChange = (index: number, field: keyof Condition, value: any) => {
    
    setConditions(prev => {
      const newConditions = [...prev]
      newConditions[index] = { ...newConditions[index], [field]: value }
      return newConditions
    })
  }
  

  const addNewCondition = () => {
    setConditions(prev => [...prev, {
      name: `Condition ${prev.length + 1}`,
      rate: 0.02,
      fixedPeriod: 5,
      euriborDelta: 0.01,
      totalYears: 10,
      fixedPeriodBonification: 1000,
      afterFixedPeriodBonification: 500
    }])
  }

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index))
  }

  const handleSimulate = async () => {
    setIsSimulating(true)
    try {
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generalInput: generalInput,
          conditions
        })
      })

      if (!response.ok) {
        throw new Error('Simulation failed')
      }

      const result = await response.json()
      setSimulationResults(result)
    } catch (error) {
      console.error('Error simulating mortgage:', error)
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Mortgage
        <span className={styles.highlight}> Simulator</span>
      </h1>

      <p className={styles.description}>
        Easily compare mortgage offers with more advanced inputs.
        Visualize how different terms, rates, and bonifications impact your financial future. Our simulation runs 100 scenarios, considering Euribor as a random variable, to provide a comprehensive range of possible outcomes with clear box plots.
      </p>

      <div className={styles.card}>
        <div className={styles.mainInputs}>

          <div className={styles.inputGroup}>
            <label htmlFor="principal">Principal Amount (€)</label>
            <CurrencyInput
              id="principal"
              name="principal"
              placeholder="Enter amount"
              className={styles.input}
              intlConfig={{ locale: "de-DE", currency: "EUR" }}
              decimalsLimit={2}
              onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  principal: value ? parseFloat(value) : 0
                }));
              }}
            />
            <p className={styles.inputDescription}>The total amount of money you're borrowing for your mortgage.</p>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="yearlyExpenses">Yearly House Expenses (€)</label>
            <CurrencyInput
              id="yearlyExpenses"
              name="yearlyExpenses"
              placeholder="Enter amount"
              className={styles.input}
              intlConfig={{ locale: "de-DE", currency: "EUR" }}
              decimalsLimit={2}
              onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  yearlyExpenses: value ? parseFloat(value) : 0
                }));
              }}
            />
            <p className={styles.inputDescription}>Annual costs for property maintenance, taxes, and insurance.</p>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="currentEuribor">Current Euribor (%)</label>
            <input
              type="number"
              id="currentEuribor"
              value={generalInput.currentEuribor * 100}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                currentEuribor: parseFloat(e.target.value) / 100
              }))}
              step="0.1"
              min="0"
              max="100"
              className={styles.input}
            />
            <p className={styles.inputDescription}>The current European interbank lending rate.</p>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="yearlyVariance">Yearly Variance (%)</label>
            <input
              type="number"
              id="yearlyVariance"
              value={generalInput.yearlyVariance * 100}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                yearlyVariance: parseFloat(e.target.value) / 100
              }))}
              step="0.1"
              min="0"
              max="100"
              className={styles.input}
            />
            <p className={styles.inputDescription}>Expected annual change in Euribor rate for simulation purposes.</p>
          </div>
        </div>

        <div className={styles.conditionsSection}>
          <h2>Mortgage Conditions</h2>
          
          <div className={styles.fieldDescriptions}>
            <button 
              className={styles.fieldDescriptionsToggle}
              onClick={() => setShowDescriptions(!showDescriptions)}
            >
              {showDescriptions ? 'Hide Field Descriptions' : 'Show Field Descriptions'} <span>{showDescriptions ? '▲' : '▼'}</span>
            </button>
            
            {showDescriptions && (
              <div className={styles.descriptionsContent}>
                <div className={styles.descriptionsGrid}>
                  <div className={styles.fieldDescription}>
                    <span className={styles.fieldName}>Fixed Rate (%)</span>
                    <p>The interest rate fixed for the initial period of your mortgage.</p>
                  </div>
                  <div className={styles.fieldDescription}>
                    <span className={styles.fieldName}>Euribor Delta (%)</span>
                    <p>The percentage added to Euribor after the fixed rate period ends.</p>
                  </div>
                  <div className={styles.fieldDescription}>
                    <span className={styles.fieldName}>Fixed Period</span>
                    <p>Number of years the interest rate remains fixed.</p>
                  </div>
                  <div className={styles.fieldDescription}>
                    <span className={styles.fieldName}>Total Years</span>
                    <p>The total duration of the mortgage in years.</p>
                  </div>
                  <div className={styles.fieldDescription}>
                    <span className={styles.fieldName}>Fixed Period Bonification</span>
                    <p>Yearly payments made during the fixed rate period to lower the interest rate.</p>
                  </div>
                  <div className={styles.fieldDescription}>
                    <span className={styles.fieldName}>After Fixed Period Bonification</span>
                    <p>Yearly payments made after the fixed rate period ends to lower the interest rate.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.conditionsContainer}>
            {conditions.map((condition, index) => (
              <div key={index} className={styles.conditionCard}>
                <div className={styles.conditionHeader}>
                  <input
                    type="text"
                    value={condition.name}
                    onChange={(e) => handleConditionChange(index, 'name', e.target.value)}
                    className={styles.conditionName}
                  />
                  <button
                    onClick={() => removeCondition(index)}
                    className={styles.removeButton}
                  >
                    ×
                  </button>
                </div>

                <div className={styles.conditionInputs}>
                  <div className={styles.inputGroup}>
                    <label>Fixed Rate (%)</label>
                    <input
                      type="number"
                      id="rate"
                      value={condition.rate*100}
                      onChange={(e) => handleConditionChange(index, 'rate', parseFloat(e.target.value)/100)}
                      step="0.1"
                      min="0"
                      max="100"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Euribor Delta (%)</label>
                    <input
                      type="number"
                      id="euriborDelta"
                      value={condition.euriborDelta*100}
                      onChange={(e) => handleConditionChange(index, 'euriborDelta', parseFloat(e.target.value)/100)}
                      step="0.1"
                      min="0"
                      max="100"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Fixed Period</label>
                    <input
                      type="number"
                      id="fixedPeriod"
                      value={condition.fixedPeriod}
                      onChange={(e) => handleConditionChange(index, 'fixedPeriod', parseFloat(e.target.value))}
                      step="1"
                      min="0"
                      className={styles.input}
                    />
                  </div>
                
                  <div className={styles.inputGroup}>
                    <label>Total Years</label>
                    <input
                      type="number"
                      id="totalYears"
                      value={condition.totalYears}
                      onChange={(e) => handleConditionChange(index, 'totalYears', parseFloat(e.target.value))}
                      step="1"
                      min="0"
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Fixed Period Bonification</label>
                    <CurrencyInput
                      id="fixedPeriodBonification"
                      name="fixedPeriodBonification"
                      placeholder="Enter amount"
                      className={styles.input}
                      intlConfig={{ locale: "de-DE", currency: "EUR" }}
                      decimalsLimit={2}
                      onValueChange={(value) => handleConditionChange(index, 'fixedPeriodBonification', value ? parseFloat(value) : 0)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>After Fixed Period Bonification</label>
                    <CurrencyInput
                      id="afterFixedPeriodBonification"
                      name="afterFixedPeriodBonification"
                      placeholder="Enter amount"
                      className={styles.input}
                      intlConfig={{ locale: "de-DE", currency: "EUR" }}
                      decimalsLimit={2}
                      onValueChange={(value) => handleConditionChange(index, 'afterFixedPeriodBonification', value ? parseFloat(value) : 0)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={addNewCondition} className={styles.addButton}>
            + Add New Mortgage
          </button>

          <button
            onClick={handleSimulate}
            className={styles.simulateButton}
            disabled={isSimulating || conditions.length === 0}
          >
            {isSimulating ? 'Simulating...' : 'Simulate'}
          </button>
        </div>
      </div>

      {simulationResults && simulationResults.average_results && (
        <div className={styles.resultsCard}>
          <AverageResultsVisualizer average_results={simulationResults.average_results} />
        </div>
      )}
    </div>
  )
}
