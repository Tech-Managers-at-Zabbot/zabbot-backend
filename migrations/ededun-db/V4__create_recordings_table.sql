CREATE TABLE IF NOT EXISTS "Recordings" (
    id              UUID    PRIMARY KEY,
    user_id         UUID    REFERENCES "User"(id),
    phrase_id       UUID    REFERENCES "Phrases"(id),
    recording_url   TEXT,
    status          VARCHAR(255),
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
