from pydantic import BaseModel
import numpy as np
import matplotlib.pyplot as plt
import numpy_financial as npf
import pandas as pd



class MortgageStats(BaseModel):
    average_euribor: float
    average_interest_rate: float
    equivalent_fixed_interest_rate: float
    total_interest_paid: float
    total_capital_paid: float
    total_expenses: float
    total_bonification_payments: float
    total_paid: float
    total_paid_without_expenses: float
    average_monthly_payment: float
    total_years: int
    type: str

class AverageWithPercentiles(BaseModel):
    average: float
    percentile_10: float
    percentile_20: float
    percentile_30: float
    percentile_40: float
    percentile_50: float
    percentile_60: float
    percentile_70: float
    percentile_80: float
    percentile_90: float

class SummarizedMortgagePayment(BaseModel):
    year: int
    euribor: AverageWithPercentiles
    interest_rate: AverageWithPercentiles
    principal: AverageWithPercentiles
    interest_paid: AverageWithPercentiles
    capital_paid: AverageWithPercentiles
    bonfication_payments: AverageWithPercentiles
    real_interest_rate: AverageWithPercentiles


class MortgageCondition(BaseModel):
    name: str
    rate: float
    fixedPeriod: int
    euriborDelta: float
    totalYears: int
    fixedPeriodBonification: float
    afterFixedPeriodBonification: float

class MortgagePayment(BaseModel):
    year: int
    euribor: float
    interest_rate: float
    principal: float
    interest_paid: float
    capital_paid: float
    bonfication_payments: float
    real_interest_rate: float


principal = 540000
current_euribor = 0.007
euribor_variance_yearly = 0.003
yearly_house_expenses = {
    'community': 3000,
    'fixes': 1000,
    'ibi': 1100,
    'house_insurance': 670,
    'other': 0
}

conditions = {
    'fixed_30': MortgageCondition(
        name='fixed_30',
        rate=0.019,
        fixedPeriod=30,
        euriborDelta=0,
        totalYears=30,
        fixedPeriodBonification=1300,
        afterFixedPeriodBonification=1300,
    ),
    'mixed_30': MortgageCondition(
        name='mixed_30',
        rate=0.017,
        fixedPeriod=10,
        euriborDelta=0.008,
        totalYears=30,
        fixedPeriodBonification=0,
        afterFixedPeriodBonification=1300,
    ),
    'mixed_no_bonificada_30': MortgageCondition(
        name='mixed_no_bonificada_30',
        rate=0.017,
        fixedPeriod=10,
        euriborDelta=0.018,
        totalYears=30,
        fixedPeriodBonification=0,
        afterFixedPeriodBonification=0,
    ),
    'variable_30': MortgageCondition(
        name='variable_30',
        rate=0.013,
        fixedPeriod=5,
        euriborDelta=0.008,
        totalYears=30,
        fixedPeriodBonification=1300,
        afterFixedPeriodBonification=1300,
    ),
    'fixed_20': MortgageCondition(
        name='fixed_20',
        rate=0.019,
        fixedPeriod=20,
        euriborDelta=0,
        totalYears=20,
        fixedPeriodBonification=1300,
        afterFixedPeriodBonification=1300,
    ),
    'mixed_20': MortgageCondition(
        name='mixed_20',
        rate=0.017,
        fixedPeriod=10,
        euriborDelta=0.008,
        totalYears=20,
        fixedPeriodBonification=0,
        afterFixedPeriodBonification=1300,
    ),
    'mixed_no_bonificada_20': MortgageCondition(
        name='mixed_no_bonificada_20',
        rate=0.017,
        fixedPeriod=10,
        euriborDelta=0.018,
        totalYears=20,
        fixedPeriodBonification=0,
        afterFixedPeriodBonification=0,
    ),
    'variable_20': MortgageCondition(
        name='variable_20',
        rate=0.013,
        fixedPeriod=5,
        euriborDelta=0.008,
        totalYears=20,
        fixedPeriodBonification=1300,
        afterFixedPeriodBonification=1300,
    ),
    'fixed_10': MortgageCondition(
        name='fixed_10',
        rate=0.019,
        fixedPeriod=10,
        euriborDelta=0,
        totalYears=10,
        fixedPeriodBonification=1300,
        afterFixedPeriodBonification=1300,
    ),
    'variable_10': MortgageCondition(
        name='variable_10',
        rate=0.013,
        fixedPeriod=5,
        euriborDelta=0.008,
        totalYears=10,
        fixedPeriodBonification=1300,
        afterFixedPeriodBonification=1300,
    )
}

class MortgageSimulation:
    def __init__(self, principal, yearly_house_expenses, condition: MortgageCondition, type, current_euribor, yearly_euribor_variance):
        self.year = 0
        self.type = type
        self.initial_principal = principal
        self.yearly_house_expenses = yearly_house_expenses
        self.yearly_euribor_variance = yearly_euribor_variance
        self.mortgage_payments = [MortgagePayment(
            year=0,
            euribor=current_euribor,
            interest_rate=condition.rate,
            principal=principal,
            interest_paid=0,
            capital_paid=0,
            bonfication_payments=0,
            real_interest_rate=condition.rate
        )]
        self.condition: MortgageCondition = condition
        self.results = {}

    def calculate_new_euribor(self, old_euribor):
        euribor_rate =  round(np.random.normal(old_euribor, self.yearly_euribor_variance),5)
        return euribor_rate
    
    def simulate_yearly_mortgage_payment(self):
        old_euribor = self.mortgage_payments[-1].euribor
        new_euribor = self.calculate_new_euribor(old_euribor)
        old_year = self.year
        self.year = old_year+1
        
        interest_rate = 0
        bonfication_payments = 0
        
        if self.year <= self.condition.fixedPeriod:
            interest_rate = self.condition.rate
            bonfication_payments = self.condition.fixedPeriodBonification
        else:
            interest_rate = max(new_euribor,0) + self.condition.euriborDelta
            bonfication_payments = self.condition.afterFixedPeriodBonification
            
        yearly_loan_payment = self.calculate_yearly_loan_payment(
            self.mortgage_payments[-1].principal,
            interest_rate,
            1,
            self.condition.totalYears + 1 - self.year
        )
        
        mortgage_payment = MortgagePayment(
            year=self.year,
            euribor=new_euribor,
            interest_rate=interest_rate,
            principal=round(self.mortgage_payments[-1].principal-yearly_loan_payment['capital_paid'],2),
            interest_paid=yearly_loan_payment['interest_paid'],
            capital_paid=yearly_loan_payment['capital_paid'],
            bonfication_payments=bonfication_payments,
            real_interest_rate = self.calculate_interest_rate(yearly_loan_payment['interest_paid']+bonfication_payments,self.mortgage_payments[-1].principal)
        )
        
        self.mortgage_payments.append(mortgage_payment)
        
    def calculate_yearly_loan_payment(self,principal, interest_rate, current_year,remaining_years,): 
        capital_paid = round(npf.ppmt(interest_rate, current_year, remaining_years, principal,when='end')*-1,2)
        return {
            "capital_paid": capital_paid,
            "interest_paid": round(npf.ipmt(interest_rate, current_year, remaining_years, principal,when='end')*-1,2),
        }

    def calculate_interest_rate(self,interest_paid, principal):
        return round((interest_paid / principal),5)

    def fixed_rate_payment(self, principal, rate, years):
            return  principal * rate / (1 - (1 + rate) ** -years)

    def calculate_equivalent_fixed_interest_rate(self, initial_principal, sum_interest_paid, totalYears):
    
        low = 0
        high = 1
        guess = 0.05

        while high - low > 1e-6:
            total_payment = self.fixed_rate_payment(initial_principal, guess, totalYears) * totalYears
            if total_payment < initial_principal + sum_interest_paid:
                low = guess
            else:
                high = guess
            guess = (high + low) / 2

        return guess
    def calculate_mortgage_stats(self) -> MortgageStats:
        total_payments = len(self.mortgage_payments)
        sum_euribor = sum(payment.euribor for payment in self.mortgage_payments)
        sum_interest_rate = sum(payment.interest_rate for payment in self.mortgage_payments)
        sum_interest_paid = sum(payment.interest_paid for payment in self.mortgage_payments)
        sum_capital_paid = sum(payment.capital_paid for payment in self.mortgage_payments)
        sum_bonification_paid = sum(payment.bonfication_payments for payment in self.mortgage_payments)
        sum_expenses = sum(self.yearly_house_expenses.values())*self.condition.totalYears
        equivalent_fixed_interest_rate = self.calculate_equivalent_fixed_interest_rate(self.initial_principal, sum_interest_paid, self.condition.totalYears)
        




        return MortgageStats(
            average_euribor=round(sum_euribor / total_payments, 5),
            average_interest_rate=round(sum_interest_rate / total_payments, 5),
            equivalent_fixed_interest_rate=round(equivalent_fixed_interest_rate, 5),
            total_interest_paid=round(sum_interest_paid, 2),
            total_capital_paid=round(sum_capital_paid, 2),
            total_expenses=round(sum_expenses, 2),
            total_bonification_payments=round(sum_bonification_paid, 2),
            total_paid=round(sum_interest_paid + sum_capital_paid + sum_bonification_paid + sum_expenses, 2),
            total_paid_without_expenses=round(sum_interest_paid + sum_capital_paid + sum_bonification_paid, 2),
            average_monthly_payment=round((sum_interest_paid + sum_capital_paid + sum_bonification_paid + sum_expenses) / self.condition.totalYears / 12, 2),
            total_years=self.condition.totalYears,
            type=self.type
        )

    def simulate(self) -> MortgageStats:
        for i in range(self.condition.totalYears):
            self.simulate_yearly_mortgage_payment()
        return self.calculate_mortgage_stats()

def show_simulation(mortgage_payments):
    years = [payment.year for payment in mortgage_payments]
    euribor = [payment.euribor for payment in mortgage_payments]
    interest_rates = [payment.interest_rate for payment in mortgage_payments]
    principals = [payment.principal for payment in mortgage_payments]
    interest_paid = [payment.interest_paid for payment in mortgage_payments]
    capital_paid = [payment.capital_paid for payment in mortgage_payments]
    bonification_payments = [payment.bonfication_payments for payment in mortgage_payments]
    real_interest_rates = [payment.real_interest_rate for payment in mortgage_payments]

    # Create the plot
    fig, (ax1, ax2,ax3) = plt.subplots(3, 1, figsize=(12, 12))


    # First subplot: Rates and Principal
    ax1.plot(years, euribor, label='Euribor', marker='o')
    ax1.plot(years, interest_rates, label='Interest Rate', marker='s')
    ax1.plot(years, real_interest_rates, label='Real Interest Rate', marker='s')

    ax1.set_title('Rates and Principal Over Time')
    ax1.set_xlabel('Year')
    ax1.set_ylabel('Rate')
    ax1.legend()
    ax1.grid(True)



    # Second subplot: Payments
    ax2.plot(years, interest_paid, label='Interest Paid', marker='v')
    ax2.plot(years, capital_paid, label='Capital Paid', marker='D')
    ax2.plot(years, bonification_payments, label='Bonification Payments', marker='*')
    ax2.set_title('Payment Components Over Time')
    ax2.set_xlabel('Year')
    ax2.set_ylabel('Amount')
    ax2.legend()
    ax2.grid(True)

    ax3.plot(years, principals, label='Principal', marker='^')
    ax3.set_title('Remaining Principal')
    ax3.set_xlabel('Year')
    ax3.set_ylabel('Amount')
    ax3.legend()
    ax3.grid(True)
    # Adjust layout to prevent overlap
    plt.tight_layout()

    # Show the plot
    plt.show()

def show_comparison(total_payed_list,avg_monthly_payments,labels):
    # Create box plot
    plt.boxplot(total_payed_list, tick_labels=labels)


    # Customize the plot
    plt.title('Total Mortgage Payment Distribution by Mortgage type')
    plt.ylabel('Total Amount Paid')
    plt.xlabel('Mortgage type')

    # Rotate x-axis labels if needed
    plt.xticks(rotation=45)

    # Add grid for better readability
    plt.grid(True, linestyle='--', alpha=0.7)

    # Adjust layout to prevent label cutoff
    plt.tight_layout()

    # Show the plot
    plt.show()
    

    # Create box plot
    plt.boxplot(avg_monthly_payments, tick_labels=labels)


    # Customize the plot
    plt.title('Average monthly payment by mortgage type')
    plt.ylabel('Monthly payment')
    plt.xlabel('Mortgage type')

    # Rotate x-axis labels if needed
    plt.xticks(rotation=45)

    # Add grid for better readability
    plt.grid(True, linestyle='--', alpha=0.7)

    # Adjust layout to prevent label cutoff
    plt.tight_layout()

    # Show the plot
    plt.show()

def create_percentiles(data_series,round_to=5):
            return AverageWithPercentiles(
                average=round(data_series.mean(),round_to),
                percentile_10=round(data_series.quantile(0.1),round_to),
                percentile_20=round(data_series.quantile(0.2),round_to),
                percentile_30=round(data_series.quantile(0.3),round_to),
                percentile_40=round(data_series.quantile(0.4),round_to),
                percentile_50=round(data_series.quantile(0.5),round_to),
                percentile_60=round(data_series.quantile(0.6),round_to),
                percentile_70=round(data_series.quantile(0.7),round_to),
                percentile_80=round(data_series.quantile(0.8),round_to),
                percentile_90=round(data_series.quantile(0.9),round_to)
            )        

def summarize_mortgage_payments(mortgage_payments_list) -> list[SummarizedMortgagePayment]:
    df = pd.DataFrame([
        {
            'year': payment.year,
            'euribor': payment.euribor,
            'interest_rate': payment.interest_rate,
            'principal': payment.principal,
            'interest_paid': payment.interest_paid,
            'capital_paid': payment.capital_paid,
            'bonfication_payments': payment.bonfication_payments,
            'real_interest_rate': payment.real_interest_rate
        }
        for simulation in mortgage_payments_list
        for payment in simulation
    ])

    summarized = []
    for year in df['year'].unique():
        year_data = df[df['year'] == year]
        
        summarized.append(SummarizedMortgagePayment(
            year=year,
            euribor=create_percentiles(year_data['euribor'],5),
            interest_rate=create_percentiles(year_data['interest_rate'],5), 
            principal=create_percentiles(year_data['principal'],2),
            interest_paid=create_percentiles(year_data['interest_paid'],2),
            capital_paid=create_percentiles(year_data['capital_paid'],2),
            bonfication_payments=create_percentiles(year_data['bonfication_payments'],2),
            real_interest_rate=create_percentiles(year_data['real_interest_rate'],5)
        ))
    return summarized

def main():
    total_payed_list = []
    labels = []
    avg_monthly_payments = []

    # Run simulations and collect data
    for i in conditions:
        total_payed = []
        avg_monthly_payment = []
        for x in range(100):
            simulation = MortgageSimulation(principal, yearly_house_expenses, conditions[i], i, current_euribor,euribor_variance_yearly)
            results = simulation.simulate()
            show_simulation(simulation.mortgage_payments)
            total_payment = results['total_paid']
            total_payed.append(total_payment)
            avg_monthly_payment.append(total_payment/results['total_years']/12)

        
        total_payed_list.append(total_payed)
        avg_monthly_payments.append(avg_monthly_payment)
        labels.append(i)
        
    # Create box plot
    show_comparison(total_payed_list,avg_monthly_payments, labels)



if __name__ == "__main__":
    main()
