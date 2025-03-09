import { exec } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

interface SearchOptions {
  logGroup: string;
  searchPattern: string;
  destination: string;
  from?: string;
  to?: string;
  profile?: string;
  region?: string;
}

interface LambdaExecution {
  requestId: string;
  startTime: number;
  events: LogEvent[];
}

interface LogEvent {
  timestamp: number;
  message: string;
}

/**
 * Search CloudWatch logs for a pattern and download matching Lambda execution logs
 */
export async function searchLogs(options: SearchOptions): Promise<{ count: number, directory: string }> {
  // Create destination directory if it doesn't exist
  const destinationDir = resolve(options.destination);
  await mkdir(destinationDir, { recursive: true });
  
  // Prepare AWS CLI command
  const awsCommand = buildAwsCommand(options);
  
  // Execute the search
  const { stdout } = await execPromise(awsCommand);
  const searchResults = JSON.parse(stdout);
  
  // Group log events by Lambda execution
  const lambdaExecutions = await getLambdaExecutions(searchResults, options);
  
  // Download and save complete logs for each Lambda execution
  for (const execution of lambdaExecutions) {
    await saveExecutionLogs(execution, destinationDir);
  }
  
  return {
    count: lambdaExecutions.length,
    directory: destinationDir
  };
}

/**
 * Build AWS CLI command for log search
 */
function buildAwsCommand(options: SearchOptions): string {
  // Base command
  let command = 'aws logs filter-log-events';
  
  // Add log group
  command += ` --log-group-name "${options.logGroup}"`;
  
  // Add filter pattern
  command += ` --filter-pattern "${options.searchPattern}"`;
  
  // Add time range if specified
  if (options.from) {
    const startTime = parseTimestamp(options.from);
    command += ` --start-time ${startTime}`;
  }
  
  if (options.to) {
    const endTime = parseTimestamp(options.to);
    command += ` --end-time ${endTime}`;
  }
  
  // Add AWS profile if specified
  if (options.profile) {
    command += ` --profile ${options.profile}`;
  }
  
  // Add AWS region if specified
  if (options.region) {
    command += ` --region ${options.region}`;
  }
  
  return command;
}

/**
 * Parse timestamp from ISO string or Unix timestamp
 */
function parseTimestamp(timestamp: string): number {
  if (/^\d+$/.test(timestamp)) {
    return parseInt(timestamp, 10);
  } else {
    return new Date(timestamp).getTime();
  }
}

/**
 * Extract Lambda execution IDs from search results and get all related logs
 */
async function getLambdaExecutions(searchResults: any, options: SearchOptions): Promise<LambdaExecution[]> {
  const requestIds = new Set<string>();
  const requestRegex = /RequestId: ([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/;
  
  // Extract Lambda request IDs from matching log events
  for (const event of searchResults.events || []) {
    const match = event.message.match(requestRegex);
    if (match && match[1]) {
      requestIds.add(match[1]);
    }
  }
  
  const lambdaExecutions: LambdaExecution[] = [];
  
  // For each request ID, get all logs for that execution
  for (const requestId of requestIds) {
    const command = buildRequestLogCommand(requestId, options);
    const { stdout } = await execPromise(command);
    const result = JSON.parse(stdout);
    
    if (result.events && result.events.length > 0) {
      const events = result.events.map((event: any) => ({
        timestamp: event.timestamp,
        message: event.message
      }));
      
      lambdaExecutions.push({
        requestId,
        startTime: events[0].timestamp,
        events
      });
    }
  }
  
  return lambdaExecutions;
}

/**
 * Build AWS CLI command to get all logs for a specific request ID
 */
function buildRequestLogCommand(requestId: string, options: SearchOptions): string {
  let command = 'aws logs filter-log-events';
  command += ` --log-group-name "${options.logGroup}"`;
  command += ` --filter-pattern "RequestId: ${requestId}"`;
  
  // Add time range if specified
  if (options.from) {
    const startTime = parseTimestamp(options.from);
    command += ` --start-time ${startTime}`;
  }
  
  if (options.to) {
    const endTime = parseTimestamp(options.to);
    command += ` --end-time ${endTime}`;
  }
  
  // Add AWS profile if specified
  if (options.profile) {
    command += ` --profile ${options.profile}`;
  }
  
  // Add AWS region if specified
  if (options.region) {
    command += ` --region ${options.region}`;
  }
  
  return command;
}

/**
 * Save execution logs to a file
 */
async function saveExecutionLogs(execution: LambdaExecution, destinationDir: string): Promise<void> {
  const timestamp = new Date(execution.startTime).toISOString().replace(/:/g, '-');
  const filename = `${timestamp}_${execution.requestId}.log`;
  const filePath = join(destinationDir, filename);
  
  // Format log content
  const content = execution.events
    .map(event => {
      const date = new Date(event.timestamp).toISOString();
      return `[${date}] ${event.message}`;
    })
    .join('\n');
  
  await writeFile(filePath, content, 'utf-8');
}