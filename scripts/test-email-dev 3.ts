#!/usr/bin/env tsx
/**
 * Development Email Test
 * This script demonstrates email functionality in development mode
 */

import { emailService } from '../src/lib/services/email-service'

async function testEmailToDeveloper() {
  console.log('🧪 Testing email in development mode...\n')
  
  const testMessage = {
    to: 'michaelabdo@vvgtruck.com',
    subject: 'Test Email from VVG Template',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #152C5B;">Hello from VVG Template!</h1>
        <p>This is a test email to verify the email integration is working correctly.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Email Integration Features:</h3>
          <ul>
            <li>✅ AWS SES SMTP Integration</li>
            <li>✅ Environment-aware email handling</li>
            <li>✅ HTML email templates</li>
            <li>✅ Bulk email sending via API</li>
            <li>✅ Development mode interception</li>
          </ul>
        </div>
        <p>To actually send emails, configure your AWS SES SMTP credentials in .env.local</p>
      </div>
    `,
    text: 'This is a test email from VVG Template. The email integration is ready to use!'
  }

  const result = await emailService.sendEmail(testMessage)
  
  if (result.success) {
    console.log('✅ Email would be sent successfully!')
    console.log('Message ID:', result.messageId)
  } else {
    console.log('❌ Email sending failed:', result.error)
  }

  // Also test the notification method
  console.log('\n🔔 Testing notification email...')
  const notificationResult = await emailService.sendNotification(
    'michaelabdo@vvgtruck.com',
    'VVG Template Notification Test',
    'This is a test notification from the VVG Template email service.',
    false
  )
  
  console.log('Notification result:', notificationResult.success ? '✅ Success' : '❌ Failed')

  // Test system alert
  console.log('\n🚨 Testing system alert...')
  const alertResult = await emailService.sendSystemAlert(
    'Test Alert from VVG Template',
    'This is a test system alert. The email integration is working properly.',
    'high'
  )
  
  console.log('Alert result:', alertResult.success ? '✅ Success' : '❌ Failed')
}

// Run the test
testEmailToDeveloper().catch(console.error)