# cronrack-site

Landing page for [CronRack](https://github.com/diischm/cronrack), served at https://cronrack.xyz.

## Architecture

browser ──HTTPS (TLS 1.2+)──▶ CloudFront ──signed (OAC)──▶ private S3 bucket
│ security headers (CSP, HSTS, …)
│ HTTP → HTTPS redirect
└─ certificate: ACM (us-east-1), DNS-validated


## Infrastructure (Terraform)

| File | Creates |
|---|---|
| `providers.tf` | AWS provider (eu-north-1) + us-east-1 alias for the certificate |
| `s3.tf` | Private bucket: public access blocked, SSE-S3, versioning, lifecycle |
| `cloudfront.tf` | Distribution, Origin Access Control, security headers, bucket policy |
| `acm.tf` | TLS certificate for cronrack.xyz and www, DNS validation |
| `outputs.tf` | Site URL, distribution ID, bucket name, validation records |

## Security

- Bucket is private; only this distribution can read it (`AWS:SourceArn` condition).
- Bucket policy denies any non-HTTPS request.
- TLS 1.2+ only; strict CSP (no inline code, no third-party requests); HSTS.
- Scanners in CI: trivy, checkov, tflint, gitleaks. Accepted findings are documented inline.

## Deploy

```sh
aws s3 sync site/ s3://<bucket>/ --delete
aws cloudfront create-invalidation --distribution-id <distribution-id> --paths "/*"
```

## CI

`.github/workflows/checks.yml` runs on every pull request: terraform fmt/validate/tflint,
trivy, checkov, gitleaks, and site checks (CSP rules, HTML validity, broken links).
