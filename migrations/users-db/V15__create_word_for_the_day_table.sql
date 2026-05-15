CREATE TABLE IF NOT EXISTS "wordForTheDay" (
    id                  UUID        PRIMARY KEY,
    "languageId"        UUID        NOT NULL REFERENCES languages(id),
    "dateUsed"          DATE,
    "audioUrls"         JSON        NOT NULL,
    "languageText"      VARCHAR(255) NOT NULL,
    "englishText"       VARCHAR(255) NOT NULL,
    "isActive"          BOOLEAN     NOT NULL DEFAULT TRUE,
    "pronunciationNote" VARCHAR(255),
    "isUsed"            BOOLEAN     NOT NULL DEFAULT FALSE,
    "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "wordForTheDay_languageId_dateUsed_unique_idx"
    ON "wordForTheDay" ("languageId", "dateUsed");
