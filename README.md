# AWS Log Processor

A TypeScript CLI tool built with Bun for searching and downloading AWS CloudWatch logs for Lambda functions.

## Features

- Search CloudWatch logs for a specific string pattern
- Download complete logs for each Lambda execution that contains the search pattern
- Save each Lambda execution's logs to a separate file
- Specify time range for the search
- Support for AWS profiles and regions

## Requirements

- [Bun](https://bun.sh/) (>= 1.0.0)
- [AWS CLI](https://aws.amazon.com/cli/) (properly configured with credentials)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aws-log-processor.git
cd aws-log-processor

# Install dependencies
bun install

# Make the CLI executable
chmod +x src/cli.ts
```

## Usage

```bash
# Basic usage
bun start search \
  --log-group "/aws/lambda/your-lambda-function" \
  --search-pattern "ERROR" \
  --destination "./logs"

# With time range
bun start search \
  --log-group "/aws/lambda/your-lambda-function" \
  --search-pattern "Exception" \
  --destination "./logs" \
  --from "2023-01-01T00:00:00Z" \
  --to "2023-01-02T00:00:00Z"

# With AWS profile and region
bun start search \
  --log-group "/aws/lambda/your-lambda-function" \
  --search-pattern "Error" \
  --destination "./logs" \
  --profile "dev" \
  --region "us-east-1"
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
bun dev search --log-group "/aws/lambda/your-function" --search-pattern "ERROR" --destination "./logs"

# Type check
bun run typecheck

# Build for production
bun run build
```

## License

MIT