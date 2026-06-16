from unittest.mock import MagicMock

from app.config import settings
from app.services import s3


def test_generate_presigned_upload_url_enforces_profile_photo_size(monkeypatch):
    client = MagicMock()
    client.generate_presigned_post.return_value = {
        "url": "https://s3.example.com/presigned",
        "fields": {"key": "profile-pictures/mock"},
    }
    monkeypatch.setattr(s3, "_client", lambda: client)
    monkeypatch.setattr(settings, "s3_bucket_name", "test-bucket")
    monkeypatch.setattr(settings, "profile_photo_max_bytes", 1234)

    upload_url, fields, file_key = s3.generate_presigned_upload_url("image/webp")

    assert upload_url == "https://s3.example.com/presigned"
    assert fields == {"key": "profile-pictures/mock"}
    assert file_key.startswith("profile-pictures/")
    client.generate_presigned_post.assert_called_once()
    kwargs = client.generate_presigned_post.call_args.kwargs
    assert kwargs["Bucket"] == "test-bucket"
    assert kwargs["Fields"]["Content-Type"] == "image/webp"
    assert ["content-length-range", 1, 1234] in kwargs["Conditions"]
