CREATE TYPE "enum_User_role" AS ENUM ('User', 'Admin', 'SuperAdmin');
CREATE TYPE "enum_User_gender" AS ENUM ('male', 'female');
CREATE TYPE "enum_User_ageGroup" AS ENUM ('child', 'teenager', 'adult');
CREATE TYPE "enum_Phrases_phrase_category" AS ENUM (
    'Body Part', 'Word', 'Counting Number', 'Days of the Week',
    'Relationship', 'Phrase', 'Sentence', 'Color', 'Question', 'Other'
);
