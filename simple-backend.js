const http = require('http');
const url = require('url');

const PORT = 8080;

// Simple in-memory data storage
let users = [];
let invoices = [];
let clients = [];
let payments = [];

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
};

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                resolve({});
            }
        });
    });
}

function sendResponse(res, status, data) {
    res.writeHead(status, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    console.log(`${method} ${path}`);

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }

    // Health check
    if (path === '/api/actuator/health' && method === 'GET') {
        sendResponse(res, 200, { status: 'UP' });
        return;
    }

    // Auth endpoints
    if (path === '/api/auth/register' && method === 'POST') {
        const body = await parseBody(req);
        const user = {
            id: 'user-' + Date.now(),
            name: body.name,
            email: body.email,
            role: body.role || 'USER'
        };
        users.push(user);
        sendResponse(res, 201, user);
        return;
    }

    if (path === '/api/auth/login' && method === 'POST') {
        const body = await parseBody(req);
        const response = {
            token: 'mock-jwt-token-' + Date.now(),
            id: 'user-' + Date.now(),
            name: body.email.split('@')[0],
            email: body.email,
            role: 'USER'
        };
        sendResponse(res, 200, response);
        return;
    }

    // Invoices endpoints
    if (path === '/api/invoices' && method === 'GET') {
        sendResponse(res, 200, invoices);
        return;
    }

    if (path === '/api/invoices' && method === 'POST') {
        const body = await parseBody(req);
        const invoice = {
            id: 'invoice-' + Date.now(),
            number: 'INV-' + Date.now(),
            clientId: body.clientId,
            issueDate: body.issueDate,
            dueDate: body.dueDate,
            status: body.status || 'DRAFT',
            taxRate: body.taxRate || 0,
            notes: body.notes || '',
            items: body.items || [],
            subtotal: 0,
            taxAmount: 0,
            total: 0,
            paidAmount: 0,
            balance: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        invoices.push(invoice);
        sendResponse(res, 201, invoice);
        return;
    }

    // Clients endpoints
    if (path === '/api/clients' && method === 'GET') {
        sendResponse(res, 200, clients);
        return;
    }

    if (path === '/api/clients' && method === 'POST') {
        const body = await parseBody(req);
        const client = {
            id: 'client-' + Date.now(),
            name: body.name,
            email: body.email,
            phone: body.phone || '',
            address: body.address || '',
            city: body.city || '',
            state: body.state || '',
            zipCode: body.zipCode || '',
            country: body.country || '',
            taxId: body.taxId || '',
            notes: body.notes || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        clients.push(client);
        sendResponse(res, 201, client);
        return;
    }

    // Payments endpoints
    if (path === '/api/payments' && method === 'GET') {
        sendResponse(res, 200, payments);
        return;
    }

    if (path === '/api/payments' && method === 'POST') {
        const body = await parseBody(req);
        const payment = {
            id: 'payment-' + Date.now(),
            invoiceId: body.invoiceId,
            amount: body.amount,
            method: body.method,
            status: 'COMPLETED',
            receivedAt: body.receivedAt || new Date().toISOString(),
            reference: body.reference || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        payments.push(payment);
        sendResponse(res, 201, payment);
        return;
    }

    // 404 for unknown routes
    sendResponse(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
    console.log(`Simple backend server running on http://localhost:${PORT}/api`);
});