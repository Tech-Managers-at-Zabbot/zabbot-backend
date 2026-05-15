CREATE TABLE IF NOT EXISTS waiting_lists (
    id                  UUID        PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    country             VARCHAR(255) NOT NULL,
    "sendUpdates"       BOOLEAN     NOT NULL DEFAULT FALSE,
    "betaTest"          BOOLEAN     NOT NULL DEFAULT FALSE,
    "contributeSkills"  BOOLEAN     NOT NULL DEFAULT FALSE,
    "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
