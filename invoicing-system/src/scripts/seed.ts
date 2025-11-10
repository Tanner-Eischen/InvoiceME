import { db } from "../lib/db";
import { clients, invoices, invoiceItems, users } from "../lib/db/schema";
import { v4 as uuidv4 } from "uuid";
import { hash } from "../lib/auth/password";

async function seed() {
  console.log("Seeding database...");

  try {
    // Clean up existing data
    await db.delete(invoiceItems);
    await db.delete(invoices);
    await db.delete(clients);
    await db.delete(users);

    // Create admin user
    const adminId = uuidv4();
    await db.insert(users).values({
      id: adminId,
      name: "Admin User",
      email: "admin@example.com",
      password: await hash("password123"),
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create some clients
    const clientIds = [];
    const clientData = [
      {
        name: "Acme Inc",
        email: "accounts@acme.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main St, Metropolis, NY 10001",
      },
      {
        name: "Globex Corporation",
        email: "billing@globex.com",
        phone: "+1 (555) 987-6543",
        address: "456 Tech Blvd, Silicon Valley, CA 94043",
      },
      {
        name: "Wayne Enterprises",
        email: "finance@wayne.com",
        phone: "+1 (555) 228-4377",
        address: "1007 Mountain Drive, Gotham City, NJ 07101",
      },
    ];

    for (const client of clientData) {
      const clientId = uuidv4();
      clientIds.push(clientId);

      await db.insert(clients).values({
        id: clientId,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create some invoices
    const invoiceData = [
      {
        clientId: clientIds[0],
        number: "INV-2025-001",
        issueDate: new Date("2025-10-01"),
        dueDate: new Date("2025-10-31"),
        status: "sent",
        subtotal: 2000,
        taxRate: 10,
        taxAmount: 200,
        total: 2200,
        notes: "Net 30 payment terms",
        items: [
          {
            description: "Web Development Services",
            quantity: 20,
            unitPrice: 100,
            amount: 2000,
          },
        ],
      },
      {
        clientId: clientIds[1],
        number: "INV-2025-002",
        issueDate: new Date("2025-09-15"),
        dueDate: new Date("2025-10-15"),
        status: "paid",
        subtotal: 5000,
        taxRate: 10,
        taxAmount: 500,
        total: 5500,
        notes: "Paid in full",
        items: [
          {
            description: "UI/UX Design",
            quantity: 25,
            unitPrice: 120,
            amount: 3002,
          },
          {
            description: "Mobile App Development",
            quantity: 10,
            unitPrice: 200,
            amount: 2000,
          },
        ],
      },
      {
        clientId: clientIds[2],
        number: "INV-2025-003",
        issueDate: new Date("2025-10-05"),
        dueDate: new Date("2025-11-05"),
        status: "draft",
        subtotal: 7500,
        taxRate: 10,
        taxAmount: 750,
        total: 8250,
        notes: "Draft invoice pending approval",
        items: [
          {
            description: "Security Consulting",
            quantity: 15,
            unitPrice: 250,
            amount: 3750,
          },
          {
            description: "Infrastructure Setup",
            quantity: 1,
            unitPrice: 3750,
            amount: 3750,
          },
        ],
      },
    ];

    for (const invoice of invoiceData) {
      const invoiceId = uuidv4();

      await db.insert(invoices).values({
        id: invoiceId,
        clientId: invoice.clientId,
        number: invoice.number,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status as "draft" | "sent" | "paid" | "overdue" | "canceled",
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        notes: invoice.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create invoice items
      for (const item of invoice.items) {
        await db.insert(invoiceItems).values({
          id: uuidv4(),
          invoiceId: invoiceId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
