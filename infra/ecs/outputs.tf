output "ecr_backend_repository_url" {
  description = "ECR Backend repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_url" {
  description = "ECR Frontend repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecs_cluster_name" {
  description = "ECS Cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS Service name"
  value       = aws_ecs_service.main.name
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "Public Subnet ID"
  value       = aws_subnet.public.id
}

output "instructions" {
  description = "Instructions to get ECS task public IP"
  value       = <<-EOT
    To get the ECS task public IP, run:
    
    1. Get task ARN:
       aws ecs list-tasks --cluster ${aws_ecs_cluster.main.name} --region ${var.aws_region}
    
    2. Get task details:
       aws ecs describe-tasks --cluster ${aws_ecs_cluster.main.name} --tasks <TASK_ARN> --region ${var.aws_region}
    
    3. Or use AWS Console:
       ECS > Clusters > ${aws_ecs_cluster.main.name} > Tasks > Click running task > See Public IP
  EOT
}
