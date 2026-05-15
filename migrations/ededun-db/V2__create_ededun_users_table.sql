CREATE TABLE IF NOT EXISTS "User" (
    id              UUID        PRIMARY KEY,
    "firstName"     VARCHAR(255),
    "lastName"      VARCHAR(255),
    email           TEXT        NOT NULL UNIQUE,
    phone           VARCHAR(255),
    role            "enum_User_role" NOT NULL,
    gender          "enum_User_gender" NOT NULL,
    "ageGroup"      "enum_User_ageGroup" NOT NULL,
    password        TEXT,
    "refreshToken"  TEXT,
    "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
