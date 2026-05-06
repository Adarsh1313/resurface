ALTER TABLE "waitlist_entries"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN "invite_token" TEXT,
ADD COLUMN "invited_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "waitlist_entries_invite_token_key" ON "waitlist_entries"("invite_token");
CREATE INDEX "waitlist_entries_status_idx" ON "waitlist_entries"("status");
