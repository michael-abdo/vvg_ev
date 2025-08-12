#!/usr/bin/env tsx
/**
 * SMTP Email Test Script
 * 
 * This script tests the email service configuration and SMTP connectivity.
 * It verifies that AWS SES SMTP credentials are properly configured
 * and can send test emails.
 * 
 * Usage: npx tsx scripts/test-smtp-email.ts
 */

import dotenv from 'dotenv'
import * as nodemailer from 'nodemailer'
import { config } from '../src/lib/config'

// Load environment variables
dotenv.config({ path: '.env.local' })

interface TestResult {
  test: string
  status: 'success' | 'failure'
  message: string
  details?: any
}

const results: TestResult[] = []

async function log(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m'
  }
  const reset = '\x1b[0m'
  console.log(`${colors[type]}${message}${reset}`)
}

async function testSmtpConnection() {
  const testName = 'SMTP Connection Test'
  log(`\n📧 Running ${testName}...`)

  try {
    const smtpConfig = {
      host: process.env.AWS_SES_SMTP_HOST || config.email.smtp.host,
      port: parseInt(process.env.AWS_SES_SMTP_PORT || String(config.email.smtp.port), 10),
      secure: false,
      auth: {
        user: process.env.AWS_SES_SMTP_USERNAME || config.email.smtp.username,
        pass: process.env.AWS_SES_SMTP_PASSWORD || config.email.smtp.password
      }
    }

    // Check if credentials are configured
    if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
      throw new Error('SMTP credentials not configured. Please set AWS_SES_SMTP_USERNAME and AWS_SES_SMTP_PASSWORD in .env.local')
    }

    log(`Host: ${smtpConfig.host}`)
    log(`Port: ${smtpConfig.port}`)
    log(`Username: ${smtpConfig.auth.user ? '***' + smtpConfig.auth.user.slice(-4) : 'Not set'}`)

    const transporter = nodemailer.createTransport(smtpConfig)

    // Verify connection
    await transporter.verify()
    
    results.push({
      test: testName,
      status: 'success',
      message: 'SMTP connection verified successfully',
      details: {
        host: smtpConfig.host,
        port: smtpConfig.port
      }
    })

    log('✅ SMTP connection successful!', 'success')
    return transporter
  } catch (error) {
    results.push({
      test: testName,
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error
    })
    
    log(`❌ SMTP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    return null
  }
}

async function sendTestEmail(transporter: nodemailer.Transporter | null) {
  const testName = 'Send Test Email'
  log(`\n📨 Running ${testName}...`)

  if (!transporter) {
    results.push({
      test: testName,
      status: 'failure',
      message: 'No transporter available (SMTP connection failed)',
      details: null
    })
    log('❌ Cannot send test email without valid SMTP connection', 'error')
    return
  }

  try {
    const fromEmail = process.env.SES_FROM_EMAIL || config.email.from
    const testRecipient = process.env.SES_TEST_RECIPIENT || config.email.testRecipient || process.env.ADMIN_EMAIL || config.email.adminEmail

    if (!testRecipient) {
      throw new Error('No test recipient configured. Please set SES_TEST_RECIPIENT or ADMIN_EMAIL in .env.local')
    }

    log(`From: ${fromEmail}`)
    log(`To: ${testRecipient}`)

    const mailOptions = {
      from: fromEmail,
      to: testRecipient,
      subject: `Test Email - ${config.app.name || 'VVG Template'} (${new Date().toLocaleString()})`,
      text: `This is a test email from the ${config.app.name || 'VVG Template'} email service.\n\nIf you received this email, your SMTP configuration is working correctly!\n\nTimestamp: ${new Date().toISOString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #152C5B;">Email Service Test</h1>
          <p style="color: #333; line-height: 1.6;">
            This is a test email from the <strong>${config.app.name || 'VVG Template'}</strong> email service.
          </p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #666;">
              <strong>Timestamp:</strong> ${new Date().toLocaleString()}<br>
              <strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}<br>
              <strong>From:</strong> ${fromEmail}<br>
              <strong>To:</strong> ${testRecipient}
            </p>
          </div>
          <p style="color: #28a745; font-weight: bold;">
            ✅ If you received this email, your SMTP configuration is working correctly!
          </p>
        </div>
      `
    }

    const info = await transporter.sendMail(mailOptions)

    results.push({
      test: testName,
      status: 'success',
      message: 'Test email sent successfully',
      details: {
        messageId: info.messageId,
        response: info.response,
        accepted: info.accepted,
        rejected: info.rejected
      }
    })

    log(`✅ Test email sent successfully!`, 'success')
    log(`Message ID: ${info.messageId}`)
  } catch (error) {
    results.push({
      test: testName,
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error
    })
    
    log(`❌ Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
  }
}

async function testEmailServiceIntegration() {
  const testName = 'Email Service Integration Test'
  log(`\n🔧 Running ${testName}...`)

  try {
    // Import the email service
    const { emailService } = await import('../src/lib/services/email-service')

    // Test connection
    const connectionOk = await emailService.verifyConnection()
    
    if (!connectionOk) {
      throw new Error('Email service connection verification failed')
    }

    // Send test email
    const result = await emailService.testEmail()

    if (!result.success) {
      throw new Error(result.error || 'Test email failed')
    }

    results.push({
      test: testName,
      status: 'success',
      message: 'Email service integration test passed',
      details: {
        messageId: result.messageId
      }
    })

    log('✅ Email service integration test successful!', 'success')
  } catch (error) {
    results.push({
      test: testName,
      status: 'failure',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error
    })
    
    log(`❌ Email service integration test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
  }
}

function displayEnvironmentInfo() {
  log('\n🔍 Environment Information:', 'info')
  log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
  log(`ENABLE_EMAIL_IN_DEV: ${process.env.ENABLE_EMAIL_IN_DEV || 'false'}`)
  log(`AWS_REGION: ${process.env.AWS_REGION || 'us-east-1'}`)
  log(`Project Name: ${config.app.name || 'Not set'}`)
}

function displayResults() {
  log('\n📊 Test Results Summary:', 'info')
  log('=' .repeat(50))
  
  results.forEach(result => {
    const icon = result.status === 'success' ? '✅' : '❌'
    const color = result.status === 'success' ? 'success' : 'error'
    log(`${icon} ${result.test}: ${result.message}`, color)
  })
  
  const successCount = results.filter(r => r.status === 'success').length
  const totalCount = results.length
  
  log('=' .repeat(50))
  log(`\nTotal: ${successCount}/${totalCount} tests passed`, successCount === totalCount ? 'success' : 'error')
}

async function main() {
  log('🚀 Starting Email Service Test Suite', 'info')
  log('=' .repeat(50))
  
  displayEnvironmentInfo()
  
  // Run tests
  const transporter = await testSmtpConnection()
  await sendTestEmail(transporter)
  await testEmailServiceIntegration()
  
  // Display results
  displayResults()
  
  // Exit with appropriate code
  const allPassed = results.every(r => r.status === 'success')
  process.exit(allPassed ? 0 : 1)
}

// Run the tests
main().catch((error) => {
  log(`\n💥 Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
  process.exit(1)
})