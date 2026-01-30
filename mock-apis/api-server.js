const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const SERVICE = process.env.SERVICE || 'users';

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: `${SERVICE} API`,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Service-specific endpoints
if (SERVICE === 'users') {
  app.get('/v1/users', (req, res) => {
    res.json({
      success: true,
      data: {
        users: [
          { id: '1', name: 'John Doe', email: 'john@company.com', role: 'admin' },
          { id: '2', name: 'Jane Smith', email: 'jane@company.com', role: 'developer' },
          { id: '3', name: 'Bob Wilson', email: 'bob@company.com', role: 'developer' }
        ],
        total: 3
      }
    });
  });

  app.get('/v1/users/:id', (req, res) => {
    res.json({
      success: true,
      data: {
        id: req.params.id,
        name: 'John Doe',
        email: 'john@company.com',
        role: 'admin',
        last_login: new Date().toISOString()
      }
    });
  });
}

if (SERVICE === 'payments') {
  app.post('/v1/payments', (req, res) => {
    res.json({
      success: true,
      data: {
        transaction_id: `TXN-${Date.now()}`,
        amount: req.body.amount || 100.00,
        currency: 'USD',
        status: 'approved',
        method: req.body.method || 'credit_card',
        created_at: new Date().toISOString()
      }
    });
  });

  app.get('/v1/payments', (req, res) => {
    res.json({
      success: true,
      data: {
        transactions: [
          { id: 'TXN-001', amount: 150.00, status: 'approved', date: '2026-01-24' },
          { id: 'TXN-002', amount: 75.50, status: 'approved', date: '2026-01-23' },
          { id: 'TXN-003', amount: 200.00, status: 'pending', date: '2026-01-22' }
        ],
        total: 3,
        total_amount: 425.50
      }
    });
  });
}

if (SERVICE === 'products') {
  app.get('/v1/products', (req, res) => {
    res.json({
      success: true,
      data: {
        products: [
          { id: 'PROD-001', name: 'Laptop Pro', price: 1299.99, stock: 45, category: 'electronics' },
          { id: 'PROD-002', name: 'Wireless Mouse', price: 29.99, stock: 120, category: 'accessories' },
          { id: 'PROD-003', name: 'USB-C Hub', price: 49.99, stock: 80, category: 'accessories' },
          { id: 'PROD-004', name: 'Monitor 27"', price: 399.99, stock: 15, category: 'electronics' }
        ],
        total: 4,
        in_stock: 260
      }
    });
  });

  app.get('/v1/products/:id', (req, res) => {
    res.json({
      success: true,
      data: {
        id: req.params.id,
        name: 'Laptop Pro',
        price: 1299.99,
        stock: 45,
        category: 'electronics',
        description: 'High-performance laptop for professionals'
      }
    });
  });
}

if (SERVICE === 'notifications') {
  app.post('/v1/notifications', (req, res) => {
    res.json({
      success: true,
      data: {
        notification_id: `NOTIF-${Date.now()}`,
        type: req.body.type || 'email',
        recipient: req.body.recipient || 'user@example.com',
        subject: req.body.subject || 'Notification',
        status: 'sent',
        sent_at: new Date().toISOString()
      }
    });
  });

  app.get('/v1/notifications', (req, res) => {
    res.json({
      success: true,
      data: {
        notifications: [
          { id: 'NOTIF-001', type: 'email', subject: 'Welcome!', status: 'sent', date: '2026-01-24' },
          { id: 'NOTIF-002', type: 'sms', subject: 'Verification Code', status: 'sent', date: '2026-01-24' },
          { id: 'NOTIF-003', type: 'push', subject: 'New Message', status: 'delivered', date: '2026-01-23' }
        ],
        total: 3
      }
    });
  });
}

if (SERVICE === 'analytics') {
  app.get('/v1/analytics', (req, res) => {
    res.json({
      success: true,
      data: {
        metrics: {
          total_users: 1245,
          active_users: 892,
          total_revenue: 125430.50,
          orders_today: 34,
          conversion_rate: 3.2
        },
        charts: {
          daily_sales: [120, 150, 180, 200, 175, 190, 210],
          user_growth: [100, 150, 200, 280, 350, 420, 500]
        },
        period: {
          start: '2026-01-18',
          end: '2026-01-24'
        }
      }
    });
  });

  app.get('/v1/analytics/reports/:type', (req, res) => {
    res.json({
      success: true,
      data: {
        report_type: req.params.type,
        generated_at: new Date().toISOString(),
        status: 'ready',
        download_url: `/v1/analytics/reports/${req.params.type}/download`
      }
    });
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ${SERVICE.toUpperCase()} API running on port ${PORT}`);
});
