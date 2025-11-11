# Demo Script: End-to-End Flow

## Objective
Demonstrate Customer creation, Invoice creation with line items, and Payment application across the UI.

## Prerequisites
- Backend running at `http://localhost:8080/api` (profile `dev` with H2 or default with SQLite).
- Frontend running at `http://localhost:3000/` and configured with `NEXT_PUBLIC_API_BASE_URL` to `/api`.

## Steps
1. Authentication
   - Log in using seeded credentials (e.g., `admin/password` under `dev` profile) or self-register if enabled.
2. Create Client
   - Navigate to `Clients` → `New Client`.
   - Provide name, email, phone, address.
   - Save and confirm client appears in the list.
3. Create Invoice
   - Navigate to `Invoices` → `New Invoice`.
   - Select the newly created client.
   - Add 1–3 line items with description, quantity, unit price.
   - Optionally set tax rate and notes.
   - Save and verify totals (subtotal, tax amount, total).
4. Apply Payment
   - Navigate to `Payments` → `Record Payment`.
   - Choose the invoice, enter amount, select payment method, set `receivedAt`.
   - Save and verify the invoice status transitions (`PARTIALLY_PAID` → `PAID`) and amounts.
5. Validate Dashboards
   - Open `Dashboard` to see charts update (status counts, monthly revenue, top clients).

## Tips for Recording a Video
- Capture the whole browser window and narrate each step.
- Keep dev tools closed for clarity; only open when highlighting API requests.
- End with Dashboard view to show updated metrics.