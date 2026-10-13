# Architecture rules

- Driver-license downloads use the shared admin download control with fresh signed URLs from private storage and unchanged file bytes; never expose the bucket publicly or download a rendered thumbnail.
- Invoice remarks use the existing invoices.notes column and are rendered from stored invoice data during PDF regeneration, so manual remarks persist without changing reservation notes or totals.