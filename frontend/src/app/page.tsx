'use client'

import { useState } from 'react'
import styles from './page.module.css'
import EuroInput from '../components/EuroInput';
import PercentageInput from '../components/PercentageInput';
import { AverageResultsVisualizer } from '../components/AverageResultsVisualizer';
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
  // Add other result properties here as needed
}



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

  const [inputWarnings, setInputWarnings] = useState<{[key: string]: string}>({})

  const handleConditionChange = (index: number, field: keyof Condition, value: string) => {
    const numValue = Number(value)

    if (isNaN(numValue) && field !== 'name') {
      setInputWarnings(prev => ({ ...prev, [`condition-${index}-${field}`]: 'Invalid number' }))
    } else {
      setConditions(prev => {
        const newConditions = [...prev]
        newConditions[index] = { ...newConditions[index], [field]: field === 'name' ? value : numValue }
        return newConditions
      })
      setInputWarnings(prev => ({ ...prev, [`condition-${index}-${field}`]: '' }))
    }
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
      const response = await fetch('http://localhost:8000/api/simulate', {
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
      console.log('Average Results:', result.average_results)
      console.log('Average Mortgage Payments:', result.average_mortgage_payments)
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

      <div className={styles.card}>
        <div className={styles.mainInputs}>
          <div className={styles.inputGroup}>
            <label htmlFor="principal">Principal Amount</label>
            <EuroInput
              initialValue={generalInput.principal}
              onChange={(value) => setFormData(prev => ({ ...prev, principal: value }))}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="currentEuribor">Current Euribor</label>
            <PercentageInput
              initialValue={generalInput.currentEuribor * 100}
              onChange={(value) => setFormData(prev => ({ ...prev, currentEuribor: value / 100 }))}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="yearlyVariance">Yearly Variance</label>
            <PercentageInput
              initialValue={generalInput.yearlyVariance * 100}
              onChange={(value) => setFormData(prev => ({ ...prev, yearlyVariance: value / 100 }))}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="yearlyExpenses">Yearly House Expenses</label>
            <EuroInput
              initialValue={generalInput.yearlyExpenses}
              onChange={(value) => setFormData(prev => ({ ...prev, yearlyExpenses: value }))}
            />
          </div>
        </div>

        <div className={styles.conditionsSection}>
          <h2>Mortgage Conditions</h2>
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
                    <label>Fixed Rate</label>
                    <PercentageInput
                      initialValue={condition.rate * 100}
                      onChange={(value) => handleConditionChange(index, 'rate', (value / 100).toString())}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Fixed Period</label>
                    <input
                      type="number"
                      value={condition.fixedPeriod}
                      onChange={(e) => handleConditionChange(index, 'fixedPeriod', e.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Euribor Delta</label>
                    <PercentageInput
                      initialValue={condition.euriborDelta * 100}
                      onChange={(value) => handleConditionChange(index, 'euriborDelta', (value / 100).toString())}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Total Years</label>
                    <input
                      type="number"
                      value={condition.totalYears}
                      onChange={(e) => handleConditionChange(index, 'totalYears', e.target.value)}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Fixed Period Bonification</label>
                    <EuroInput
                      initialValue={condition.fixedPeriodBonification}
                      onChange={(value) => handleConditionChange(index, 'fixedPeriodBonification', value.toString())}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>After Fixed Period Bonification</label>
                    <EuroInput
                      initialValue={condition.afterFixedPeriodBonification}
                      onChange={(value) => handleConditionChange(index, 'afterFixedPeriodBonification', value.toString())}
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
