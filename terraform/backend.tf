terraform {
  # Partial backend config. Bucket / key / region passed via -backend-config in CI.
  backend "s3" {}
}
