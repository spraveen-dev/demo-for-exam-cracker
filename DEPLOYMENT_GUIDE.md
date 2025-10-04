# 🚀 Vercel + Supabase Deployment Guide

## ✅ STEP 1: Create Supabase Database

### In the form you're seeing now:
1. **Database Name**: Use "supabase-lime-school" or change to "exam-cracker-db"
2. **Primary Region**: Keep "Mumbai, India (South) bom1" 
3. **Public Environment Variables Prefix**: Keep "NEXT_PUBLIC_"
4. **Click "Create"** button

### After database is created:
1. Go to **Settings** → **Database**
2. Copy the **Connection string** (URI format)
   - Look for section: "Connection string"
   - Select tab: "URI"
   - It looks like: `postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`
3. **Save this connection string** - you'll need it for Vercel!

---

## ✅ STEP 2: Initialize Database Tables

1. Go to Supabase SQL Editor: **SQL Editor** → **New query**
2. Copy and paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255) NOT NULL,
    name VARCHAR(500) NOT NULL,
    link TEXT NOT NULL,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subsections (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(100) DEFAULT 'fa-folder',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, name)
);

CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category, subcategory);
CREATE INDEX IF NOT EXISTS idx_subsections_category ON subsections(category);
```

3. Click **Run** or press **Ctrl+Enter**
4. You should see: "Success. No rows returned"

---

## ✅ STEP 3: Deploy to Vercel

### 1. Push your code to GitHub
```bash
git add .
git commit -m "Add database integration"
git push origin main
```

### 2. Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repository
4. Vercel will auto-detect the settings

### 3. Configure Environment Variable
**⚠️ IMPORTANT:** Before deploying, add your database connection:

1. In the Vercel deployment page, find **"Environment Variables"** section
2. Add this variable:
   - **Name**: `POSTGRES_URL`
   - **Value**: [Paste your Supabase connection string from Step 1]
   - **Environment**: Check all (Production, Preview, Development)
3. Click **"Add"**

### 4. Deploy
1. Click **"Deploy"**
2. Wait 1-2 minutes for build to complete
3. You'll get a URL like: `https://your-project.vercel.app`

---

## ✅ STEP 4: Test Your Deployment

1. Visit your Vercel URL
2. Go to login page
3. Login with admin credentials:
   - **Username**: `praveen`
   - **Password**: `PRAVEEN@1234`
4. Go to Materials or Questions page
5. Try adding a document or subsection
6. Refresh the page - your data should persist!

---

## 📋 Project File Structure

Your project should have this structure:
```
EXAM CRACKER/
├── api/
│   └── index.py          # Vercel serverless function
├── static/
│   ├── css/
│   │   ├── style.css
│   │   └── document-manager.css
│   ├── js/
│   │   ├── login.js
│   │   ├── document-manager.js
│   │   ├── accordion.js
│   │   ├── main.js
│   │   ├── profile.js
│   │   └── intro.js
│   └── bg-image.png
├── index.html
├── login.html
├── home.html
├── materials.html
├── questions.html
├── profile.html
├── server.py             # For local development
├── database.py           # Database functions
├── vercel.json           # Vercel configuration
└── requirements.txt      # Python dependencies
```

---

## 🔧 Troubleshooting

### ❌ "Database not configured" error
**Fix**: Make sure `POSTGRES_URL` environment variable is set in Vercel:
1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add `POSTGRES_URL` with your Supabase connection string
3. Redeploy the project

### ❌ Connection timeout
**Fix**: 
1. Check if Supabase database is active
2. Verify connection string is correct
3. Make sure you copied the **pooler** connection string (port 6543, not 5432)

### ❌ Static files not loading
**Fix**:
1. Make sure all files are committed to Git
2. Run: `git status` to check for uncommitted files
3. Commit and push: `git add . && git commit -m "Add files" && git push`

### ❌ "No module named 'database'" error
**Fix**: Make sure `database.py` is in the same directory as `api/index.py`

---

## 🎨 Custom Domain (Optional)

1. Go to Vercel project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

---

## 📊 View Your Data

### In Supabase Dashboard:
1. Go to **Table Editor**
2. Select **documents** or **subsections** table
3. View, edit, or delete data directly

### Or use SQL Editor:
```sql
-- View all documents
SELECT * FROM documents ORDER BY uploaded_at DESC;

-- View all subsections
SELECT * FROM subsections ORDER BY category, created_at;

-- Count documents by category
SELECT category, COUNT(*) as total FROM documents GROUP BY category;
```

---

## 🔐 Admin Access

**Admin Credentials:**
- Username: `praveen`
- Password: `PRAVEEN@1234`

**Admin can:**
- Upload documents
- Add custom subsections
- Delete documents
- Delete subsections

**Regular users can:**
- View all documents
- Download/open documents
- Browse all categories

---

## 🎯 Next Steps After Deployment

1. **Test all features** - Login, add documents, add subsections
2. **Add your content** - Upload your study materials
3. **Share the URL** - Give the link to your students
4. **Monitor usage** - Check Vercel analytics dashboard
5. **Backup data** - Supabase has automatic backups, but you can export via SQL Editor

---

## 💰 Cost Information

### Supabase Free Tier:
- 500 MB database space
- 50K MAU (Monthly Active Users)
- 5 GB bandwidth
- Automatic backups (7 days)

### Vercel Free Tier:
- 100 GB bandwidth
- Unlimited serverless function executions
- Automatic HTTPS
- Preview deployments

**Both are FREE for your use case!** ✨

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs in dashboard
3. Verify environment variables are set
4. Make sure database tables are created

---

**🎉 That's it! Your exam preparation app is now live with permanent storage!**
