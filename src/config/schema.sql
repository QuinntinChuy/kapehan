DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;

CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  category ENUM('hot', 'cold') NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(20) NOT NULL UNIQUE,
  order_type ENUM('dine-in', 'takeout') NOT NULL,
  coffee_type VARCHAR(50) DEFAULT NULL,
  priority_number INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('Cash', 'Card', 'Mobile') DEFAULT 'Cash',
  status ENUM('Pending', 'Preparing', 'Ready', 'Completed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO menu_items (name, description, price, category, image_url) VALUES
('Espresso', 'Strong concentrated coffee, served in small shots', 39.00, 'hot', '../images/Coffee Espresso.jpeg'),
('Americano', 'Espresso diluted with hot water for a smoother taste', 39.00, 'hot', '../images/Americano Coffee.jpeg'),
('Cappuccino', 'Espresso with steamed milk and silky foam', 39.00, 'hot', '../images/Cappuccin.jpeg'),
('Latte', 'Creamy espresso with lots of steamed milk', 39.00, 'hot', '../images/Coffee Latte.jpeg'),
('Black Coffee', 'Classic drip coffee, bold and uncompromising', 39.00, 'hot', '../images/Black Coffee.jpeg'),
('Mocha', 'Chocolate-infused espresso with steamed milk', 39.00, 'hot', '../images/Mocha.jpeg'),
('Flat White', 'Ristretto espresso with velvety microfoam', 39.00, 'hot', '../images/Flatt White.jpeg'),
('Irish Coffee', 'Spiked coffee with whiskey and whipped cream', 39.00, 'hot', '../images/Irish Coffee.jpeg');

INSERT INTO menu_items (name, description, price, category, image_url) VALUES
('Iced Coffee', 'Chilled coffee served over ice, sweetened to taste', 39.00, 'cold', '../images/iced coffee.jpeg'),
('Iced Latte', 'Espresso chilled with milk and ice', 39.00, 'cold', '../images/Iced Coffee latte.jpeg'),
('Iced Americano', 'Refreshing diluted espresso over ice', 39.00, 'cold', '../images/Iced Americano.jpeg'),
('Iced Mocha', 'Chocolate espresso treat served cold', 39.00, 'cold', '../images/icedmocha.jpeg'),
('Cold Brew Coffee', 'Smooth coffee steeped cold for 12+ hours', 39.00, 'cold', '../images/coldbrew.jpeg'),
('Iced Caramel Macchiato', 'Vanilla milk with espresso and caramel drizzle', 39.00, 'cold', '../images/Iced Caramel Macchiato.jpeg'),
('Iced Coffee Lemonade', 'Tart and refreshing coffee-lemon blend', 39.00, 'cold', '../images/icedcoffeelemon.jpeg'),
('Nitro Cold Brew', 'Creamy cold brew infused with nitrogen', 39.00, 'cold', '../images/Nitro coldbrew.jpeg');