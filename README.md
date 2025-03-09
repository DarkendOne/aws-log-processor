# AWS Log Processor

A TypeScript CLI tool for searching and downloading AWS CloudWatch logs for Lambda functions.

## Features

- Search CloudWatch logs for a specific string pattern
- Download complete logs for each Lambda execution that contains the search pattern
- Save each Lambda execution's logs to a separate file
- Specify time range for the search
- Support for AWS profiles and regions

## Requirements

- [Node.js](https://nodejs.org/) (>= 16.0.0)
- [AWS CLI](https://aws.amazon.com/cli/) (properly configured with credentials)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aws-log-processor.git
cd aws-log-processor

# Install dependencies
npm install

# Build the project
npm run build

# Make the CLI executable
chmod +x dist/cli.js

# Optional: Install globally
npm link
```

## Usage

```bash
# Basic usage
npm start -- search \
  --log-group "/aws/lambda/your-lambda-function" \
  --search-pattern "ERROR" \
  --destination "./logs"

# With time range
npm start -- search \
  --log-group "/aws/lambda/your-lambda-function" \
  --search-pattern "Exception" \
  --destination "./logs" \
  --from "2023-01-01T00:00:00Z" \
  --to "2023-01-02T00:00:00Z"

# With AWS profile and region
npm start -- search \
  --log-group "/aws/lambda/your-lambda-function" \
  --search-pattern "Error" \
  --destination "./logs" \
  --profile "dev" \
  --region "us-east-1"

# If installed globally
aws-log-processor search \
  --log-group "/aws/lambda/your-lambda-function" \
  --search-pattern "ERROR" \
  --destination "./logs"
```

### Options

- `-g, --log-group <name>` - CloudWatch log group name (required)
- `-s, --search-pattern <pattern>` - Pattern to search for in logs (required)
- `-d, --destination <directory>` - Directory to save log files (required)
- `-f, --from <timestamp>` - Start time for the search (ISO format or Unix timestamp in milliseconds)
- `-t, --to <timestamp>` - End time for the search (ISO format or Unix timestamp in milliseconds)
- `-p, --profile <name>` - AWS profile to use
- `-r, --region <region>` - AWS region

## Development

```bash
# Run in development mode with auto-reload
npm run dev -- search --log-group "/aws/lambda/your-function" --search-pattern "ERROR" --destination "./logs"

# Type check
npm run typecheck

# Build for production
npm run build
```

## License

MIT