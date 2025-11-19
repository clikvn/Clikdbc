# ✅ AI Agent Setup Checklist - Chat Completions API

Step-by-step guide to set up the AI Agent feature.

---

## 🎯 Prerequisites

Before you start, make sure you have:

- [ ] Node.js installed (v16 or higher)
- [ ] npm or yarn package manager
- [ ] A code editor (VS Code recommended)
- [ ] Access to your project files
- [ ] Internet connection

---

## 📝 Setup Steps

### Step 1: Get OpenAI API Key

1. **Go to OpenAI Platform**  
   Visit: https://platform.openai.com/api-keys

2. **Sign in or create account**  
   - If you don't have an account, create one
   - Verify your email
   - Add payment method (required for API access)

3. **Create new API key**  
   - Click "Create new secret key"
   - Give it a name like "Business Card CMS"
   - Copy the key (starts with `sk-`)
   - ⚠️ **Important**: Save it somewhere safe - you can't see it again!

4. **Verify billing**  
   - Go to https://platform.openai.com/account/billing
   - Make sure you have credits or auto-recharge enabled
   - Recommended: Set a usage limit to avoid surprise charges

- [ ] ✅ API key obtained and saved

---

### Step 2: Create Environment File

1. **Open your project root folder**  
   (Same folder where `App.tsx` is located)

2. **Create a new file named `.env`**  
   - File name is exactly: `.env` (with the dot at the start)
   - No file extension (not `.env.txt`)
   - If you're on Mac/Linux and don't see it, enable "Show hidden files"

3. **Add your API key**  
   Open `.env` and add this line:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   ```
   Replace `sk-your-actual-key-here` with your real API key

4. **Save the file**

Example `.env` file:
```env
VITE_OPENAI_API_KEY=sk-proj-abc123xyz456...
```

- [ ] ✅ `.env` file created
- [ ] ✅ API key added to `.env`

---

### Step 3: Verify `.gitignore`

1. **Open `.gitignore` file**  
   (Should already exist in your project)

2. **Make sure `.env` is listed**  
   Look for a line that says:
   ```
   .env
   ```

3. **If not there, add it**  
   Add this line anywhere in the file:
   ```
   .env
   ```

4. **Save the file**

**Why?** This prevents accidentally committing your API key to GitHub.

- [ ] ✅ `.env` added to `.gitignore`

---

### Step 4: Restart Development Server

1. **Stop the current server**  
   - Press `Ctrl+C` (Windows/Linux) or `Cmd+C` (Mac) in your terminal

2. **Start the server again**  
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

3. **Wait for it to start**  
   - You should see "Local: http://localhost:5173" or similar

**Why?** Vite only loads environment variables on startup.

- [ ] ✅ Development server restarted

---

### Step 5: Test Configuration

1. **Open your web application**  
   Go to http://localhost:5173 (or your dev server URL)

2. **Open browser console**  
   - Press `F12` (Windows/Linux)
   - Or right-click → Inspect → Console tab
   - Or press `Cmd+Option+J` (Mac)

3. **You should see a green status message**  
   ```
   ✅ OpenAI Chat Completions Ready
   ```

4. **If you see red warning**, something is wrong
   ```
   ⚠️ OpenAI Not Configured
   ```

5. **Run diagnostic command**  
   Type in the console:
   ```javascript
   openaiDebug.printInfo()
   ```

6. **Check the output**  
   - All items should have ✅
   - If you see ❌, follow the fix instructions shown

- [ ] ✅ Green status message appears
- [ ] ✅ All checks pass in `openaiDebug.printInfo()`

---

### Step 6: Test Connection

1. **In the browser console, run:**
   ```javascript
   openaiDebug.testDetailed()
   ```

2. **Wait for it to complete**  
   This will:
   - Check your configuration
   - Send a test message to OpenAI
   - Show the response

3. **You should see:**
   ```
   🎉 All Tests Passed!
   Your OpenAI Chat Completions API integration is working correctly.
   ```

4. **If you see errors:**
   - Read the error message carefully
   - Common issues:
     - Invalid API key → Get a new one
     - Rate limit → Wait 1 minute
     - Network error → Check internet connection
     - No credits → Add billing to your OpenAI account

- [ ] ✅ Test passes successfully
- [ ] ✅ Received response from AI

---

### Step 7: Test in CMS

1. **Navigate to your CMS**  
   Go to `/my_profile` in your app

2. **Open any form with text fields**  
   (e.g., Personal Info, Profile, etc.)

3. **Click the AI sparkle icon** ✨  
   Next to any text field

4. **AI Agent chat should open**  
   You should see:
   - "Start a conversation with AI Agent"
   - Suggestion buttons
   - Input field at bottom

5. **Try sending a message**  
   - Click a suggestion button, or
   - Type your own message
   - Press Enter or click send button

6. **You should get a response**  
   - Loading indicator appears
   - AI response shows up
   - "Apply to field" button appears

7. **Test "Apply to field"**  
   - Click "Apply to field →"
   - Text should be inserted into the form field
   - Success toast should appear

- [ ] ✅ AI Agent opens when clicking icon
- [ ] ✅ Can send messages
- [ ] ✅ Receives responses
- [ ] ✅ "Apply to field" works

---

## 🎉 Success!

If all checkboxes are ticked, your AI Agent is fully set up!

### What's Next?

- **Explore different fields**: Try the AI Agent on Bio, Title, Descriptions, etc.
- **Customize prompts**: Edit system prompt in `/utils/openai-service.ts`
- **Change model**: Switch between gpt-4o-mini and gpt-4o
- **Monitor usage**: Check https://platform.openai.com/usage

---

## 🐛 Troubleshooting

### Issue: Red warning in console

**Solution**:
1. Check `.env` file exists
2. Check API key is correct
3. Restart dev server
4. Run `openaiDebug.printInfo()`

### Issue: "Invalid API key" error

**Solution**:
1. Go to https://platform.openai.com/api-keys
2. Check if key is active
3. Create a new key if needed
4. Update `.env` file
5. Restart dev server

### Issue: "Rate limit exceeded"

**Solution**:
1. Wait 60 seconds
2. Try again
3. If persists, check https://platform.openai.com/usage
4. You might need to upgrade your plan

### Issue: No response from AI

**Solution**:
1. Check browser console for errors
2. Run `openaiDebug.testDetailed()`
3. Verify internet connection
4. Check OpenAI status: https://status.openai.com

### Issue: Server won't start after adding `.env`

**Solution**:
1. Check `.env` file name (no `.txt` extension)
2. Check API key format (should start with `sk-`)
3. Remove any quotes around the key
4. Make sure there's no space before/after `=`

---

## 📚 Additional Resources

- **Quick Debug**: [DEBUG_QUICK_START.md](./DEBUG_QUICK_START.md)
- **Full Debugging Guide**: [DEBUGGING.md](./DEBUGGING.md)
- **Complete Documentation**: [AI_AGENT_README.md](./AI_AGENT_README.md)
- **OpenAI Docs**: https://platform.openai.com/docs/api-reference/chat

---

## ✅ Final Checklist

Before you finish, verify:

- [ ] `.env` file exists in project root
- [ ] API key starts with `sk-`
- [ ] `.env` is in `.gitignore`
- [ ] Development server restarted after creating `.env`
- [ ] Green status in console
- [ ] `openaiDebug.testDetailed()` passes
- [ ] Can open AI Agent from CMS
- [ ] Can send messages and get responses
- [ ] Can apply suggestions to fields

**All done?** 🎉 Enjoy your AI-powered CMS!

---

**Last Updated**: November 4, 2025
