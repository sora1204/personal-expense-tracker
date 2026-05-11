# Personal Expense Tracker

FastAPI + PostgreSQL + React + TypeScript + Docker Compose で作成した個人支出管理アプリです。

ユーザー登録・ログイン・JWT認証・カテゴリ管理・支出管理・月別集計・カテゴリ別集計を実装しています。

## 概要

このアプリは、ログインしたユーザーが自分の支出を記録・管理できるWebアプリです。

主な目的は、バックエンドAPIとフロントエンドを接続する流れを理解することです。

特に以下を学ぶために作成しました。

- FastAPIによるAPI設計
- PostgreSQLとの接続
- SQLAlchemyによるDB操作
- Pydanticによる入力・出力スキーマ設計
- JWTによる認証
- React + TypeScriptからAPIを呼び出す流れ
- axiosによる共通APIクライアント設計
- React Contextによるログイン状態管理
- Docker Composeによる複数コンテナ構成

## 使用技術

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL
- Pydantic
- PyJWT
- pwdlib[argon2]

### Frontend

- React
- TypeScript
- Vite
- React Router
- axios
- CSS

### Infrastructure

- Docker
- Docker Compose

## 主な機能

### 認証機能

- ユーザー登録
- ログイン
- JWTアクセストークン発行
- ログイン中ユーザー取得
- ログアウト
- 認証が必要なAPIの保護

### カテゴリ管理

- カテゴリ一覧表示
- カテゴリ作成
- カテゴリ更新
- カテゴリ削除

### 支出管理

- 支出一覧表示
- 支出作成
- 支出更新
- 支出削除
- 日付による絞り込み
- カテゴリによる絞り込み

### 集計機能

- 月別支出合計
- カテゴリ別支出合計

## 画面構成

| パス | 内容 |
|---|---|
| `/login` | ログイン画面 |
| `/register` | ユーザー登録画面 |
| `/dashboard` | ログイン中ユーザー情報・メニュー |
| `/categories` | カテゴリ管理画面 |
| `/expenses` | 支出管理画面 |

## API一覧

### Auth API

| Method | Endpoint | 内容 |
|---|---|---|
| POST | `/auth/register` | ユーザー登録 |
| POST | `/auth/login` | ログイン・JWT発行 |

### User API

| Method | Endpoint | 内容 |
|---|---|---|
| GET | `/users/me` | ログイン中ユーザー取得 |

### Category API

| Method | Endpoint | 内容 |
|---|---|---|
| GET | `/categories` | カテゴリ一覧取得 |
| POST | `/categories` | カテゴリ作成 |
| PUT | `/categories/{category_id}` | カテゴリ更新 |
| DELETE | `/categories/{category_id}` | カテゴリ削除 |

### Expense API

| Method | Endpoint | 内容 |
|---|---|---|
| GET | `/expenses` | 支出一覧取得 |
| POST | `/expenses` | 支出作成 |
| GET | `/expenses/{expense_id}` | 支出詳細取得 |
| PUT | `/expenses/{expense_id}` | 支出更新 |
| DELETE | `/expenses/{expense_id}` | 支出削除 |
| GET | `/expenses/summary/monthly` | 月別支出合計 |
| GET | `/expenses/summary/by-category` | カテゴリ別支出合計 |

## ディレクトリ構成

```text
personal-expense-tracker/
  docker-compose.yml
  README.md
  .env.example

  backend/
    Dockerfile
    requirements.txt
    app/
      main.py
      core/
        config.py
        security.py
      db/
        base.py
        database.py
        init_db.py
      models/
        user.py
        category.py
        expense.py
      schemas/
        user.py
        auth.py
        category.py
        expense.py
      crud/
        user.py
        category.py
        expense.py
      api/
        deps.py
        routes/
          auth.py
          users.py
          categories.py
          expenses.py

  frontend/
    Dockerfile
    package.json
    index.html
    vite.config.ts
    tsconfig.json
    src/
      main.tsx
      App.tsx
      styles.css
      api/
        client.ts
        auth.ts
        categories.ts
        expenses.ts
      contexts/
        AuthContext.tsx
      pages/
        LoginPage.tsx
        RegisterPage.tsx
        DashboardPage.tsx
        CategoriesPage.tsx
        ExpensesPage.tsx
      types/
        user.ts
        auth.ts
        category.ts
        expense.ts