CREATE TABLE IF NOT EXISTS content_files (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "contentId"     UUID        NOT NULL,
    "contentType"   "enum_content_files_contentType" NOT NULL DEFAULT 'audio',
    "filePath"      VARCHAR(255) NOT NULL,
    description     TEXT,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);