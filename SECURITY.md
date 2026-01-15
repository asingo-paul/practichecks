# 🔒 Security Guidelines for PractiCheck

## ⚠️ CRITICAL: Exposed Credentials Found

Your `.env` file contains **real credentials** that were exposed in your Git repository. Take immediate action:

### 🚨 Immediate Actions Required

1. **Rotate ALL Credentials Immediately**
   - ✅ Change Supabase database password
   - ✅ Generate new JWT secret key
   - ✅ Revoke and create new Gmail app password
   - ✅ Update all services with new credentials

2. **Remove Credentials from Git History**
   ```bash
   # Install BFG Repo-Cleaner
   brew install bfg  # macOS
   # or download from: https://rtyley.github.io/bfg-repo-cleaner/
   
   # Remove .env from history
   bfg --delete-files .env
   
   # Clean up
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   
   # Force push (WARNING: This rewrites history)
   git push --force
   ```

3. **Verify .gitignore**
   ```bash
   # Check if .env is ignored
   git check-ignore .env
   # Should output: .env
   
   # If not, add it
   echo ".env" >> .gitignore
   git add .gitignore
   git commit -m "Add .env to gitignore"
   ```

## 🔐 Exposed Credentials in Your Repository

### Database (Supabase)
```
❌ EXPOSED: postgresql://postgres.wutpivngncvjmsamwiyy:J18-8287-2021paul@...
✅ ACTION: Change password in Supabase dashboard immediately
```

### Email (Gmail)
```
❌ EXPOSED: practicheck@gmail.com / vcdmzgporwclfryq
✅ ACTION: Revoke app password and generate new one
```

### JWT Secret
```
❌ EXPOSED: dev_jwt_secret_key_2024_change_in_production
✅ ACTION: Generate new secret key
```

## 🛡️ Security Best Practices

### 1. Environment Variables

**NEVER commit these files:**
- `.env`
- `.env.local`
- `.env.production`
- Any file containing credentials

**DO commit:**
- `.env.example` (with placeholder values)
- `.env.template` (with placeholder values)

### 2. Generate Secure Credentials

```bash
# Generate secure JWT secret (64 characters)
openssl rand -hex 64

# Generate secure password (32 characters)
openssl rand -base64 32

# Generate UUID
uuidgen
```

### 3. Use Environment Variables Everywhere

**❌ BAD:**
```python
DATABASE_URL = "postgresql://user:pass@host:5432/db"
```

**✅ GOOD:**
```python
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")
```

### 4. Separate Credentials by Environment

```
.env.development  # Local development
.env.staging      # Staging environment
.env.production   # Production environment
```

### 5. Use Secret Management Services

**For Production:**
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Secret Manager

**Example with AWS Secrets Manager:**
```python
import boto3
import json

def get_secret(secret_name):
    client = boto3.client('secretsmanager', region_name='us-east-1')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

# Usage
db_credentials = get_secret('practicheck/database')
DATABASE_URL = db_credentials['connection_string']
```

## 📋 Checklist: Securing Your Repository

- [ ] Remove `.env` from Git history
- [ ] Rotate all exposed credentials
- [ ] Verify `.env` is in `.gitignore`
- [ ] Create `.env.example` with placeholders
- [ ] Update documentation with security guidelines
- [ ] Set up secret scanning (GitHub Advanced Security)
- [ ] Enable branch protection rules
- [ ] Require code reviews for sensitive changes
- [ ] Set up automated security scanning
- [ ] Document credential rotation procedures

## 🔍 Files to Check for Hardcoded Credentials

### High Priority
- [x] `.env` - **CONTAINS REAL CREDENTIALS**
- [x] `docker-compose.dev.yml` - Uses dev credentials (OK for local)
- [x] `scripts/setup-dev.sh` - Uses dev credentials (OK for local)
- [ ] `infrastructure/kubernetes/secrets.yaml` - Template only
- [ ] All `*.py` files - Check for hardcoded values
- [ ] All `*.ts` and `*.tsx` files - Check for API keys

### Files Already Checked
✅ Backend services use `os.getenv()` - GOOD
✅ Frontend uses environment variables - GOOD
✅ Docker compose uses `${VAR}` syntax - GOOD
✅ Terraform uses `random_password` - GOOD

## 🚀 Setting Up Credentials Properly

### 1. Local Development

```bash
# Copy example file
cp .env.example .env

# Edit with your credentials
nano .env

# Verify it's ignored
git status  # Should NOT show .env
```

### 2. Production Deployment

**Option A: AWS Secrets Manager (Recommended)**
```bash
# Store secret
aws secretsmanager create-secret \
    --name practicheck/database \
    --secret-string '{"url":"postgresql://..."}'

# Retrieve in application
# (See code example above)
```

**Option B: Environment Variables**
```bash
# Set in your deployment platform
# Heroku, Vercel, AWS ECS, etc.
```

### 3. CI/CD Pipeline

**GitHub Actions:**
```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  JWT_SECRET_KEY: ${{ secrets.JWT_SECRET_KEY }}
```

**Store secrets in:**
- GitHub: Settings → Secrets and variables → Actions
- GitLab: Settings → CI/CD → Variables
- Bitbucket: Repository settings → Pipelines → Repository variables

## 🔔 Monitoring & Alerts

### Enable GitHub Secret Scanning
1. Go to repository Settings
2. Security & analysis
3. Enable "Secret scanning"
4. Enable "Push protection"

### Set Up Alerts
- Enable Dependabot alerts
- Enable security advisories
- Set up email notifications
- Monitor access logs

## 📚 Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12-Factor App: Config](https://12factor.net/config)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)

## 🆘 If Credentials Are Compromised

1. **Immediately rotate all credentials**
2. **Check access logs for unauthorized access**
3. **Notify affected users if data was accessed**
4. **Document the incident**
5. **Review and improve security practices**
6. **Consider security audit**

## 📞 Security Contact

For security issues, please contact:
- Email: security@practicheck.com
- Create a private security advisory on GitHub

**DO NOT** create public issues for security vulnerabilities!