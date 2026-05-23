# 🔥 CRITICAL BUGS TO FIX IMMEDIATELY

## 5 CRITICAL ISSUES

### 1. **JWT Secret Mismatch** 
- `authMiddleware.js` uses `JWT_SECRET_KEY`
- `verifyToken.js` uses `JWT_SECRET`
- **Fix:** Use same key name everywhere - change both to `JWT_SECRET`

### 2. **FileModel Syntax Error**
- Has trailing comma in export: `module.exports = FileModel,`
- **Fix:** Remove comma: `module.exports = FileModel;`

### 3. **Unencrypted Passwords**
- `CommonApi.js` change-password doesn't hash password
- **Fix:** Use `bcrypt.hash()` before saving

### 4. **PullRequestModel Not Exported**
- Missing export statement at end of file
- **Fix:** Add `module.exports = PullRequestModel;`

### 5. **Duplicate Dependencies**
- `bcrypt` + `bcryptjs` both installed
- `cookie-parser` + `cookieparser` both installed
- **Fix:** Remove duplicates from package.json, keep only: `bcrypt` and `cookie-parser`

---

## HIGH PRIORITY (7 Issues)

6. **Missing Error Handling** - IssuesApi, CommitApi have no try-catch
7. **NotificationModel Enum Mismatch** - API sends values not in enum
8. **Route Ordering Bug** - Notification generic `/` route shadows specific endpoints
9. **Duplicate Routes** - Multiple `/login` endpoints
10. **Private Repo Exposed** - File endpoint doesn't check visibility
11. **Missing Password Validation** - No strength requirements
12. **Frontend Dependency Bug** - Missing useEffect dependency

---

## SUMMARY

✅ **App currently works for signup** because basic flow is functional  
❌ **Will fail for:**
- Login with JWT authentication
- Pull requests operations
- Notification retrieval
- File access control
- Password changes

**Recommendation:** Fix the 5 CRITICAL issues first, then the 7 HIGH priority ones.

Need help fixing these? I can fix them for you! 🚀
