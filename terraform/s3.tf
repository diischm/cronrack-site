data "aws_caller_identity" "me" {}

#trivy:ignore:AVD-AWS-0089 Access logging not needed: only CloudFront can read this bucket; CloudTrail records API calls
resource "aws_s3_bucket" "site" {
  #checkov:skip=CKV_AWS_18:Access logging not needed: only CloudFront can read this bucket; CloudTrail records API calls
  #checkov:skip=CKV2_AWS_62:No event notifications needed: nothing reacts to uploads
  #checkov:skip=CKV_AWS_144:No cross-region replication: static landing page, source is in git
  #checkov:skip=CKV_AWS_145:SSE-S3 is used: the content is the public website, a customer-managed KMS key adds cost without protection
  bucket = "cronrack-site-${data.aws_caller_identity.me.account_id}"
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

#trivy:ignore:AVD-AWS-0132 SSE-S3 is used: the content is the public website, a customer-managed KMS key adds cost without protection
resource "aws_s3_bucket_server_side_encryption_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "site" {
  bucket     = aws_s3_bucket.site.id
  depends_on = [aws_s3_bucket_versioning.site]

  rule {
    id     = "expire-old-versions"
    status = "Enabled"
    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}
