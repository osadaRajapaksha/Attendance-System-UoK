output "backend_public_ip" {
  description = "Public IP of the backend EC2 instance"
  value       = aws_instance.backend.public_ip
}

output "frontend_s3_website_endpoint" {
  description = "S3 static website hosting endpoint for the frontend"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}
