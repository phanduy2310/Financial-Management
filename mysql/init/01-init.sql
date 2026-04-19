CREATE DATABASE IF NOT EXISTS financial_auth;
CREATE DATABASE IF NOT EXISTS financial_transaction;
CREATE DATABASE IF NOT EXISTS financial_saving;
CREATE DATABASE IF NOT EXISTS financial_notification;
CREATE DATABASE IF NOT EXISTS financial_group;

CREATE USER IF NOT EXISTS 'finance_user'@'%' IDENTIFIED BY 'finance_pass';

GRANT ALL PRIVILEGES ON financial_auth.* TO 'finance_user'@'%';
GRANT ALL PRIVILEGES ON financial_transaction.* TO 'finance_user'@'%';
GRANT ALL PRIVILEGES ON financial_saving.* TO 'finance_user'@'%';
GRANT ALL PRIVILEGES ON financial_notification.* TO 'finance_user'@'%';
GRANT ALL PRIVILEGES ON financial_group.* TO 'finance_user'@'%';

FLUSH PRIVILEGES;
