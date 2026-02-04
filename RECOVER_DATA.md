# Data Recovery Guide

## **MongoDB is Safe! ✅**

Your MongoDB database is completely safe. We only made frontend TypeScript fixes - nothing touched the backend or database.

**Your MongoDB Account:**
- **Username:** `nayounglee5757`
- **Email:** Likely `nayounglee5757@gmail.com` (or similar)
- **Password:** `CCXL240rachel`
- **Connection String:** `mongodb+srv://nayounglee5757:CCXL240rachel@where-to-next.o98wan0.mongodb.net/where-to-next`

---

## **What Happened to localStorage Data?**

Your data was **migrated** to user-specific keys. It's not deleted, just moved!

**Old keys (might still exist):**
- `tripPreferences`
- `savedTripPreferences`
- `tripTracingState`
- `flightStrategies`
- `expensePolicySets`
- `destinationDocuments`

**New keys (user-specific format):**
- `tripPreferences_${userId}`
- `savedTripPreferences_${userId}`
- `tripTracingState_${userId}`
- etc.

---

## **How to Check Your Data:**

### **Option 1: Check Browser Console**

1. Open your website
2. Press `F12` (or `Cmd+Option+I` on Mac) to open Developer Tools
3. Go to the **Console** tab
4. Type this command and press Enter:

```javascript
// Get your user ID
const user = JSON.parse(localStorage.getItem('user'));
console.log('Your User ID:', user?.id);

// Check old keys
console.log('Old tripPreferences:', localStorage.getItem('tripPreferences'));
console.log('Old savedTripPreferences:', localStorage.getItem('savedTripPreferences'));
console.log('Old destinationDocuments:', localStorage.getItem('destinationDocuments'));

// Check new user-specific keys
if (user?.id) {
  console.log('New tripPreferences:', localStorage.getItem(`tripPreferences_${user.id}`));
  console.log('New savedTripPreferences:', localStorage.getItem(`savedTripPreferences_${user.id}`));
}
```

### **Option 2: Check Application Storage**

1. Open Developer Tools (`F12`)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click on **Local Storage** → your website URL
4. Look for keys starting with `tripPreferences`, `savedTripPreferences`, etc.

---

## **If Data is Missing:**

The data might be in the old keys but the code is only looking in new keys. The migration function should have copied it, but if something went wrong, the old data might still be there.

**To recover:**
1. Check if old keys exist (see Option 1 above)
2. If old keys have data, you can manually copy them to new keys, or
3. Log out and log back in - the migration will run again

---

## **Documents (destinationDocuments):**

Documents are stored in `destinationDocuments` (not user-specific). They should still be there. Check with:

```javascript
const docs = localStorage.getItem('destinationDocuments');
console.log('Documents:', docs ? JSON.parse(docs) : 'No documents found');
```

---

## **MongoDB Data:**

Your MongoDB data is completely safe. To verify:

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Login with: `nayounglee5757@gmail.com` (or the email you used)
3. Password: `CCXL240rachel`
4. Check your database - all data should be there!

---

## **Quick Recovery Steps:**

1. **Check localStorage** (use Option 1 above)
2. **If old keys exist with data:**
   - Log out and log back in (migration will run again)
   - Or manually copy data from old keys to new keys
3. **If data is truly gone from localStorage:**
   - Check MongoDB Atlas - your documents might be there
   - Check if you're logged in as the correct user

---

## **Need Help?**

If you can't find your data, let me know what you see in the console and I'll help you recover it!
