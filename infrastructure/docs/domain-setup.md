# Domain Configuration Guide for PractiCheck

## 1. Namecheap Domain Configuration

### Initial Setup
1. **Login to Namecheap Dashboard**
   - Go to [Namecheap.com](https://namecheap.com)
   - Login to your account
   - Navigate to "Domain List"

2. **Configure DNS Settings**
   - Click "Manage" next to `practicheck.online`
   - Go to "Advanced DNS" tab
   - Delete existing records (except essential ones)

### DNS Records Configuration

Add the following DNS records in Namecheap:

```
Type    Host    Value                           TTL
A       @       [ALB_DNS_FROM_TERRAFORM]        300
A       *       [ALB_DNS_FROM_TERRAFORM]        300
CNAME   www     practicheck.online              300
CNAME   api     practicheck.online              300
CNAME   jenkins [JENKINS_EIP_FROM_TERRAFORM]   300
```

**Note**: Replace bracketed values with actual outputs from Terraform deployment.

### SSL Certificate Setup
- AWS Certificate Manager will handle SSL certificates
- Terraform will create DNS validation records automatically
- Namecheap will propagate these records globally

## 2. Route53 Migration (Recommended)

For better control and AWS integration, migrate DNS to Route53:

### Step 1: Create Hosted Zone
```bash
aws route53 create-hosted-zone \
    --name practicheck.online \
    --caller-reference $(date +%s)
```

### Step 2: Update Namecheap Nameservers
1. Get Route53 nameservers from AWS Console
2. In Namecheap, go to Domain → Nameservers
3. Select "Custom DNS" and add Route53 nameservers:
   ```
   ns-xxx.awsdns-xx.com
   ns-xxx.awsdns-xx.co.uk
   ns-xxx.awsdns-xx.net
   ns-xxx.awsdns-xx.org
   ```

### Step 3: Verify DNS Propagation
```bash
# Check DNS propagation
dig practicheck.online
nslookup practicheck.online
```

## 3. Security Configuration

### Domain Security Headers
Configure these security headers in your load balancer:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### SSL/TLS Configuration
- **Minimum TLS Version**: 1.2
- **Cipher Suites**: Modern, secure ciphers only
- **HSTS**: Enabled with includeSubDomains
- **Certificate**: Wildcard SSL for *.practicheck.online

### WAF (Web Application Firewall)
Enable AWS WAF with these rules:
- SQL Injection protection
- XSS protection
- Rate limiting (1000 requests/5min per IP)
- Geographic restrictions (if needed)
- Known bad inputs blocking

## 4. Subdomain Strategy

### University Subdomains
Each university gets a unique subdomain:

```
mksu.practicheck.online     → Machakos University
uon.practicheck.online      → University of Nairobi
ku.practicheck.online       → Kenyatta University
mmu.practicheck.online      → Multimedia University
jkuat.practicheck.online    → JKUAT
```

### System Subdomains
```
api.practicheck.online      → API Gateway
jenkins.practicheck.online  → CI/CD Server
admin.practicheck.online    → Admin Dashboard
docs.practicheck.online     → Documentation
status.practicheck.online   → Status Page
```

## 5. Monitoring & Alerts

### DNS Monitoring
Set up monitoring for:
- DNS resolution time
- SSL certificate expiration
- Domain availability
- Subdomain health checks

### Route53 Health Checks
```bash
# Create health check for main domain
aws route53 create-health-check \
    --caller-reference $(date +%s) \
    --health-check-config \
    Type=HTTPS,ResourcePath=/,FullyQualifiedDomainName=practicheck.online,Port=443
```

## 6. Backup & Recovery

### DNS Backup
- Export Route53 zone file regularly
- Keep Namecheap as backup DNS provider
- Document all DNS changes

### Certificate Backup
- AWS Certificate Manager handles renewals
- Set up alerts for certificate expiration
- Keep backup certificates in AWS Secrets Manager

## 7. Performance Optimization

### CDN Configuration
- CloudFront distribution for static assets
- Edge locations for global performance
- Caching strategies for different content types

### DNS Optimization
- Use Route53 latency-based routing
- Configure health checks for failover
- Optimize TTL values for different record types

## 8. Compliance & Legal

### Domain Privacy
- Enable domain privacy protection in Namecheap
- Use business contact information
- Comply with GDPR requirements

### Terms of Service
- Update domain-specific terms
- Configure proper redirects
- Implement cookie policies

## 9. Testing Checklist

Before going live, test:
- [ ] Main domain resolves correctly
- [ ] All subdomains work
- [ ] SSL certificates are valid
- [ ] Health checks pass
- [ ] WAF rules are active
- [ ] Monitoring alerts work
- [ ] Backup DNS works
- [ ] Performance is acceptable

## 10. Go-Live Process

1. **Pre-deployment**
   - Verify all DNS records
   - Test SSL certificates
   - Check health endpoints

2. **Deployment**
   - Deploy infrastructure with Terraform
   - Update DNS records
   - Enable monitoring

3. **Post-deployment**
   - Verify all services
   - Check SSL grades (SSLLabs)
   - Monitor for 24 hours
   - Update documentation

## Troubleshooting

### Common Issues
1. **DNS Propagation Delays**
   - Wait 24-48 hours for global propagation
   - Use different DNS servers for testing
   - Check TTL values

2. **SSL Certificate Issues**
   - Verify DNS validation records
   - Check certificate chain
   - Ensure proper domain validation

3. **Subdomain Routing**
   - Verify wildcard certificate
   - Check load balancer rules
   - Test routing logic

### Support Contacts
- **Namecheap Support**: support@namecheap.com
- **AWS Support**: Through AWS Console
- **Emergency Contact**: [Your emergency contact]