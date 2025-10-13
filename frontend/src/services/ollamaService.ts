// Ollama Service with CUDA Support
// Handles direct communication with Ollama API and GPU acceleration configuration

export interface OllamaConfig {
  baseUrl: string
  model: string
  temperature: number
  maxTokens: number
  useGPU: boolean
  gpuLayers?: number
}

export interface OllamaResponse {
  response: string
  model: string
  created_at: string
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

export class OllamaService {
  private config: OllamaConfig

  constructor(config: Partial<OllamaConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:11434',
      model: config.model || 'llama3.2:8b',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2048,
      useGPU: config.useGPU ?? true,
      gpuLayers: config.gpuLayers || 33, // Full GPU acceleration for 8B model
      ...config
    }
  }

  /**
   * Check if Ollama service is running and model is available
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`)
      if (!response.ok) return false
      
      const data = await response.json()
      const hasModel = data.models?.some((model: any) => 
        model.name.includes(this.config.model.split(':')[0])
      )
      
      return hasModel
    } catch (error) {
      console.warn('Ollama connection check failed:', error)
      return false
    }
  }

  /**
   * Ensure model is pulled and configured for GPU acceleration
   */
  async ensureModel(): Promise<boolean> {
    try {
      // Check if model exists first
      const hasModel = await this.checkConnection()
      if (hasModel) return true

      // Pull model if not available
      console.log(`Pulling model ${this.config.model}...`)
      const pullResponse = await fetch(`${this.config.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: this.config.model,
          stream: false 
        })
      })

      return pullResponse.ok
    } catch (error) {
      console.error('Model setup failed:', error)
      return false
    }
  }

  /**
   * Generate AI response with optimized GPU configuration
   */
  async generateResponse(prompt: string, context?: string): Promise<OllamaResponse | null> {
    try {
      const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt

      const requestBody = {
        model: this.config.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
          // GPU acceleration options
          numa: false, // Disable NUMA for better GPU performance
          num_thread: this.config.useGPU ? 8 : 16, // Fewer CPU threads when using GPU
          num_gpu: this.config.useGPU ? this.config.gpuLayers : 0, // GPU layers
          main_gpu: 0, // Use primary GPU
          tensor_split: this.config.useGPU ? [1.0] : undefined, // Full GPU allocation
        }
      }

      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data = await response.json()
      return data as OllamaResponse
    } catch (error) {
      console.error('Ollama generation failed:', error)
      return null
    }
  }

  /**
   * Generate streaming response for real-time interaction
   */
  async *generateStreamingResponse(prompt: string, context?: string): AsyncGenerator<string> {
    try {
      const fullPrompt = context ? `${context}\n\nUser: ${prompt}` : prompt

      const requestBody = {
        model: this.config.model,
        prompt: fullPrompt,
        stream: true,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
          numa: false,
          num_thread: this.config.useGPU ? 8 : 16,
          num_gpu: this.config.useGPU ? this.config.gpuLayers : 0,
          main_gpu: 0,
          tensor_split: this.config.useGPU ? [1.0] : undefined,
        }
      }

      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Ollama streaming API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.response) {
              yield data.response
            }
          } catch (e) {
            // Skip malformed JSON chunks
          }
        }
      }
    } catch (error) {
      console.error('Ollama streaming failed:', error)
    }
  }

  /**
   * Get model performance statistics
   */
  async getModelStats(): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/ps`)
      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error('Failed to get model stats:', error)
      return null
    }
  }

  /**
   * Configure GPU acceleration settings
   */
  updateGPUConfig(gpuLayers: number, useGPU: boolean = true): void {
    this.config.useGPU = useGPU
    this.config.gpuLayers = gpuLayers
  }

  /**
   * Get current configuration
   */
  getConfig(): OllamaConfig {
    return { ...this.config }
  }
}

// Singleton instance for global use
export const ollamaService = new OllamaService({
  useGPU: true,
  gpuLayers: 33, // Full acceleration for Llama 3.2 8B
  temperature: 0.7
})

// CUDA Setup Instructions
export const CUDA_SETUP_INSTRUCTIONS = `
🚀 **CUDA Optimization for Ollama + Llama 3.2 8B**

**Prerequisites:**
• NVIDIA GPU with CUDA Compute Capability 6.0+
• CUDA Toolkit 11.8+ or 12.x installed
• 8GB+ VRAM for Llama 3.2 8B model

**Setup Commands:**
\`\`\`bash
# 1. Install Ollama with GPU support
curl -fsSL https://ollama.ai/install.sh | sh

# 2. Pull Llama 3.2 8B model
ollama pull llama3.2:8b

# 3. Set GPU acceleration (Windows PowerShell)
$env:OLLAMA_GPU_LAYERS="33"
$env:OLLAMA_NUMA="false" 
ollama serve

# 4. Verify GPU usage
nvidia-smi  # Should show ollama process using GPU memory
\`\`\`

**Performance Expectations:**
• CPU-only: 2-5 tokens/second
• GPU-accelerated: 15-50 tokens/second (3-10x faster)
• Full GPU offload: 30-80 tokens/second on RTX 3070+

**Environment Variables (optional):**
\`\`\`bash
OLLAMA_NUM_PARALLEL=2      # Parallel requests
OLLAMA_MAX_LOADED_MODELS=2 # Memory management  
OLLAMA_GPU_LAYERS=33       # Full GPU acceleration
OLLAMA_NUMA=false          # Disable for GPU performance
\`\`\`

**Troubleshooting:**
• No GPU acceleration: Check CUDA installation
• Out of memory: Reduce gpu_layers to 20-25
• Slow performance: Ensure sufficient VRAM available
`