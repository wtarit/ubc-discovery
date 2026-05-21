from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = (
        "postgresql+asyncpg://ubcadmin:NewcomersDB2026!@localhost:5432/ubcnewcomers"
    )
    aws_region: str = "us-west-2"
    bedrock_model_id: str = "anthropic.claude-sonnet-4-6"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
