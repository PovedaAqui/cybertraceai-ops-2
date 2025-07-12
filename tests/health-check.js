#!/usr/bin/env node

const axios = require('axios');
const { Client } = require('pg');

// Configuration
const config = {
  app: {
    url: process.env.TEST_APP_URL || 'http://app:3000',
    timeout: 10000
  },
  database: {
    url: process.env.TEST_DB_URL || 'postgresql://postgres:cybertraceai2024@database:5432/cybertraceai_test'
  },
  mcp: {
    url: process.env.TEST_MCP_URL || 'http://suzieq-mcp:8000'
  }
};

// Health check functions
const checkApplication = async () => {
  try {
    const response = await axios.get(config.app.url, {
      timeout: config.app.timeout,
      validateStatus: (status) => status < 500
    });
    
    return {
      service: 'application',
      status: 'healthy',
      details: {
        statusCode: response.status,
        responseTime: response.headers['x-response-time'] || 'unknown'
      }
    };
  } catch (error) {
    return {
      service: 'application',
      status: 'unhealthy',
      error: error.message,
      details: {
        code: error.code,
        statusCode: error.response?.status
      }
    };
  }
};

const checkDatabase = async () => {
  const client = new Client({ connectionString: config.database.url });
  
  try {
    const startTime = Date.now();
    await client.connect();
    
    // Simple query to test database
    const result = await client.query('SELECT 1 as test');
    const responseTime = Date.now() - startTime;
    
    await client.end();
    
    return {
      service: 'database',
      status: 'healthy',
      details: {
        responseTime: `${responseTime}ms`,
        result: result.rows[0]?.test === 1
      }
    };
  } catch (error) {
    await client.end().catch(() => {});
    
    return {
      service: 'database',
      status: 'unhealthy',
      error: error.message,
      details: {
        code: error.code
      }
    };
  }
};

const checkSuzieQMCP = async () => {
  try {
    const startTime = Date.now();
    
    // Try health endpoint first
    let response;
    try {
      response = await axios.get(`${config.mcp.url}/health`, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
    } catch (healthError) {
      // If health endpoint doesn't exist, try root
      response = await axios.get(config.mcp.url, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      service: 'suzieq-mcp',
      status: 'healthy',
      details: {
        statusCode: response.status,
        responseTime: `${responseTime}ms`
      }
    };
  } catch (error) {
    return {
      service: 'suzieq-mcp',
      status: 'unhealthy',
      error: error.message,
      details: {
        code: error.code,
        statusCode: error.response?.status
      }
    };
  }
};

// Main health check
const runHealthCheck = async () => {
  console.log('🏥 CyberTrace AI Health Check');
  console.log('============================');
  
  const checks = [
    checkApplication(),
    checkDatabase(),
    checkSuzieQMCP()
  ];
  
  const results = await Promise.all(checks);
  
  let allHealthy = true;
  
  results.forEach(result => {
    const status = result.status === 'healthy' ? '✅' : '❌';
    console.log(`${status} ${result.service}: ${result.status}`);
    
    if (result.details) {
      Object.entries(result.details).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
      allHealthy = false;
    }
    
    console.log('');
  });
  
  const overallStatus = allHealthy ? 'HEALTHY' : 'UNHEALTHY';
  const statusIcon = allHealthy ? '🎉' : '⚠️';
  
  console.log(`${statusIcon} Overall Status: ${overallStatus}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  // Return appropriate exit code
  process.exit(allHealthy ? 0 : 1);
};

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception during health check:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection during health check:', reason);
  process.exit(1);
});

// Run health check
runHealthCheck().catch((error) => {
  console.error('❌ Health check failed:', error.message);
  process.exit(1);
});