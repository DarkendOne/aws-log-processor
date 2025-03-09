#!/usr/bin/env bun
import { Command } from 'commander';
import chalk from 'chalk';
import { searchLogs } from './index.js';

const program = new Command();

program
  .name('aws-log-processor')
  .description('CLI tool to search and download AWS CloudWatch logs for Lambda functions')
  .version('0.1.0');

program
  .command('search')
  .description('Search CloudWatch logs for a pattern and download matching Lambda execution logs')
  .requiredOption('-g, --log-group <name>', 'CloudWatch log group name')
  .requiredOption('-s, --search-pattern <pattern>', 'Pattern to search for in logs')
  .requiredOption('-d, --destination <directory>', 'Directory to save log files')
  .option('-f, --from <timestamp>', 'Start time for the search (ISO format or Unix timestamp in milliseconds)')
  .option('-t, --to <timestamp>', 'End time for the search (ISO format or Unix timestamp in milliseconds)')
  .option('-p, --profile <name>', 'AWS profile to use')
  .option('-r, --region <region>', 'AWS region')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Searching CloudWatch logs for pattern:'), chalk.yellow(options.searchPattern));
      console.log(chalk.blue('Log group:'), chalk.yellow(options.logGroup));
      
      const { count, directory } = await searchLogs({
        logGroup: options.logGroup,
        searchPattern: options.searchPattern,
        destination: options.destination,
        from: options.from,
        to: options.to,
        profile: options.profile,
        region: options.region
      });
      
      console.log(chalk.green(`Successfully processed ${count} Lambda executions`));
      console.log(chalk.green(`Log files saved to: ${directory}`));
    } catch (error) {
      console.error(chalk.red(`Error processing logs: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program.parse(process.argv);