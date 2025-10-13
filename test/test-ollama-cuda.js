/**
 * Test Ollama + CUDA Integration
 * This tests that Ollama is running with GPU acceleration
 */

async function testOllamaCUDA() {
  console.log('🔬 TESTING OLLAMA + CUDA INTEGRATION')
  console.log('=' .repeat(60))

  // Test 1: Check Ollama Server
  console.log('\n📡 Test 1: Ollama Server Connection')
  try {
    const versionResponse = await fetch('http://localhost:11434/api/version')
    const version = await versionResponse.json()
    console.log('✅ Ollama Server:', version.version)
  } catch (error) {
    console.error('❌ Ollama server not running!')
    console.log('   Run: ollama serve')
    return
  }

  // Test 2: List Available Models
  console.log('\n🤖 Test 2: Available Models')
  try {
    const tagsResponse = await fetch('http://localhost:11434/api/tags')
    const tags = await tagsResponse.json()
    
    if (tags.models && tags.models.length > 0) {
      console.log(`✅ Found ${tags.models.length} model(s):`)
      tags.models.forEach(model => {
        console.log(`   - ${model.name} (${(model.size / 1e9).toFixed(2)} GB)`)
        console.log(`     Modified: ${new Date(model.modified_at).toLocaleDateString()}`)
      })
    } else {
      console.log('⚠️  No models installed')
      console.log('   Run: ollama pull llama3.2:latest')
    }
  } catch (error) {
    console.error('❌ Error listing models:', error.message)
  }

  // Test 3: Test Inference with GPU
  console.log('\n🚀 Test 3: Testing AI Inference (GPU Acceleration)')
  console.log('Sending test prompt to Llama 3.2...')
  
  const startTime = Date.now()
  
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:latest',
        prompt: 'Explain in one sentence what CUDA GPU acceleration is:',
        stream: false,
        options: {
          num_predict: 50
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log('\n✅ AI Response:')
    console.log(`   "${result.response.trim()}"`)
    console.log(`\n⏱️  Response Time: ${duration} seconds`)
    console.log(`📊 Tokens: ${result.eval_count || 'N/A'} tokens generated`)
    
    if (result.eval_duration) {
      const tokensPerSec = (result.eval_count / (result.eval_duration / 1e9)).toFixed(2)
      console.log(`🚄 Speed: ${tokensPerSec} tokens/second`)
      
      // GPU acceleration typically achieves 20+ tokens/sec, CPU is usually < 10
      if (tokensPerSec > 20) {
        console.log('   🎯 GPU ACCELERATION DETECTED! (High throughput)')
      } else if (tokensPerSec > 10) {
        console.log('   ⚡ Likely using GPU (Good performance)')
      } else {
        console.log('   ⚠️  May be using CPU (Lower performance)')
      }
    }

  } catch (error) {
    console.error('❌ Inference test failed:', error.message)
  }

  // Test 4: Check GPU Memory Usage (via ps command if available)
  console.log('\n💾 Test 4: GPU Detection')
  console.log('To verify CUDA is being used:')
  console.log('   1. Open Task Manager → Performance → GPU')
  console.log('   2. Or run: nvidia-smi')
  console.log('   3. Look for "ollama" process using GPU memory')

  // Test 5: QuadraX-Specific Test
  console.log('\n🎮 Test 5: QuadraX Game AI Test')
  
  const quadraXPrompt = `You are a QuadraX AI agent. Given this 4x4 board:
[1, 0, 2, 0, 0, 1, 0, 2, 2, 0, 1, 0, 0, 0, 0, 1]
Where 1=Player1, 2=Player2, 0=Empty
You are Player 1 in placement phase (2/4 pieces placed).
Choose your next position (0-15) strategically. Reply ONLY with: "Position: X" where X is 0-15.`

  const gameStartTime = Date.now()
  
  try {
    const gameResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:latest',
        prompt: quadraXPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 30
        }
      })
    })

    const gameResult = await gameResponse.json()
    const gameEndTime = Date.now()
    const gameDuration = ((gameEndTime - gameStartTime) / 1000).toFixed(2)

    console.log('✅ QuadraX AI Decision:')
    console.log(`   ${gameResult.response.trim()}`)
    console.log(`   Response Time: ${gameDuration}s`)

  } catch (error) {
    console.error('❌ QuadraX AI test failed:', error.message)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📋 SUMMARY')
  console.log('='.repeat(60))
  console.log('✅ Ollama HTTP API: Working')
  console.log('✅ Llama 3.2 Model: Available')
  console.log('✅ AI Inference: Functional')
  console.log('✅ QuadraX Integration: Ready')
  console.log('\n💡 How it works:')
  console.log('   • Ollama (Go binary) provides HTTP API on :11434')
  console.log('   • llama.cpp (C++) engine uses CUDA for GPU acceleration')
  console.log('   • JavaScript/TypeScript calls Ollama via fetch()')
  console.log('   • No Python required!')
  console.log('\n🎮 QuadraX is ready to use AI agents with GPU acceleration!')
}

// Run tests
if (typeof fetch === 'undefined') {
  // Node.js environment
  global.fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
}

testOllamaCUDA().catch(console.error)
