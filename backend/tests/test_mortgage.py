import pytest
from src.backend.main import MortgageSimulation, MortgagePayment, MortgageCondition

@pytest.fixture
def sample_conditions():
    return MortgageCondition(
        name = 'Condition1',
        rate=0.02,
        fixedPeriod=10,
        euriborDelta=0.008,
        totalYears=30,
        fixedPeriodBonification=1000,
        afterFixedPeriodBonification=1000
    )

def test_mortgage_simulation_init(sample_conditions):
    principal = 300000
    current_euribor = 0.01
    yearly_variance = 0.0003
    
    sim = MortgageSimulation(principal,{"yearly_house_expenses": 5000}, sample_conditions, "test", current_euribor, yearly_variance)
    
    assert sim.initial_principal == principal
    assert sim.year == 0
    assert sim.type == "test"
    assert sim.yearly_euribor_variance == yearly_variance
    assert len(sim.mortgage_payments) == 1
    assert sim.condition == sample_conditions

def test_calculate_new_euribor(sample_conditions):
    sim = MortgageSimulation(300000,{"yearly_house_expenses": 5000}, sample_conditions, "test", 0.01, 0.0003)
    old_euribor = 0.01
    
    # Test multiple times since it's random
    for _ in range(100):
        new_euribor = sim.calculate_new_euribor(old_euribor)
        # New euribor should be reasonably close to old value
        assert abs(new_euribor - old_euribor) < 0.01

def test_simulate_yearly_mortgage_payment(sample_conditions):
    sim = MortgageSimulation(300000,{"yearly_house_expenses": 5000}, sample_conditions, "test", 0.01, 0.0003)
    
    # Test first year (fixed period)
    sim.simulate_yearly_mortgage_payment()
    payment = sim.mortgage_payments[-1]
    
    assert payment.year == 1
    assert payment.interest_rate == sample_conditions.rate
    assert payment.bonfication_payments == sample_conditions.fixedPeriodBonification
    assert payment.principal < sim.initial_principal

    # Test after fixed period
    for _ in range(10):
        sim.simulate_yearly_mortgage_payment()
    
    payment = sim.mortgage_payments[-1]
    assert payment.year == 11
    assert payment.bonfication_payments == sample_conditions.afterFixedPeriodBonification
    assert payment.interest_rate != sample_conditions.rate

def test_calculate_yearly_loan_payment(sample_conditions):
    sim = MortgageSimulation(300000,{"yearly_house_expenses": 5000}, sample_conditions, "test", 0.01, 0.0003)
    
    result = sim.calculate_yearly_loan_payment(300000, 0.02, 1, 30)
    assert 'capital_paid' in result
    assert result['capital_paid'] > 0

def test_full_simulation(sample_conditions):
    sim = MortgageSimulation(300000,{"yearly_house_expenses": 5000}, sample_conditions, "test", 0.01, 0.0003)
    results = sim.simulate()
    
    assert results.total_years == sample_conditions.totalYears
    assert len(sim.mortgage_payments) == sample_conditions.totalYears + 1

def test_mortgage_simulation():
    condition = MortgageCondition(
        name="test_condition",
        rate=0.02,
        fixedPeriod=10,
        euriborDelta=0.01,
        totalYears=30,
        fixedPeriodBonification=1000,
        afterFixedPeriodBonification=500
    )
    
