from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.crud.category import get_category_by_id_and_owner
from app.crud.expense import (
    create_expense,
    delete_expense,
    get_category_totals,
    get_expense_by_id_and_owner,
    get_expenses_by_owner,
    get_monthly_total,
    update_expense,
)
from app.db.database import get_db
from app.models.user import User
from app.schemas.expense import (
    CategorySummaryItem,
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate,
    MonthlySummaryResponse,
)

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.get(
    "",
    response_model=list[ExpenseResponse],
)
def read_expenses(
    start_date: date | None = None,
    end_date: date | None = None,
    category_id: int | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if category_id is not None:
        category = get_category_by_id_and_owner(
            db=db,
            category_id=category_id,
            owner_id=current_user.id,
        )

        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

    expenses = get_expenses_by_owner(
        db=db,
        owner_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
        category_id=category_id,
        skip=skip,
        limit=limit,
    )

    return expenses


@router.post(
    "",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_expense_api(
    expense_create: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if expense_create.category_id is not None:
        category = get_category_by_id_and_owner(
            db=db,
            category_id=expense_create.category_id,
            owner_id=current_user.id,
        )

        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

    expense = create_expense(
        db=db,
        expense_create=expense_create,
        owner_id=current_user.id,
    )

    return expense


@router.get(
    "/summary/monthly",
    response_model=MonthlySummaryResponse,
)
def read_monthly_summary(
    year: int = Query(..., ge=1900, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_amount = get_monthly_total(
        db=db,
        owner_id=current_user.id,
        year=year,
        month=month,
    )

    return MonthlySummaryResponse(
        year=year,
        month=month,
        total_amount=total_amount,
    )


@router.get(
    "/summary/by-category",
    response_model=list[CategorySummaryItem],
)
def read_category_summary(
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category_totals = get_category_totals(
        db=db,
        owner_id=current_user.id,
        start_date=start_date,
        end_date=end_date,
    )

    return [
        CategorySummaryItem(
            category_id=category_id,
            category_name=category_name,
            total_amount=total_amount,
        )
        for category_id, category_name, total_amount in category_totals
    ]


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    expense = get_expense_by_id_and_owner(
        db=db,
        expense_id=expense_id,
        owner_id=current_user.id,
    )

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )

    return expense


@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse,
)
def update_expense_api(
    expense_id: int,
    expense_update: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_expense = get_expense_by_id_and_owner(
        db=db,
        expense_id=expense_id,
        owner_id=current_user.id,
    )

    if db_expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )

    update_data = expense_update.model_dump(exclude_unset=True)

    if "category_id" in update_data and update_data["category_id"] is not None:
        category = get_category_by_id_and_owner(
            db=db,
            category_id=update_data["category_id"],
            owner_id=current_user.id,
        )

        if category is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found",
            )

    updated_expense = update_expense(
        db=db,
        db_expense=db_expense,
        expense_update=expense_update,
    )

    return updated_expense


@router.delete(
    "/{expense_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_expense_api(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_expense = get_expense_by_id_and_owner(
        db=db,
        expense_id=expense_id,
        owner_id=current_user.id,
    )

    if db_expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found",
        )

    delete_expense(
        db=db,
        db_expense=db_expense,
    )

    return None