-- All ENUM types for users-db
-- Flyway runs this once; all subsequent migrations can reference these types.

CREATE TYPE "enum_users_role" AS ENUM ('admin', 'user');
CREATE TYPE "enum_users_registerMethod" AS ENUM ('google', 'email');
CREATE TYPE "enum_otps_notificationType" AS ENUM ('email', 'sms', 'two-factor');
CREATE TYPE "enum_security_logs_severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "enum_user_activity_logs_activityType" AS ENUM (
    'LOGIN', 'LOGOUT', 'PROFILE_UPDATE', 'PASSWORD_CHANGE',
    'FILE_UPLOAD', 'FILE_DOWNLOAD', 'PURCHASE', 'API_ACCESS', 'SECURITY_EVENT'
);
CREATE TYPE "enum_user_activity_logs_level" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');
CREATE TYPE "enum_languages_code" AS ENUM (
    'EN', 'ES', 'FR', 'DE', 'IT', 'PT', 'ZH', 'JA', 'KO',
    'AR', 'RU', 'HI', 'YO', 'IG', 'HA', 'SW'
);
CREATE TYPE "enum_courses_level" AS ENUM ('foundation', 'builder', 'explorer');
CREATE TYPE "enum_contents_contentType" AS ENUM ('grammar_rule', 'proverb', 'normal');
CREATE TYPE "enum_contents_sourceType" AS ENUM ('new', 'ededun');
CREATE TYPE "enum_content_files_contentType" AS ENUM ('video', 'audio', 'image');
CREATE TYPE "enum_quizzes_quizType" AS ENUM ('MULTIPLE_CHOICE', 'FILL_IN_BLANK');
CREATE TYPE "enum_subscription_plans_planType" AS ENUM ('lifetime', 'annual', 'monthly');
CREATE TYPE "enum_user_subscriptions_status" AS ENUM (
    'active', 'cancelled', 'cancelling', 'expired', 'paused', 'failed'
);
CREATE TYPE "enum_transactions_paymentGateway" AS ENUM ('stripe', 'paypal');
CREATE TYPE "enum_transactions_transactionType" AS ENUM ('subscription', 'one_time', 'renewal', 'refund');
CREATE TYPE "enum_transactions_status" AS ENUM (
    'pending', 'processing', 'success', 'failed', 'refunded', 'cancelled'
);
CREATE TYPE "enum_transactions_planType" AS ENUM ('lifetime', 'annual', 'monthly');
CREATE TYPE "enum_notification_settings_frequency" AS ENUM ('daily', 'weekly', 'biweekly', 'never');
CREATE TYPE "enum_user_leaderboard_history_periodType" AS ENUM ('DAY', 'WEEK', 'MONTH');