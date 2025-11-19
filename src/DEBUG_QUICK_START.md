# 🚨 AI Agent Not Working? Start Here!

## Step 1: Open Browser Console
Press **F12** (or Right-click → Inspect → Console)

## Step 2: Run This Command
```javascript
openaiDebug.printInfo()
```

## Step 3: Check Results

### ✅ If you see all green checkmarks:
Your configuration is correct. Run:
```javascript
openaiDebug.testDetailed()
```
This will test the actual connection to OpenAI.

### ❌ If you see red X marks:

**Missing API Key?**
1. Create file named `.env` in project root
2. Add this line: `VITE_OPENAI_API_KEY=sk-your-key-here`
3. Get key from: https://platform.openai.com/api-keys
4. Restart server: Stop (Ctrl+C) then `npm run dev`

**Still not working?**
Read the full guide: [DEBUGGING.md](./DEBUGGING.md)

---

## Quick Test
After fixing configuration:
```javascript
openaiDebug.testDetailed()
```

This will:
- ✅ Verify your setup
- ✅ Test OpenAI connection
- ✅ Send a test message
- ✅ Show any errors with solutions

---

## Common Error Messages

| Error | Fix |
|-------|-----|
| "API key not configured" | Create `.env` file + restart |
| "401 Unauthorized" | Invalid API key - get new one |
| "429 Too Many Requests" | Wait 1 minute, try again |
| "Failed to create thread" | Check internet + OpenAI status |

---

**Need More Help?**
- Full guide: [DEBUGGING.md](./DEBUGGING.md)
- Setup guide: [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)
- Complete docs: [AI_AGENT_README.md](./AI_AGENT_README.md)
