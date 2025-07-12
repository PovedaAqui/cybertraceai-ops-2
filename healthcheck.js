#!/usr/bin/env node

/**
 * Health check script for CyberTrace AI Docker container
 * This script is used by Docker's HEALTHCHECK instruction to monitor application health
 */

const http = require('http');
const { Client } = require('pg');

// Configuration
const config = {
  app: {
    host: process.env.HOSTNAME || 'localhost',
    port: process.env.PORT || 3000,
    timeout: 5000
  },
  database: {
    url: process.env.POSTGRES_URL
  }
};

// Utility function for logging
const log = (message, isError = false) => {
  const timestamp = new Date().toISOString();
  const stream = isError ? process.stderr : process.stdout;
  stream.write(`[${timestamp}] HEALTHCHECK: ${message}\n`);
};

// Check HTTP server health
const checkHTTPServer = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: config.app.host,
      port: config.app.port,
      path: '/',
      method: 'GET',
      timeout: config.app.timeout,
      headers: {
        'User-Agent': 'Docker-Healthcheck/1.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 500) {
          resolve({
            status: 'healthy',
            statusCode: res.statusCode,
            responseTime: Date.now() - startTime
          });
        } else {
          reject(new Error(`HTTP server returned status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`HTTP request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('HTTP request timed out'));
    });

    const startTime = Date.now();
    req.end();
  });
};

// Check database connectivity (if configured)
const checkDatabase = () => {
  if (!config.database.url) {
    return Promise.resolve({
      status: 'skipped',
      reason: 'Database URL not configured'
    });
  }

  return new Promise((resolve, reject) => {
    const client = new Client({
      connectionString: config.database.url,
      connectionTimeoutMillis: 3000,
      query_timeout: 2000,
      statement_timeout: 2000
    });

    const startTime = Date.now();

    client.connect()
      .then(() => {
        return client.query('SELECT 1 as health_check');
      })
      .then((result) => {
        const responseTime = Date.now() - startTime;
        client.end().catch(() => {}); // Ignore close errors
        
        if (result.rows[0]?.health_check === 1) {
          resolve({
            status: 'healthy',
            responseTime: responseTime
          });
        } else {
          reject(new Error('Database query returned unexpected result'));
        }
      })
      .catch((error) => {
        client.end().catch(() => {}); // Ignore close errors
        reject(new Error(`Database check failed: ${error.message}`));
      });
  });
};

// Check critical environment variables
const checkEnvironment = () => {
  const criticalEnvVars = [
    'POSTGRES_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  const missingVars = criticalEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    return Promise.reject(new Error(`Missing critical environment variables: ${missingVars.join(', ')}`));
  }

  return Promise.resolve({
    status: 'healthy',
    message: 'All critical environment variables are set'
  });
};

// Main health check function
const performHealthCheck = async () => {
  const checks = {
    environment: null,
    http: null,
    database: null
  };

  let hasErrors = false;

  try {
    log('Starting health check...');

    // Check environment variables
    try {
      checks.environment = await checkEnvironment();
      log(`✓ Environment: ${checks.environment.status}`);
    } catch (error) {
      checks.environment = { status: 'unhealthy', error: error.message };
      log(`✗ Environment: ${error.message}`, true);
      hasErrors = true;
    }

    // Check HTTP server
    try {
      checks.http = await checkHTTPServer();
      log(`✓ HTTP Server: ${checks.http.status} (${checks.http.statusCode}, ${checks.http.responseTime}ms)`);
    } catch (error) {
      checks.http = { status: 'unhealthy', error: error.message };
      log(`✗ HTTP Server: ${error.message}`, true);
      hasErrors = true;
    }

    // Check database
    try {
      checks.database = await checkDatabase();
      if (checks.database.status === 'skipped') {
        log(`- Database: ${checks.database.reason}`);
      } else {
        log(`✓ Database: ${checks.database.status} (${checks.database.responseTime}ms)`);
      }
    } catch (error) {
      checks.database = { status: 'unhealthy', error: error.message };
      log(`✗ Database: ${error.message}`, true);
      hasErrors = true;
    }

    // Summary
    if (hasErrors) {
      log('Health check FAILED - some components are unhealthy', true);
      process.exit(1);
    } else {
      log('Health check PASSED - all components are healthy');
      process.exit(0);
    }

  } catch (error) {
    log(`Health check ERROR: ${error.message}`, true);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log(`Uncaught exception during health check: ${error.message}`, true);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log(`Unhandled rejection during health check: ${reason}`, true);
  process.exit(1);
});

// Set timeout for the entire health check
setTimeout(() => {
  log('Health check timed out', true);
  process.exit(1);
}, 10000); // 10 second total timeout

// Run the health check
performHealthCheck();