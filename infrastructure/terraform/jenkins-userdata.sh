#!/bin/bash

# Jenkins Installation Script for Amazon Linux 2

# Update system
yum update -y

# Install Java 11
yum install -y java-11-amazon-corretto-headless

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
yum install -y unzip
unzip awscliv2.zip
./aws/install

# Install Git
yum install -y git

# Add Jenkins repository
wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Install Jenkins
yum install -y jenkins

# Start and enable Jenkins
systemctl start jenkins
systemctl enable jenkins

# Add jenkins user to docker group
usermod -a -G docker jenkins

# Install Node.js and npm (for frontend builds)
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Create Jenkins workspace directory
mkdir -p /var/lib/jenkins/workspace
chown jenkins:jenkins /var/lib/jenkins/workspace

# Configure AWS region
aws configure set region ${aws_region}

# Create initial Jenkins configuration
cat > /var/lib/jenkins/jenkins.yaml << 'EOF'
jenkins:
  systemMessage: "PractiCheck CI/CD Server"
  numExecutors: 2
  mode: NORMAL
  
security:
  globalJobDslSecurityConfiguration:
    useScriptSecurity: false

unclassified:
  location:
    url: "https://jenkins.practicheck.online/"
    adminAddress: "admin@practicheck.online"
EOF

chown jenkins:jenkins /var/lib/jenkins/jenkins.yaml

# Install Jenkins plugins
cat > /tmp/plugins.txt << 'EOF'
ant:latest
build-timeout:latest
credentials-binding:latest
timestamper:latest
ws-cleanup:latest
github:latest
github-branch-source:latest
pipeline-github-lib:latest
pipeline-stage-view:latest
git:latest
ssh-slaves:latest
matrix-auth:latest
pam-auth:latest
ldap:latest
email-ext:latest
mailer:latest
docker-workflow:latest
amazon-ecr:latest
pipeline-aws:latest
blueocean:latest
EOF

# Wait for Jenkins to start
sleep 60

# Install plugins using Jenkins CLI
wget http://localhost:8080/jnlpJars/jenkins-cli.jar
java -jar jenkins-cli.jar -s http://localhost:8080/ install-plugin $(cat /tmp/plugins.txt | tr '\n' ' ')

# Restart Jenkins to load plugins
systemctl restart jenkins

# Create a simple health check script
cat > /home/ec2-user/health-check.sh << 'EOF'
#!/bin/bash
curl -f http://localhost:8080/login || exit 1
EOF

chmod +x /home/ec2-user/health-check.sh

# Set up log rotation for Jenkins
cat > /etc/logrotate.d/jenkins << 'EOF'
/var/log/jenkins/jenkins.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 jenkins jenkins
    postrotate
        systemctl reload jenkins
    endscript
}
EOF

echo "Jenkins installation completed!"
echo "Access Jenkins at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8080"
echo "Initial admin password: $(cat /var/lib/jenkins/secrets/initialAdminPassword)"