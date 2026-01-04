variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "bucket_name" {
  description = "Name of the Cloud Storage bucket for the static site"
  type        = string
}

variable "enable_cdn" {
  description = "Enable Cloud CDN for better performance"
  type        = bool
  default     = true
}

variable "index_page" {
  description = "Index page for the static site"
  type        = string
  default     = "index.html"
}

variable "error_page" {
  description = "Custom error page"
  type        = string
  default     = "index.html"
}
