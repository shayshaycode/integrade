# Integrade

This project embeds interactive widgets in a Learning Management System. The new `login.html` page allows users to sign in before accessing their activities.

## Setup

1. Configure database credentials in `includes/config.php`.
2. Create a `users` table with columns `id`, `username`, and `password_hash`.
3. Serve the project using a PHP-capable web server.

## Usage

Visit `login.html` to sign in. After successful login you will be redirected to `index.html` where activities can be launched.
