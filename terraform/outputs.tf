output "ecr_repository_url" {
  description = "ECR repository URL for the app image"
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.app.name
}

output "task_family" {
  description = "ECS task family"
  value       = aws_ecs_task_definition.app.family
}

output "s3_bucket_name" {
  description = "Name of the provisioned S3 bucket"
  value       = aws_s3_bucket.app.bucket
}

output "log_group" {
  description = "CloudWatch log group for the ECS task"
  value       = aws_cloudwatch_log_group.app.name
}

output "security_group_id" {
  description = "ECS task security group"
  value       = aws_security_group.ecs.id
}
