terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}
variable "supabase_access_token" {
  type      = string
  sensitive = true
}

provider "supabase" {
  access_token = var.supabase_access_token
}

# The main resource block that provisions your database
resource "supabase_project" "dev_db" {
  organization_id   = "qovkswtpgsnwgorxyqyv"
  name              = "sha-patisserie"
  database_password = "Cat020217"
  region            = "ap-southeast-1" # Singapore (closest region to Perth)
}

# Outputs the database URL format for your Next.js .env file
output "database_url" {
  value     = "postgresql://postgres:${resource.supabase_project.dev_db.database_password}@db.${resource.supabase_project.dev_db.id}.supabase.co:5432/postgres"
  sensitive = true
}