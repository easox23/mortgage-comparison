# Mortgage Comparison Tool

A comprehensive web application for comparing different mortgage options and simulating payment scenarios over time. This tool helps users make informed decisions about mortgage choices by visualizing payment schedules, interest rates, and total costs.

## Features

- Compare fixed-rate and variable-rate mortgages side by side
- Simulate mortgage payments with customizable parameters:
  - Principal amount
  - Interest rates
  - Loan term (years)
  - Euribor rates and variance
  - Bonifications and special conditions
- Visualize payment breakdown over the lifetime of the mortgage
- Calculate important metrics like:
  - Total interest paid
  - Total capital paid
  - Equivalent fixed interest rate
  - Average monthly payments
  - Total expenses
- Interactive charts and tables for easy analysis

## Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: TailwindCSS 4
- **Data Visualization**: Plotly.js
- **Languages**: TypeScript

### Backend
- **Runtime**: Python 3.12
- **Framework**: FastAPI
- **Data Processing**: Pandas, NumPy Financial
- **Deployment**: AWS Lambda (via Mangum)

### Infrastructure
- **Cloud Provider**: AWS
- **Deployment Framework**: AWS SAM (Serverless Application Model)
- **CI/CD**: Make-based build system
- **Hosting**: 
  - Frontend: CloudFront + S3
  - Backend: API Gateway + Lambda

## Prerequisites

- Python 3.12+
- Node.js 18+
- npm 9+
- AWS CLI configured with appropriate permissions
- AWS SAM CLI
- Poetry for Python dependency management

## Getting Started

After cloning this repository, you will need to create or configure the following files:

1. **frontend/.env** - Contains environment variables for the frontend application
   ```
   # Example .env file
   NEXT_PUBLIC_API_URL=https://your-api-gateway-url/v1
   ```

2. **infra/samconfig.toml** - Contains SAM CLI configuration for deployments. Here you will need to specify the region, stack name and the non default variables.
   ```
   # Example samconfig.toml file (will be generated during first guided-deploy)
   version = 0.1
   [default]
   [default.deploy]
   [default.deploy.parameters]
   stack_name = "mortgage-simulator"
   s3_bucket = "aws-sam-cli-managed-default-samclisourcebucket-xxxxx"
   s3_prefix = "mortgage-simulator"
   region = "eu-west-1"
   capabilities = "CAPABILITY_IAM"
   ```

## Local Development

### Backend Setup

1. Install Python dependencies:
   ```bash
   cd backend
   poetry install
   ```

2. Run tests:
   ```bash
   poetry run pytest
   ```

3. Build Lambda artifacts:
   ```bash
   poetry build-lambda
   ```

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Set up environment variables (copy `.env.example` to `.env` if it exists)

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:3000`

## Deployment

This project uses AWS SAM for deployment to AWS. The Makefile provides several commands to simplify the deployment process.

### Deploy Backend

```bash
make build      # Build the SAM application
make deploy     # Deploy to AWS
```

Note that the first deployment should be interactive with guided prompts:
```bash
make guided-deploy
```

### Deploy Frontend

```bash
make frontend-build    # Build the Next.js application
make s3-deploy         # Deploy to S3 and invalidate CloudFront
```

Or do both with a single command:
```bash
make deploy-frontend
```

### Removing Resources

To remove all deployed resources:
```bash
make delete
```

## Architecture

- The frontend is a static Next.js application deployed to S3 and served via CloudFront
- The backend is a FastAPI application running on AWS Lambda, exposed via API Gateway
- The SAM template provisions all required AWS resources including:
  - Lambda functions
  - API Gateway
  - S3 buckets
  - CloudFront distribution
  - Necessary IAM roles and permissions
