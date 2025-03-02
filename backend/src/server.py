from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from main import MortgageCondition, MortgageSimulation, summarize_mortgage_payments, MortgageStats, SummarizedMortgagePayment
import uvicorn
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GeneralInput(BaseModel):
    principal: float = Field(gt=0)
    currentEuribor: float = Field(gt=0)
    yearlyVariance: float = Field(gt=0)
    yearlyExpenses: float


class SimulationInput(BaseModel):
    generalInput: GeneralInput
    conditions: list[MortgageCondition]

class SimulationOutput(BaseModel):
    average_results: dict[str, list[MortgageStats]]
    average_mortgage_payments: dict[str, list[SummarizedMortgagePayment]]

@app.post("/api/simulate")
async def simulate(simulation_input: SimulationInput) -> SimulationOutput:
    print(simulation_input)
    average_results = {}
    average_mortgage_payments = {}
    
    for condition in simulation_input.conditions:
        simulation_results = []
        mortgage_payments = []
        for x in range(100):
            simulation = MortgageSimulation(
                simulation_input.generalInput.principal,
                {"yearly_house_expenses": simulation_input.generalInput.yearlyExpenses},
                condition,
                condition.name,
                simulation_input.generalInput.currentEuribor,
                simulation_input.generalInput.yearlyVariance
            )
            results = simulation.simulate()

            
            mortgage_payments.append(simulation.mortgage_payments)
            simulation_results.append(results)

        average_results[condition.name] = simulation_results
        summarized_mortgage_payments = summarize_mortgage_payments(mortgage_payments)
        average_mortgage_payments[condition.name] = summarized_mortgage_payments

    return {
        "average_results": average_results,
        "average_mortgage_payments": average_mortgage_payments
    }
    


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
    

