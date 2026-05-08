from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def get_expense_by_id_and_owner(
    db: Session,
    expense_id: int,
    owner_id: int,
) -> Expense | None:
    return (
        db.query(Expense)
        .filter(Expense.id == expense_id, Expense.owner_id == owner_id)
        .first()
    )


def get_expenses_by_owner(
    db: Session,
    owner_id: int,
    start_date: date | None = None,
    end_date: date | None = None,
    category_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[Expense]:
    query = db.query(Expense).filter(Expense.owner_id == owner_id)

    if start_date is not None:
        query = query.filter(Expense.spent_at >= start_date)

    if end_date is not None:
        query = query.filter(Expense.spent_at <= end_date)

    if category_id is not None:
        query = query.filter(Expense.category_id == category_id)

    return (
        query.order_by(Expense.spent_at.desc(), Expense.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_expense(
    db: Session,
    expense_create: ExpenseCreate,
    owner_id: int,
) -> Expense:
    db_expense = Expense(
        title=expense_create.title,
        amount=expense_create.amount,
        spent_at=expense_create.spent_at,
        memo=expense_create.memo,
        category_id=expense_create.category_id,
        owner_id=owner_id,
    )

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    return db_expense


def update_expense(
    db: Session,
    db_expense: Expense,
    expense_update: ExpenseUpdate,
) -> Expense:
    update_data = expense_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_expense, field, value)

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    return db_expense


def delete_expense(db: Session, db_expense: Expense) -> None:
    db.delete(db_expense)
    db.commit()


def get_monthly_total(
    db: Session,
    owner_id: int,
    year: int,
    month: int,
) -> int:
    if month == 12:
        start_date = date(year, 12, 1)
        end_date = date(year + 1, 1, 1)
    else:
        start_date = date(year, month, 1)
        end_date = date(year, month + 1, 1)

    total = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(
            Expense.owner_id == owner_id,
            Expense.spent_at >= start_date,
            Expense.spent_at < end_date,
        )
        .scalar()
    )

    return int(total)


def get_category_totals(
    db: Session,
    owner_id: int,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[tuple[int | None, str | None, int]]:
    query = (
        db.query(
            Expense.category_id,
            Category.name,
            func.coalesce(func.sum(Expense.amount), 0).label("total_amount"),
        )
        .outerjoin(Category, Expense.category_id == Category.id)
        .filter(Expense.owner_id == owner_id)
        .group_by(Expense.category_id, Category.name)
        .order_by(func.coalesce(func.sum(Expense.amount), 0).desc())
    )

    if start_date is not None:
        query = query.filter(Expense.spent_at >= start_date)

    if end_date is not None:
        query = query.filter(Expense.spent_at <= end_date)

    results = query.all()

    return [
        (
            category_id,
            category_name,
            int(total_amount),
        )
        for category_id, category_name, total_amount in results
    ]