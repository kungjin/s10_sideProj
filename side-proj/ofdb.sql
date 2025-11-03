CREATE TABLE IF NOT EXISTS auction_item (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  plan_no VARCHAR(20) NOT NULL,
  case_no VARCHAR(20) NOT NULL,
  category VARCHAR(100),
  item_name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  start_price BIGINT,
  status ENUM('공고중','유찰','낙찰','수의') DEFAULT '공고중',
  end_date DATE,
  reg_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status(status),
  INDEX idx_end_date(end_date)
);

SELECT *FROM auction_item;

INSERT INTO auction_item(plan_no, case_no, category, item_name, address, start_price, status, end_date)
VALUES
('847404','9970225','토지','경기도 화성시 장안면 수촌리 산32-9','경기도 화성시 장안면 수촌리',128000000,'공고중','2025-11-12'),
('847405','9970226','아파트','서울시 강남구 대치동 123-4','서울 강남구 대치동',890000000,'공고중','2025-11-20');
