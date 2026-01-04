# Terraform State Management on GCP

This document explains how to set up Terraform state management on Google Cloud Storage.

## Initial Setup (Before Using the Terraform Config)

### Step 1: Create a Terraform State Bucket

Run these commands from the GCP console or using `gcloud`:

```bash
# Set your GCP project ID
export PROJECT_ID="your-gcp-project-id"
export STATE_BUCKET="your-project-terraform-state"

# Create the bucket for Terraform state
gsutil mb -p $PROJECT_ID gs://$STATE_BUCKET

# Enable versioning on the bucket
gsutil versioning set on gs://$STATE_BUCKET

# Block public access to the bucket
gsutil iam ch serviceAccount:terraform@$PROJECT_ID.iam.gserviceaccount.com:objectAdmin gs://$STATE_BUCKET
```

### Step 2: Create a Service Account (Optional but Recommended)

```bash
# Create a service account for Terraform
gcloud iam service-accounts create terraform \
  --display-name="Terraform Service Account" \
  --project=$PROJECT_ID

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:terraform@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:terraform@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/compute.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:terraform@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create a key file
gcloud iam service-accounts keys create terraform-key.json \
  --iam-account=terraform@$PROJECT_ID.iam.gserviceaccount.com
```

## Enable Backend Configuration

Once the state bucket is created:

1. Open `main.tf`
2. Uncomment the `backend "gcs"` block
3. Replace `your-project-terraform-state` with your actual bucket name and update the prefix if desired

```hcl
backend "gcs" {
  bucket  = "your-project-terraform-state"
  prefix  = "aba-to-wise"
}
```

## Authentication

### Option 1: Using Default Application Credentials

If you're authenticated with `gcloud auth application-default login`, Terraform will use those credentials automatically.

### Option 2: Using Service Account Key

Export the key path:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/terraform-key.json"
```

## Deploy

```bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan -out=tfplan

# Apply the configuration
terraform apply tfplan
```

## DNS Configuration (Manual)

After deployment, you must manually configure your domain with your hosting provider:

1. Get the deployment IP address:
   ```bash
   terraform output cdn_ip_address
   ```

2. Log in to your domain hosting provider (GoDaddy, Namecheap, Route53, etc.)

3. Update your DNS A record to point to the IP address from step 1

4. Wait for DNS propagation (15 minutes to 48 hours)

**Note**: Terraform does not manage DNS - all DNS configuration must be done through your domain hosting provider.

## Cleanup

To destroy all resources:

```bash
terraform destroy
```

**Note**: The bucket has `prevent_destroy = true` to avoid accidental deletion. Remove this if you want to destroy it.
