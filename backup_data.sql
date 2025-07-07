PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE establishments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        phone TEXT NOT NULL,
        email TEXT,
        address TEXT NOT NULL,
        logo TEXT,
        delivery_fee REAL NOT NULL DEFAULT 0,
        minimum_order REAL NOT NULL DEFAULT 0,
        is_open INTEGER NOT NULL DEFAULT 1,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO establishments VALUES('1','Burger Point','Lanchonete tradicional com os melhores hambúrgueres da cidade','(11) 99999-9999','contato@burgerpoint.com.br','Rua das Flores, 123 - Centro',NULL,5.0,20.0,1,1,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
CREATE TABLE customers (
        id TEXT PRIMARY KEY,
        number TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        whatsapp TEXT NOT NULL UNIQUE,
        email TEXT,
        address TEXT NOT NULL,
        complement TEXT,
        neighborhood TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        default_payment_method TEXT NOT NULL DEFAULT 'pix',
        total_orders INTEGER NOT NULL DEFAULT 0,
        total_spent REAL NOT NULL DEFAULT 0,
        last_order_at TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO customers VALUES('customer-1','0001','João Silva','+5511999887766','joao@email.com','Rua das Palmeiras, 456','Apto 302','Jardim Paulista','São Paulo','SP','01234-567','pix',3,127.5,'2025-07-06T15:07:01.943Z',1,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        establishment_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO categories VALUES('1','1','Hambúrgueres','Hambúrgueres artesanais e tradicionais',1,0,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
INSERT INTO categories VALUES('2','1','Batatas e Porções','Batatas fritas e porções especiais',1,0,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
INSERT INTO categories VALUES('3','1','Lanches e Sanduíches','Lanches tradicionais e sanduíches',1,0,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
INSERT INTO categories VALUES('4','1','Bebidas','Refrigerantes, sucos e bebidas',1,0,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
CREATE TABLE products (
        id TEXT PRIMARY KEY,
        establishment_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        is_available INTEGER NOT NULL DEFAULT 1,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        preparation_time TEXT,
        options TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO products VALUES('1','1','1','Burger Bacon','Hambúrguer artesanal com bacon crocante, queijo cheddar, alface e tomate',28.0,NULL,1,1,0,'15-20 min',NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
INSERT INTO products VALUES('2','1','1','X-Tudão','Hambúrguer completo com 2 carnes, bacon, queijo, ovo, alface, tomate e batata palha',35.0,NULL,1,1,0,'20-25 min',NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
INSERT INTO products VALUES('3','1','1','Burger Duplo','Dois hambúrgueres artesanais, queijo duplo, cebola caramelizada e molho especial',32.0,NULL,1,1,0,'18-22 min',NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
INSERT INTO products VALUES('4','1','2','Batata Frita Recheada','Batatas fritas crocantes com queijo derretido, bacon e cebolinha',22.0,NULL,1,1,0,'12-15 min',NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
INSERT INTO products VALUES('5','1','2','Porção de Onion Rings','Anéis de cebola empanados e fritos, acompanha molho especial',18.0,NULL,1,1,0,'10-12 min',NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
INSERT INTO products VALUES('6','1','3','Sanduíche Natural','Pão integral com peito de peru, queijo branco, alface, tomate e maionese',15.0,NULL,1,1,0,'8-10 min',NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
INSERT INTO products VALUES('7','1','3','Hot Dog Especial','Salsicha artesanal, queijo, milho, batata palha e molho especial',16.0,NULL,1,1,0,'10-12 min',NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
INSERT INTO products VALUES('8','1','4','Coca-Cola','Refrigerante clássico gelado',6.0,NULL,1,1,0,'2-3 min',NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
INSERT INTO products VALUES('9','1','4','Suco de Laranja Natural','Suco de laranja natural, sem conservantes',8.0,NULL,1,1,0,'3-5 min',NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
INSERT INTO products VALUES('10','1','2','Nuggets com Molho','8 nuggets crocantes acompanhados de molho barbecue',20.0,NULL,1,1,0,'8-10 min',NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
CREATE TABLE orders (
        id TEXT PRIMARY KEY,
        order_number TEXT NOT NULL UNIQUE,
        customer_id TEXT NOT NULL,
        establishment_id TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        customer_address TEXT NOT NULL,
        customer_complement TEXT,
        customer_neighborhood TEXT NOT NULL,
        customer_city TEXT NOT NULL,
        customer_state TEXT NOT NULL,
        customer_zip_code TEXT NOT NULL,
        subtotal REAL NOT NULL,
        delivery_fee REAL NOT NULL DEFAULT 0,
        discount_amount REAL NOT NULL DEFAULT 0,
        coupon_code TEXT,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'pix',
        payment_status TEXT NOT NULL DEFAULT 'pending',
        status TEXT NOT NULL DEFAULT 'pending',
        observations TEXT,
        estimated_delivery_time TEXT,
        mercadopago_payment_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TEXT,
        preparing_at TEXT,
        ready_at TEXT,
        delivered_at TEXT,
        cancelled_at TEXT
      );
INSERT INTO orders VALUES('order-1','001','customer-1','1','João Silva','+5511999887766','joao@email.com','Rua das Palmeiras, 456','Apto 302','Jardim Paulista','São Paulo','SP','01234-567',34.0,5.0,0.0,NULL,39.0,'pix','approved','delivered',NULL,NULL,NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z',NULL,NULL,NULL,'2025-06-29T15:07:02.268Z',NULL);
INSERT INTO orders VALUES('order-2','002','customer-1','1','João Silva','+5511999887766','joao@email.com','Rua das Palmeiras, 456','Apto 302','Jardim Paulista','São Paulo','SP','01234-567',41.0,5.0,0.0,NULL,46.0,'pix','approved','delivered',NULL,NULL,NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z',NULL,NULL,NULL,'2025-07-03T15:07:02.268Z',NULL);
INSERT INTO orders VALUES('order-3','003','customer-1','1','João Silva','+5511999887766','joao@email.com','Rua das Palmeiras, 456','Apto 302','Jardim Paulista','São Paulo','SP','01234-567',37.5,5.0,0.0,NULL,42.5,'pix','approved','DELIVERED',NULL,NULL,NULL,'2025-07-06T15:07:01.943Z','2025-07-06T16:35:47.264Z','2025-07-06T16:35:37.303Z','2025-07-06T16:35:39.493Z','2025-07-06T16:35:42.795Z','2025-07-06T16:35:47.264Z',NULL);
CREATE TABLE order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total REAL NOT NULL,
        observations TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO order_items VALUES('item-1','order-1','1',1,28.0,28.0,NULL,'2025-07-06T15:07:01.943Z');
INSERT INTO order_items VALUES('item-2','order-1','8',1,6.0,6.0,NULL,'2025-07-06T15:07:01.943Z');
INSERT INTO order_items VALUES('item-3','order-2','2',1,35.0,35.0,NULL,'2025-07-06T15:07:01.943Z');
INSERT INTO order_items VALUES('item-4','order-2','8',1,6.0,6.0,NULL,'2025-07-06T15:07:01.943Z');
INSERT INTO order_items VALUES('item-5','order-3','3',1,32.0,32.0,NULL,'2025-07-06T15:07:01.943Z');
INSERT INTO order_items VALUES('item-6','order-3','5',1,5.5,5.5,NULL,'2025-07-06T15:07:01.943Z');
CREATE TABLE coupons (
        id TEXT PRIMARY KEY,
        establishment_id TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        description TEXT,
        type TEXT NOT NULL DEFAULT 'percentage',
        value REAL NOT NULL,
        minimum_order REAL NOT NULL DEFAULT 0,
        usage_limit INTEGER,
        usage_count INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        valid_from TEXT,
        valid_until TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO coupons VALUES('1','1','WELCOME10','Welcome discount 10%','percentage',10.0,30.0,NULL,0,1,NULL,NULL,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
CREATE TABLE users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        establishment_id TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
INSERT INTO users VALUES('1','admin','password123','1',1,'2025-07-06T15:07:01.943Z','2025-07-06T15:07:01.943Z');
COMMIT;
