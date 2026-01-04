output "bucket_name" {
  description = "Name of the Cloud Storage bucket"
  value       = google_storage_bucket.static_site.name
}

output "bucket_url" {
  description = "URL of the static site bucket"
  value       = "gs://${google_storage_bucket.static_site.name}"
}

output "static_website_url" {
  description = "Public URL for the static website (use this URL directly or point your domain to it)"
  value       = "https://storage.googleapis.com/${google_storage_bucket.static_site.name}/${var.index_page}"
}

output "cdn_enabled" {
  description = "Whether Cloud CDN is enabled"
  value       = var.enable_cdn
}
