-- Add isCustomerReply field to TicketResponse
ALTER TABLE "TicketResponse" ADD COLUMN IF NOT EXISTS "isCustomerReply" BOOLEAN NOT NULL DEFAULT false;