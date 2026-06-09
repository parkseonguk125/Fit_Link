-- Case-insensitive unique nicknames (trimmed values are enforced in application code)
CREATE UNIQUE INDEX "User_displayName_lower_key" ON "User" (LOWER("displayName"));
