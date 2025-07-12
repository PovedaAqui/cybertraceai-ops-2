#!/usr/bin/env node

const axios = require('axios');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration from environment
const config = {
  app: {
    url: process.env.TEST_APP_URL || 'http://app:3000',
    timeout: 30000
  },
  database: {
    url: process.env.TEST_DB_URL || 'postgresql://postgres:cybertraceai2024@database:5432/cybertraceai_test'
  },
  mcp: {
    url: process.env.TEST_MCP_URL || 'http://suzieq-mcp:8000'
  }
};

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📝',
    pass: '✅',
    fail: '❌',
    warn: '⚠️'
  }[type] || '📝';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
};

const runTest = async (name, testFn) => {
  testResults.total++;
  log(`Running test: ${name}`);
  
  try {
    await testFn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASS', error: null });
    log(`PASS: ${name}`, 'pass');
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAIL', error: error.message });
    log(`FAIL: ${name} - ${error.message}`, 'fail');
  }
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
const testDatabaseConnection = async () => {
  const client = new Client({ connectionString: config.database.url });
  
  try {
    await client.connect();
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time');
    if (!result.rows[0].current_time) {
      throw new Error('Database query did not return expected result');
    }
    
    await client.end();
  } catch (error) {
    await client.end().catch(() => {});
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

const testApplicationHealth = async () => {
  const maxRetries = 15;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await axios.get(config.app.url, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      if (response.status >= 200 && response.status < 400) {
        return; // Success
      }
    } catch (error) {
      // Continue retrying
    }
    
    retries++;
    await wait(2000);
  }
  
  throw new Error(`Application health check failed after ${maxRetries} retries`);
};

const testApplicationAPI = async () => {
  try {
    // Test if the app responds to requests
    const response = await axios.get(config.app.url, {
      timeout: config.app.timeout,
      validateStatus: (status) => status < 500
    });
    
    if (response.status >= 500) {
      throw new Error(`Application returned server error: ${response.status}`);
    }
    
    // Check if it's a Next.js application by looking for typical headers or content
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('text/html')) {
      throw new Error('Application did not return HTML content');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Application is not accepting connections');
    }
    throw error;
  }
};

const testSuzieQMCP = async () => {
  try {
    // Test if SuzieQ MCP service is responding
    const response = await axios.get(`${config.mcp.url}/health`, {
      timeout: 10000,
      validateStatus: (status) => status < 500
    });
    
    if (response.status >= 400) {
      // If health endpoint doesn't exist, try root endpoint
      const rootResponse = await axios.get(config.mcp.url, {
        timeout: 10000,
        validateStatus: (status) => status < 500
      });
      
      if (rootResponse.status >= 500) {
        throw new Error(`SuzieQ MCP service returned error: ${rootResponse.status}`);
      }
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('SuzieQ MCP service is not accepting connections');
    }
    if (error.code === 'ENOTFOUND') {
      throw new Error('SuzieQ MCP service hostname not found');
    }
    throw error;
  }
};

const testEnvironmentVariables = async () => {
  const requiredEnvVars = [
    'TEST_APP_URL',
    'TEST_DB_URL',
    'TEST_MCP_URL'
  ];
  
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

const testDatabaseMigrations = async () => {
  const client = new Client({ connectionString: config.database.url });
  
  try {
    await client.connect();
    
    // Check if main tables exist (based on schema)
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const result = await client.query(tablesQuery);
    const tables = result.rows.map(row => row.table_name);
    
    // Expected tables from the schema
    const expectedTables = ['User', 'Account', 'Session', 'VerificationToken', 'Chat', 'Message'];
    const missingTables = expectedTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      throw new Error(`Missing database tables: ${missingTables.join(', ')}`);
    }
    
    await client.end();
  } catch (error) {
    await client.end().catch(() => {});
    throw error;
  }
};

const testIntegration = async () => {
  // Test basic integration by making a request that would involve multiple services
  try {
    const response = await axios.get(config.app.url, {
      timeout: config.app.timeout,
      validateStatus: (status) => status < 500
    });
    
    // Check if the response contains expected elements
    const responseText = typeof response.data === 'string' ? response.data : '';
    
    if (!responseText.includes('CyberTrace') && !responseText.includes('cybertraceai')) {
      log('Warning: Application response does not contain expected content', 'warn');
    }
    
  } catch (error) {
    throw new Error(`Integration test failed: ${error.message}`);
  }
};

// Save test results
const saveTestResults = () => {
  const resultsDir = '/app/test-results';
  const resultsFile = path.join(resultsDir, 'test-results.json');
  
  try {
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const results = {
      ...testResults,
      timestamp: new Date().toISOString(),
      config: {
        appUrl: config.app.url,
        dbUrl: config.database.url.replace(/\/\/.*@/, '//***@'), // Hide credentials
        mcpUrl: config.mcp.url
      }
    };
    
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    log(`Test results saved to ${resultsFile}`);
  } catch (error) {
    log(`Failed to save test results: ${error.message}`, 'warn');
  }
};

// Main test runner
const main = async () => {
  log('🧪 Starting CyberTrace AI Test Suite');
  log('=====================================');
  
  const startTime = Date.now();
  
  // Run all tests
  await runTest('Environment Variables', testEnvironmentVariables);
  await runTest('Database Connection', testDatabaseConnection);
  await runTest('Database Migrations', testDatabaseMigrations);
  await runTest('Application Health', testApplicationHealth);
  await runTest('Application API', testApplicationAPI);
  await runTest('SuzieQ MCP Service', testSuzieQMCP);
  await runTest('Integration Test', testIntegration);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Print summary
  log('=====================================');
  log('📊 Test Summary');
  log(`Total tests: ${testResults.total}`);
  log(`Passed: ${testResults.passed}`, testResults.passed === testResults.total ? 'pass' : 'info');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'fail' : 'info');
  log(`Duration: ${duration}s`);
  
  if (testResults.failed > 0) {
    log('Failed tests:', 'fail');
    testResults.tests
      .filter(test => test.status === 'FAIL')
      .forEach(test => log(`  - ${test.name}: ${test.error}`, 'fail'));
  }
  
  // Save results
  saveTestResults();
  
  if (testResults.failed === 0) {
    log('🎉 All tests passed! CyberTrace AI is ready to use.', 'pass');
    process.exit(0);
  } else {
    log('❌ Some tests failed. Check the output above for details.', 'fail');
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'fail');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log(`Unhandled rejection: ${reason}`, 'fail');
  process.exit(1);
});

// Run the test suite
main().catch((error) => {
  log(`Test suite failed: ${error.message}`, 'fail');
  process.exit(1);
});