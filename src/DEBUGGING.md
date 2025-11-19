# 🐛 Debugging OpenAI Integration

Quick guide to diagnose and fix issues with the OpenAI Assistant integration.

---

## 🔧 Debug Tools (Browser Console)

Open the browser console (F12) and run these commands:

### 1. Check Configuration
```javascript
openaiDebug.printInfo()
```
**What it shows:**
- Whether environment variables are loaded
- If API key is configured
- Preview of your API key (first/last 4 chars)

### 2. Run Full Test
```javascript
openaiDebug.testDetailed()
```
**What it does:**
- Tests configuration
- Creates a thread
- Sends a test message
- Shows detailed error messages if anything fails

### 3. Quick Connection Test
```javascript
testOpenAIConnection()
```
**What it does:**
- Basic connectivity test
- Good for quick verification

---

## 🔍 Common Issues & Solutions

### Issue 1: "OpenAI API key not configured"

**Symptoms:**
- Toast message appears when trying to send a message
- `openaiDebug.printInfo()` shows `isConfigured: false`

**Solutions:**

1. **Create `.env` file**
   - Location: Project root (same folder as `App.tsx`)
   - Content:
     ```
     VITE_OPENAI_API_KEY=sk-your-actual-key-here
     ```

2. **Restart development server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   # or
   yarn dev
   ```

3. **Verify the file**
   - File name is exactly `.env` (with the dot)
   - No file extension (not `.env.txt`)
   - Contains the correct key

---

### Issue 2: "Failed to connect to AI Agent"

**Symptoms:**
- Error when thread is created
- Console shows network errors

**Check in this order:**

1. **Run debug test**
   ```javascript
   openaiDebug.testDetailed()
   ```

2. **Check API key validity**
   - Go to https://platform.openai.com/api-keys
   - Verify your key is active
   - Check it hasn't been revoked
   - Create a new key if needed

3. **Check OpenAI account**
   - Visit https://platform.openai.com/usage
   - Verify you have credits available
   - Check your billing is set up

4. **Check network**
   - Verify internet connection
   - Check if OpenAI is accessible: https://status.openai.com/
   - Check browser console (F12) for CORS or network errors

---

### Issue 3: No response / Loading forever

**Symptoms:**
- Message sent but no response appears
- Loading spinner stays active

**Debug steps:**

1. **Check browser console**
   - Look for `[OpenAI]` prefixed messages
   - Check where the flow stops

2. **Common causes:**
   - **Run timeout**: Assistant took longer than 30 seconds
   - **Assistant not found**: Check Assistant ID is correct
   - **Rate limit**: Too many requests
   - **Model error**: Assistant's model may have issues

3. **Verify Assistant**
   - Go to https://platform.openai.com/assistants/asst_b3KUyJlXFXQh6pDpS3RGohoT
   - Check it exists and is active
   - Check the model is available (GPT-4, GPT-3.5, etc.)

---

### Issue 4: Messages appear but no "Apply to field" button

**Cause:** UI rendering issue

**Solution:**
- Refresh the page
- Clear browser cache
- Check console for React errors

---

### Issue 5: TypeScript errors

**Symptoms:**
- Red underlines in code editor
- Build fails

**Solutions:**

1. **Restart TypeScript server**
   - VS Code: Cmd/Ctrl + Shift + P → "Restart TS Server"

2. **Check `vite-env.d.ts` exists**
   - Should be in project root
   - Contains environment variable types

3. **Reinstall dependencies**
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## 📊 Reading Console Logs

When you use the AI Agent, look for these log patterns:

### ✅ Successful Flow
```
[OpenAI] Creating thread...
[OpenAI] Thread created: thread_abc123
[OpenAI] Starting message flow...
[OpenAI] Sending message to thread...
[OpenAI] Running assistant...
[OpenAI] Run ID: run_xyz789
[OpenAI] Waiting for completion...
[OpenAI] Run completed!
[OpenAI] Fetching messages...
[OpenAI] Retrieved 2 messages
[OpenAI] Response: Here's my suggestion...
```

### ❌ Failed Flow - Look for where it stops
```
[OpenAI] Creating thread...
❌ Error creating thread: 401 Unauthorized
```
→ **Invalid API key**

```
[OpenAI] Thread created: thread_abc123
[OpenAI] Sending message...
❌ Error sending message: 429 Rate Limit
```
→ **Too many requests**

```
[OpenAI] Run ID: run_xyz789
[OpenAI] Waiting for completion...
❌ Run timeout
```
→ **Assistant took too long**

---

## 🧪 Test Checklist

Run through this checklist:

### Configuration
- [ ] `.env` file exists in project root
- [ ] File contains `VITE_OPENAI_API_KEY=sk-...`
- [ ] API key starts with `sk-`
- [ ] Development server restarted after creating `.env`

### API Access
- [ ] API key is valid (check OpenAI dashboard)
- [ ] OpenAI account has available credits
- [ ] OpenAI API is online (check status page)

### Browser
- [ ] No console errors before opening AI Agent
- [ ] Can access other websites (internet works)
- [ ] Browser is up to date

### Debug Commands
- [ ] `openaiDebug.printInfo()` shows all ✅
- [ ] `openaiDebug.testDetailed()` completes successfully
- [ ] Can send test message and get response

---

## 🆘 Still Not Working?

### 1. Collect Debug Information
```javascript
// Run in browser console
const info = openaiDebug.getInfo();
console.log(JSON.stringify(info, null, 2));
```

### 2. Check Full Error Stack
```javascript
// Enable verbose logging
localStorage.setItem('debug', '*');
// Reload page and try again
```

### 3. Verify Environment
```javascript
// Check what Vite sees
console.log('import.meta.env:', import.meta.env);
```

### 4. Manual API Test

Try calling OpenAI API directly from browser console:

```javascript
fetch('https://api.openai.com/v1/threads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY_HERE',
    'OpenAI-Beta': 'assistants=v2'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

Replace `YOUR_API_KEY_HERE` with your actual key.

---

## 📝 Reporting Issues

If you need to report an issue, include:

1. **Debug output:**
   ```javascript
   openaiDebug.printInfo()
   ```

2. **Console logs:**
   - Any error messages
   - Any `[OpenAI]` logs

3. **Environment:**
   - Browser (Chrome, Firefox, etc.)
   - Operating System
   - Node version: `node --version`

4. **Steps to reproduce:**
   - What you clicked
   - What you expected
   - What actually happened

---

## 🎯 Quick Fixes Summary

| Problem | Quick Fix |
|---------|-----------|
| "API key not configured" | Create `.env` file, restart server |
| "Failed to connect" | Run `openaiDebug.testDetailed()` |
| 401 Error | Invalid API key - get new one |
| 429 Error | Rate limit - wait and retry |
| No response | Check console for where it fails |
| TypeScript errors | Restart TS server |

---

**Last Updated:** November 4, 2025
