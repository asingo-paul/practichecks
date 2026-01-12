# Terraform Outputs for PractiCheck Infrastructure

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "load_balancer_dns" {
  description = "DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = aws_lb.main.zone_id
}

output "database_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "database_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "redis_port" {
  description = "ElastiCache Redis port"
  value       = aws_elasticache_replication_group.main.port
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecr_repositories" {
  description = "ECR repository URLs"
  value = {
    for k, v in aws_ecr_repository.services : k => v.repository_url
  }
}

output "jenkins_public_ip" {
  description = "Public IP of Jenkins server"
  value       = aws_eip.jenkins.public_ip
}

output "jenkins_url" {
  description = "Jenkins server URL"
  value       = "https://jenkins.${var.domain_name}"
}

output "domain_name" {
  description = "Primary domain name"
  value       = var.domain_name
}

output "ssl_certificate_arn" {
  description = "ARN of the SSL certificate"
  value       = aws_acm_certificate.main.arn
}

output "secrets_manager_arns" {
  description = "ARNs of Secrets Manager secrets"
  value = {
    database    = aws_secretsmanager_secret.db_password.arn
    redis       = aws_secretsmanager_secret.redis_auth_token.arn
    jwt_secret  = aws_secretsmanager_secret.jwt_secret.arn
  }
}

output "target_group_arns" {
  description = "ARNs of target groups"
  value = {
    company_dashboard  = aws_lb_target_group.company_dashboard.arn
    university_portal = aws_lb_target_group.university_portal.arn
    api_gateway       = aws_lb_target_group.api_gateway.arn
  }
}

output "security_group_ids" {
  description = "Security group IDs"
  value = {
    alb     = aws_security_group.alb.id
    ecs     = aws_security_group.ecs.id
    rds     = aws_security_group.rds.id
    redis   = aws_security_group.redis.id
    jenkins = aws_security_group.jenkins.id
  }
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.ecs.name
}