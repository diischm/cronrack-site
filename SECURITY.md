# Security policy

Please report security issues privately via GitHub:
**Security → Report a vulnerability** on this repository.

Do not open a public issue for security problems.

## Scope
- The landing page in `site/`
- The AWS infrastructure in `terraform/` (S3, CloudFront, ACM)

## Design notes
- The S3 bucket is private; only this CloudFront distribution can read it (Origin Access Control).
- TLS 1.2+ only, HSTS, a strict Content-Security-Policy, no third-party requests, no cookies, no analytics.
- Accepted scanner findings are documented inline with `#trivy:ignore` / `#checkov:skip` and a reason.
