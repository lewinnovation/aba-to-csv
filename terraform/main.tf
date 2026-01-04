terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

#   Uncomment and configure after creating the Terraform state bucket
  backend "gcs" {
    bucket  = "aba-to-csv"
    prefix  = "atc"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Cloud Storage bucket for the static website
resource "google_storage_bucket" "static_site" {
  name          = var.bucket_name
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  website {
    main_page_suffix = var.index_page
    not_found_page   = var.error_page
  }

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "OPTIONS"]
    response_header = ["Content-Type", "Access-Control-Allow-Origin"]
    max_age_seconds = 3600
  }

  labels = {
    environment = var.environment
    application = "aba-to-wise"
  }
}

# Make the bucket publicly readable
resource "google_storage_bucket_iam_member" "public_access" {
  bucket = google_storage_bucket.static_site.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Upload index.html with proper content type and caching
resource "google_storage_bucket_object" "index" {
  name   = var.index_page
  bucket = google_storage_bucket.static_site.name
  source = "../dist/index.html"

  content_type = "text/html; charset=utf-8"

  cache_control = "public, max-age=3600"

  depends_on = [
    google_storage_bucket.static_site,
    google_storage_bucket_iam_member.public_access
  ]
}

# Upload CSS and JS files with longer cache duration
resource "google_storage_bucket_object" "assets" {
  for_each = fileset("../dist", "**/*.{css,js,woff2,svg,png,ico}")

  bucket       = google_storage_bucket.static_site.name
  name         = each.value
  source       = "../dist/${each.value}"
  content_type = lookup(
    {
      "css"   = "text/css; charset=utf-8"
      "js"    = "application/javascript; charset=utf-8"
      "woff2" = "font/woff2"
      "svg"   = "image/svg+xml"
      "png"   = "image/png"
      "ico"   = "image/x-icon"
    },
    regex("\\w+$", each.value),
    "application/octet-stream"
  )

  cache_control = "public, max-age=31536000, immutable"

  depends_on = [
    google_storage_bucket.static_site,
    google_storage_bucket_iam_member.public_access
  ]
}

# Optional: Cloud Load Balancer with Cloud CDN for global distribution
resource "google_compute_backend_bucket" "cdn" {
  count = var.enable_cdn ? 1 : 0

  name        = "${replace(var.bucket_name, ".", "-")}-cdn"
  bucket_name = google_storage_bucket.static_site.name
  enable_cdn  = true
}

# Cloud CDN is enabled directly on the backend bucket
# Load balancer/proxy configuration removed - use the bucket's public URL directly
# or set up a custom domain with Cloud CDN through Google Cloud Console
