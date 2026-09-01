from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AssetBase(BaseModel):
    asset_code: str
    name: str
    type: str
    location: Optional[str] = None
    status: str = "operational"


class AssetCreate(AssetBase):
    pass


class AssetResponse(AssetBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
