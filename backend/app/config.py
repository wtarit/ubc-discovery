from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str

    api_base_url: str = "http://localhost:8000"

    aws_region: str = "us-west-2"
    s3_bucket_name: str = ""
    s3_endpoint_url: str = "https://s3.us-west-2.amazonaws.com"
    sns_platform_app_arn: str = ""

    firebase_credentials_json: str = ""
    firebase_project_id: str = ""

    bedrock_model_id: str = "anthropic.claude-sonnet-4-6"

    email_sender_email: str = ""
    otp_expiry_minutes: int = 10
    otp_max_attempts: int = 5
    otp_rate_limit_per_15min: int = 3

    admin_api_key: str = ""

    cors_allowed_origins: list[str] = [
        "http://localhost:5173",  # React Router web dev server
    ]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
