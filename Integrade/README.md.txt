# Integrade

This project embeds interactive widgets in a Learning Management System. The `login.html` page allows returning users to sign in while `signup.html` lets new users create an account.

## Setup

1. Configure database credentials in `includes/config.php`.
2. Create a `users` table with columns `id`, `username`, and `password_hash`.
3. Create an `activities` table with columns `id`, `user_id`, `name`, and `created_at`.
4. Create a `poll_results` table with columns `id`, `room`, `question_idx`, `option_idx`, and `created_at` for storing poll submissions.
5. Serve the project using a PHP-capable web server.

## Usage

First visit `signup.html` to create an account. Once registered you can sign in via `login.html`. After successful login you will be redirected to `index.html` where activities can be launched.
