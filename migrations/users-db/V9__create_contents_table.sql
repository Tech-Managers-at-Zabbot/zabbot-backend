CREATE TABLE IF NOT EXISTS contents (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "lessonId"           UUID        NOT NULL,
    "languageId"         UUID        NOT NULL,
    "isGrammarRule"      BOOLEAN     NOT NULL DEFAULT FALSE,
    "contentType"        "enum_contents_contentType" NOT NULL DEFAULT 'normal',
    proverb              TEXT,
    "grammarTitle"       TEXT,
    "grammarSubtitle"    TEXT,
    "grammarDescription" JSON,
    "grammarExamples"    JSON,
    "sourceType"         "enum_contents_sourceType" NOT NULL DEFAULT 'new',
    "customText"         TEXT,
    "ededunPhrases"      JSON,
    translation          VARCHAR(255) NOT NULL,
    "createdAt"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"          TIMESTAMPTZ
);