/**
 * Simple ASI:One API Connection Test
 * Test basic authentication and API access
 */

import fetch from 'node-fetch'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const API_KEY = process.env.NEXT_PUBLIC_ASI_API_KEY
console.log('🔍 API Key Check:', {
  hasKey: !!API_KEY,
  length: API_KEY?.length || 0,
  prefix: API_KEY?.substring(0, 15) || 'none'
})

async function testASIConnection() {
  console.log('🔗 Testing ASI:One API Connection...')
  
  try {
    const response = await fetch('https://api.asi1.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'asi1-mini',
        messages: [
          {
            role: 'user',
            content: 'Hello, respond with "Connection successful"'
          }
        ],
        max_tokens: 50
      })
    })

    console.log('📊 Response Status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Success! Response:', JSON.stringify(data, null, 2))
    } else {
      const errorText = await response.text()
      console.log('❌ Error Response:', errorText)
    }
  } catch (error) {
    console.error('💥 Connection Error:', error.message)
  }
}

testASIConnection()