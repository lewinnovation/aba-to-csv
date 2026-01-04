# Terraform Deployment Steps

Quick start guide for deploying the ABA to Wise converter on GCP.

## Prerequisites

- GCP Project created
- `gcloud` CLI installed and configured
- `terraform` CLI installed (v1.0+)
- Node.js and npm (to build the static site)

## Step 1: Build the Static Site

From the project root:

```bash
npm run build
```

This generates the `dist/` directory with your static HTML, CSS, and JavaScript files.

## Step 2: Prepare Terraform Variables

1. Copy the example variables file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` with your GCP project details:
   ```hcl
   project_id = "my-gcp-project"
   region     = "us-central1"
   bucket_name = "aba-to-wise-prod"
   ```

## Step 3: Initialize Terraform

```bash
cd terraform
terraform init
```

If you've already set up the GCS backend, uncomment the backend block in `main.tf` before running init.

## Step 4: Plan and Deploy

```bash
# Review the changes
terraform plan

# Deploy
terraform apply
```

Terraform will:
- Create a Cloud Storage bucket
- Upload your static files with appropriate cache headers
- Set up Cloud CDN (if enabled)
- Configure global load balancing
- Output your deployment URLs

## Step 5: Configure DNS

Use the IP address from the `cdn_ip_address` output to create an A record in your domain provider pointing to your GCP deployment.

```bash
# View outputs
terraform output
```

## Updating the Site

After making changes to your site:

1. Build the new version: `npm run build`
2. Redeploy: `terraform apply`

Terraform will detect changes and update only the modified files.

## Common Tasks

### DNS Troubleshooting

If your domain isn't working after deployment:

1. Verify the A record was created correctly:
   ```bash
   nslookup yourdomain.com
   ```

2. Check that the returned IP matches the `cdn_ip_address` from Terraform

3. Wait longer for DNS propagation (up to 48 hours)

4. Clear your browser cache or try in an incognito window

### Disable CDN

Set `enable_cdn = false` in `terraform.tfvars` if you want a simpler deployment without load balancing.

### View Current State

```bash
terraform show
```

### Destroy Resources

```bash
terraform destroy
```

(Note: The bucket has protection enabled to prevent accidental deletion in production)
