import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false, })
import { useState } from "react";
import { BoxPlotData } from 'plotly.js';
import styles from '../app/page.module.css';

interface AverageResultsVisualizerProps {
    average_results: {
        [conditionName: string]: SimulationResultEntry[];
    };
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


export const AverageResultsVisualizer = ({ average_results }: AverageResultsVisualizerProps) => {
    const [selectedField, setSelectedField] = useState<keyof SimulationResultEntry>('equivalent_fixed_interest_rate');
    
    const fieldOptions: (keyof SimulationResultEntry)[] = [
      //'average_euribor', 
      //'average_interest_rate', 
      'average_monthly_payment', //lets you calculate how much you pay per month
      'equivalent_fixed_interest_rate', //lets you compare the interest rate as if it had been at a fixed rate
      'total_bonification_payments',
      //'total_capital_paid',
      'total_expenses',
      'total_interest_paid', 
      'total_paid', //lets you compare how much you pay in total
      'total_paid_without_expenses', //lets you compare how much you pay in total without expenses
      //'total_years'
    ];
  
    const preparePlotData = () => {
      return Object.entries(average_results).map(([condition, entries]) => ({
        y: entries.map(entry => entry[selectedField]),
        name: condition,
        type: 'box' as const,
        //boxpoints: 'Outliers',
        //boxpoints: 'all',
        //jitter: 0.3,
        //pointpos: -1.8
      }));
    };
  
    return (
      <div className={styles.visualizerContainer}>
        <h2>Simulation Results</h2>
        <div className={styles.fieldSelector}>
          <label htmlFor="fieldSelect">Select metric to display:</label>
          <select 
            id="fieldSelect"
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value as keyof SimulationResultEntry)}
            className={styles.selectField}
          >
            {fieldOptions.map(option => (
              <option key={option} value={option}>
                {option.replace(/_/g, ' ')
                  .split(' ')
                  .map((word, index) => index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word.toLowerCase())
                  .join(' ')}
              </option>
            ))}
          </select>
        </div>
        <Plot
          data={preparePlotData() as Partial<BoxPlotData>[]}
          layout={{
            title: `${selectedField.replace(/_/g, ' ').toUpperCase()} Distribution by Condition`,
            yaxis: { title: 'Value' },
            showlegend: true,
            boxmode: 'group'
          }}
          style={{ width: '100%', height: '600px' }}
        />
      </div>
    );
  };
  