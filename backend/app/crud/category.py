from sqlalchemy.orm import Session

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


def get_category_by_id_and_owner(
    db: Session,
    category_id: int,
    owner_id: int,
) -> Category | None:
    return (
        db.query(Category)
        .filter(Category.id == category_id, Category.owner_id == owner_id)
        .first()
    )


def get_category_by_name_and_owner(
    db: Session,
    name: str,
    owner_id: int,
) -> Category | None:
    return (
        db.query(Category)
        .filter(Category.name == name, Category.owner_id == owner_id)
        .first()
    )


def get_categories_by_owner(db: Session, owner_id: int) -> list[Category]:
    return (
        db.query(Category)
        .filter(Category.owner_id == owner_id)
        .order_by(Category.id.asc())
        .all()
    )


def create_category(
    db: Session,
    category_create: CategoryCreate,
    owner_id: int,
) -> Category:
    db_category = Category(
        name=category_create.name,
        owner_id=owner_id,
    )

    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return db_category


def update_category(
    db: Session,
    db_category: Category,
    category_update: CategoryUpdate,
) -> Category:
    update_data = category_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_category, field, value)

    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return db_category


def delete_category(db: Session, db_category: Category) -> None:
    db.delete(db_category)
    db.commit()