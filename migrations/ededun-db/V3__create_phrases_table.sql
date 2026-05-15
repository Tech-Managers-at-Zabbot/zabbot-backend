CREATE TABLE IF NOT EXISTS "Phrases" (
    id                      UUID        PRIMARY KEY,
    english_text            TEXT,
    yoruba_text             TEXT,
    pronounciation_note     VARCHAR(255),
    phrase_category         "enum_Phrases_phrase_category" DEFAULT 'Other',
    "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
