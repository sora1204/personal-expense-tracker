from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

class ExpenseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    amount: int = Field(..., gt=0)
    spent_at: date
    memo: str | None = Field(default=None, max_length=1000)
    category_id: int | None = None

class ExpenseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=100)
    amount: int | None = Field(default=None, gt=0)
    spent_at: date | None = None
    memo: str | None = Field(default=None, max_length=1000)
    category_id: int | None = None

class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    amount: int
    spent_at: date
    memo: str | None
    category_id: int | None
    owner_id: int
    created_at: datetime
    updated_at: datetime

class MonthlySummaryResponse(BaseModel):
    year: int
    month: int
    total_amount: int

class CategorySummaryItem(BaseModel):
    category_id: int | None
    category_name: str | None
    total_amount: int