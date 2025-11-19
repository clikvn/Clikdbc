# OpenAI Assistant API Setup Guide

## Overview
The AI Agent App is now configured to use OpenAI's Assistant API with your custom assistant.

**Assistant ID**: `asst_b3KUyJlXFXQh6pDpS3RGohoT`

## Setup Steps

### 1. Get your OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (it starts with `sk-`)

### 2. Configure Environment Variable

Create a `.env` file in your project root:

```bash
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

Or use the example file:
```bash
cp .env.example .env
```
Then edit `.env` and add your actual API key.

### 3. Restart Development Server

After adding the API key, restart your development server for the changes to take effect:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## How It Works

### Conversation Flow
1. When the AI Agent opens, a new **thread** is created
2. Each message you send is added to that thread
3. The assistant processes the message with context about:
   - The field you're editing (e.g., "Bio", "Professional Title")
   - The current value in that field
   - Your question or request
4. Responses stream back and display in the chat
5. You can apply any suggestion directly to the field with one click

### Features
- ✅ Real-time conversation with OpenAI Assistant
- ✅ Context-aware responses based on the field being edited
- ✅ One-click application of suggestions
- ✅ Persistent conversation history during the session
- ✅ Loading states and error handling
- ✅ Pre-filled messages when clicking the AI icon next to fields

## API Usage & Costs

OpenAI Assistant API charges based on:
- **Tokens processed** (input + output)
- **Runs executed**
- **Storage** (minimal for threads)

Typical costs for this use case are very low, but monitor your usage at:
[OpenAI Usage Dashboard](https://platform.openai.com/usage)

## Security Best Practices

### For Development
- ✅ Use `.env` files (already configured)
- ✅ Never commit API keys to git
- ✅ The `.env` file is gitignored by default

### For Production
⚠️ **Important**: Client-side API keys are exposed in the browser!

For production, you should:
1. **Use a backend proxy** (recommended)
   - Create a serverless function or API endpoint
   - Store the API key securely on the server
   - Have your frontend call your backend, not OpenAI directly

2. **Or use Supabase Edge Functions**
   - Create an edge function that handles OpenAI calls
   - Store the API key in Supabase secrets
   - Call the edge function from your frontend

Example backend proxy (Node.js/Express):
```javascript
app.post('/api/ai-chat', async (req, res) => {
  const { threadId, message } = req.body;
  
  // API key is stored securely on server
  const response = await fetch('https://api.openai.com/v1/threads/...', {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    // ... rest of request
  });
  
  res.json(await response.json());
});
```

## Troubleshooting

### "OpenAI API key not configured"
- Make sure you've created a `.env` file with `VITE_OPENAI_API_KEY`
- Restart your development server after adding the key
- Check that the key starts with `sk-`

### "Failed to connect to AI Agent"
- Verify your API key is correct
- Check your internet connection
- Ensure you have credits in your OpenAI account
- Check the browser console for detailed error messages

### Slow responses
- OpenAI Assistant API can take 2-10 seconds per response
- This is normal and depends on:
  - Model being used by your assistant
  - Complexity of the request
  - Current API load

### Rate limits
If you hit rate limits:
- You may need to upgrade your OpenAI account tier
- Or implement request queuing/throttling
- See: [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)

## Customizing Your Assistant

You can customize your assistant's behavior in the [OpenAI Platform](https://platform.openai.com/assistants):

1. Go to your Assistant (`asst_b3KUyJlXFXQh6pDpS3RGohoT`)
2. Modify:
   - **Instructions**: The system prompt/personality
   - **Model**: Choose GPT-4, GPT-4 Turbo, or GPT-3.5
   - **Tools**: Enable Code Interpreter, File Search, etc.
   - **Temperature**: Control creativity vs consistency

Changes take effect immediately - no code changes needed!

## Support

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Assistant API Guide](https://platform.openai.com/docs/assistants)
- [API Status](https://status.openai.com/)
