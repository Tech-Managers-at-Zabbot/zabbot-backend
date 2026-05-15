CREATE TABLE IF NOT EXISTS reference_pronunciation (
    id              UUID        PRIMARY KEY,
    "englishWord"   VARCHAR(255) NOT NULL,
    "yorubaWord"    VARCHAR(255) NOT NULL,
    "femaleVoice"   VARCHAR(255) NOT NULL,
    "maleVoice"     VARCHAR(255) NOT NULL,
    tone            VARCHAR(255) NOT NULL,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
