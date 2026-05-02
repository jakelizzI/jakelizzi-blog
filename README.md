# Astro Blog with Cloudflare D1 & Google OAuth

Astroをベースに構築された、高速でセキュアな動的ブログシステムです。
静的サイトジェネレーター(SSG)の枠を超え、Cloudflare Pages 上で SSR (Server-Side Rendering) を行い、Cloudflare D1 (SQLite) と直接通信して記事を配信・管理します。

## 🌟 主な機能

- **セキュアな管理者ダッシュボード (`/admin`)**
  - Auth.js を用いた Google OAuth 認証による強力なログイン保護
  - 事前に設定した管理者メールアドレス(`ADMIN_EMAIL`)を持つユーザーのみがアクセス可能
- **高機能な記事エディタ**
  - Markdownのリアルタイムプレビュー機能
  - リロード不要の「下書き保存 (非同期保存)」と「公開」ステータス管理
  - 記事作成画面から直接新しいカテゴリーを作成できるシームレスなUI
- **高速な配信環境**
  - Cloudflare Pages + Cloudflare D1 ネイティブ対応によるエッジ配信
  - ローカル開発時は `libsql` を利用してファイルベースのSQLite (`local.db`) で完結

## 🛠 テクノロジースタック

- **Framework**: [Astro](https://astro.build/) (v5) + `@astrojs/cloudflare`
- **Database**: SQLite (Production: Cloudflare D1 / Local: `@libsql/client`)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Auth.js](https://authjs.dev/) (`auth-astro`)
- **Markdown Parsing**: `marked` (サーバーサイドおよびクライアントサイドプレビュー両用)
- **Styling**: Vanilla CSS (CSS Variablesを活用したカスタムデザイン)

## 📁 プロジェクト構成

```text
.
├── src/
│   ├── db/
│   │   └── schema.ts          # Drizzle ORMのスキーマ定義（articles, categories）
│   ├── layouts/
│   │   └── BaseLayout.astro   # 共通のHTMLレイアウトテンプレート
│   ├── pages/
│   │   ├── admin/             # 管理者用機能（認証で保護されたルート）
│   │   │   ├── api/           # 記事・カテゴリのCRUD用エンドポイント
│   │   │   ├── edit/[id].astro# 記事編集画面
│   │   │   ├── index.astro    # 管理ダッシュボード
│   │   │   └── new.astro      # 新規記事作成画面
│   │   ├── articles/
│   │   │   └── [slug].astro   # 公開用の記事詳細画面
│   │   ├── index.astro        # ブログのトップページ（公開済みの記事一覧）
│   │   └── login.astro        # Googleログイン画面
│   ├── env.d.ts               # Astroの型定義（dbの型解決等を含む）
│   └── middleware.ts          # 認証保護・DBクライアント初期化ミドルウェア
├── scripts/
│   └── seed.ts                # 初期データ投入スクリプト
├── drizzle.config.ts          # Drizzleの設定ファイル
└── astro.config.mjs           # Astroの設定ファイル（AuthやCloudflareアダプタ）
```

## 🚀 開発環境のセットアップ

### 1. Nix環境でのコマンド実行ルール
本プロジェクトは Nix 環境を使用しています。Node/Bunコマンドを実行する際は、**必ず `nix develop -c` をプレフィックスとして付与してください。**

### 2. 環境変数の設定
プロジェクトルートに `.env` ファイルを作成し、以下の値を設定します。

```env
# 認証のコールバックURL（ローカル開発時）
AUTH_URL=http://localhost:4321

# セッション暗号化用のランダム文字列 ( `openssl rand -base64 32` などで生成 )
AUTH_SECRET=your_auth_secret_here

# Google OAuth設定（Google Cloud Consoleから取得）
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# 管理者のメールアドレス (このアドレスを持つGoogleアカウントのみが /admin に入れます)
ADMIN_EMAIL=your_email@gmail.com
```

### 3. インストールとDB準備

依存関係のインストール:
```bash
nix develop -c bun install
```

データベーススキーマの反映（マイグレーション）:
```bash
nix develop -c bunx drizzle-kit push
```

*(オプション)* サンプルデータを投入する場合:
```bash
nix develop -c bun run scripts/seed.ts
```

### 4. ローカルサーバーの起動

```bash
nix develop -c bun run dev
```
起動後、`http://localhost:4321` にアクセスしてブログを確認します。管理画面には `http://localhost:4321/admin` からアクセスし、設定したGoogleアカウントでログインしてください。

## 📝 使い方（運用フロー）

1. **ログイン**: `/login` にアクセスし「Googleでログイン」ボタンをクリックします。
2. **管理ダッシュボード**: ログインに成功するとダッシュボード (`/admin`) が表示されます。
3. **記事の作成**: 「新規記事作成」ボタンからエディタを開きます。
   - マークダウンで本文を書きながら、右側のプレビューで表示を確認できます。
   - 「カテゴリー」は既存のものから選ぶか、「+ 新規追加」でその場で新しいカテゴリを作れます。
   - 書き途中の場合は **「下書き保存」** をクリックすると、非公開状態のまま保存されます（画面遷移しません）。
4. **公開**: 記事が完成したら **「公開する」** をクリックします。これでブログトップページや記事URLからアクセス可能になります。
