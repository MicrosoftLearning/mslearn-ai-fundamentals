# Model Quickstart

This sample demonstrates how to build a real-time voice assistant using direct VoiceLive model integration. It provides a straightforward approach without agent overhead, ideal for scenarios where you want full control over model selection and instructions.

It showcases:

- **Direct Model Access**: Connects directly to VoiceLive models (e.g., GPT-realtime)
- **Custom Instructions**: Define your own system instructions for the AI
- **Flexible Authentication**: Supports both API key and Azure credential authentication
- **Model Selection**: Choose from available VoiceLive models

> **Note**: This sample needs access to your local microphone and speakers. If running in a remote environment, switch to your desktop VS Code: use the "_Continue on Desktop_" status bar action or open the Command Palette (Ctrl+Shift+P) and run "_Continue on Desktop_" before executing the sample.

### Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- Audio input/output devices (microphone and speakers)
- [Azure subscription](https://azure.microsoft.com/free/) - Create one for free
- [AI Foundry resource](https://learn.microsoft.com/en-us/azure/ai-services/multi-service-resource)
- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli) for authentication

### Quick Start

1. **Authenticate with Azure**:

   ```bash
   az login
   ```

2. **Create and activate virtual environment**:

   ```bash
   python -m venv .venv

   # On Windows
   .venv\Scripts\activate

   # On Linux/macOS
   source .venv/bin/activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

4. **Update `.env` file**:

   ```plaintext
   AZURE_VOICELIVE_ENDPOINT=https://your-endpoint.services.ai.azure.com/
   AZURE_VOICELIVE_API_VERSION=2025-10-01
   ```

5. **Run the sample**:
   ```bash
   python codeSample.py
   ```

### Command Line Options

```bash
# Run with settings from .env
python codeSample.py

# Run with custom voice and verbose logging
python codeSample.py --voice en-US-JennyNeural -v
```

#### Available Options

- `--api-key`: Azure VoiceLive API key
- `--endpoint`: Azure VoiceLive endpoint URL
- `--model`: VoiceLive model to use (default: "gpt-realtime")
- `--voice`: Voice for the assistant (default: "en-US-AvaNeural")
- `--instructions`: Custom system instructions for the AI
- `--use-token-credential`: Use Azure authentication instead of API key
- `--verbose`: Enable detailed logging

#### Available Models

- `gpt-realtime` - Latest GPT-realtime model (recommended)
- `gpt-4.1` - GPT-4.1 LLM model
- See documentation for all available models

### Available Voices

Popular neural voice options include:

- `en-US-AvaNeural` - Female, conversational
- `en-US-AndrewNeural` - Male, conversational
- `en-US-JennyNeural` - Female, friendly
- `en-US-GuyNeural` - Male, professional
- `en-US-AriaNeural` - Female, cheerful
- `en-US-DavisNeural` - Male, calm

See the [Azure Neural Voice Gallery](https://speech.microsoft.com/portal/voicegallery) for all available voices.

### Troubleshooting

#### Audio Issues

- **No audio input/output**: Verify your microphone and speakers are working and set as default devices
- **PyAudio installation errors**:
  - On Windows: Install via `pip install pyaudio`
  - On Linux: `sudo apt-get install python3-pyaudio` or `pip install pyaudio`
  - On macOS: `brew install portaudio && pip install pyaudio`
- **Audio device busy**: Close other applications using your audio devices (e.g., Teams, Zoom)
- **Poor audio quality**: Update your audio drivers to the latest version

#### Authentication Issues

- **401 Unauthorized**:
  - For Azure auth: Run `az login` to authenticate with Azure CLI
- **Token credential fails**: Ensure Azure CLI is installed and you're logged in

#### Connection Issues

- **Endpoint errors**: Verify your endpoint URL format in `.env`: `https://your-endpoint.services.ai.azure.com/`
- **WebSocket timeout**: Check your network connection and firewall settings
- **Certificate errors**: Ensure your system certificates are up to date
- **Model not available** (Model samples): Verify your Speech resource has VoiceLive enabled

### Python Environment Issues

- **Module not found**: Run `pip install -r requirements.txt` to install dependencies
- **Python version**: Verify Python 3.8 or later is installed: `python --version`
- **Virtual environment**: Use a virtual environment to avoid package conflicts
- **Import errors**: Ensure you're in the correct directory and virtual environment is activated

### Additional Resources

- [Voice Live Documentation](https://learn.microsoft.com/azure/ai-services/speech-service/voice-live)
- [Python SDK Documentation](https://learn.microsoft.com/en-us/python/api/overview/azure/ai-voicelive-readme)
- [Support Guide](../../SUPPORT.md)
