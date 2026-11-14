locals {
  domain = "cronrack.xyz"
}

resource "aws_acm_certificate" "site" {
  provider                  = aws.us_east_1
  domain_name               = local.domain
  subject_alternative_names = ["www.${local.domain}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}
