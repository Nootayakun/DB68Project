-- ============================================================
--  schema.sql — ระบบฟิตเนส (นิสิตออกแบบและเขียนเอง)
--  กติกา: การจอง = M:N (member × gym_class), อุปกรณ์ต่อคลาส = M:N (gym_class × equipment),
--         แต่ละคลาสมีเทรนเนอร์ (1:M จาก trainer)
-- ============================================================

-- 1. ตารางสมาชิก (member)
CREATE TABLE member (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10),
    join_date DATE NOT NULL,
    package_type VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- 2. ตารางเทรนเนอร์ (trainer)
CREATE TABLE trainer (
    trainer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    phone VARCHAR(20)
) ENGINE=InnoDB;

-- 3. ตารางคลาสเรียน (gym_class)
CREATE TABLE gym_class (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    trainer_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    room VARCHAR(50),
    capacity INT NOT NULL CHECK (capacity > 0),
    schedule_time DATETIME NOT NULL,
    FOREIGN KEY (trainer_id) REFERENCES trainer(trainer_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. ตารางการจอง (booking)
CREATE TABLE booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    class_id INT NOT NULL,
    book_date DATE NOT NULL,
    status ENUM('booked', 'cancelled') DEFAULT 'booked',
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES gym_class(class_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. ตารางอุปกรณ์ (equipment)
CREATE TABLE equipment (
    equip_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    zone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'Available',
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0)
) ENGINE=InnoDB;

-- 6. ตารางเชื่อมคลาสและอุปกรณ์ (class_equipment)
CREATE TABLE class_equipment (
    class_id INT NOT NULL,
    equip_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    PRIMARY KEY (class_id, equip_id),
    FOREIGN KEY (class_id) REFERENCES gym_class(class_id) ON DELETE CASCADE,
    FOREIGN KEY (equip_id) REFERENCES equipment(equip_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. ตารางบันทึกการชำระเงินของสมาชิก (member_payment)
CREATE TABLE member_payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method ENUM('cash', 'transfer', 'card') NOT NULL,
    paid_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note VARCHAR(255),
    FOREIGN KEY (member_id) REFERENCES member(member_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- INSERT ข้อมูลตัวอย่างสำหรับทดสอบระบบ
-- ============================================================

-- เพิ่มสมาชิก (5 คน)
INSERT INTO member (name, gender, join_date, package_type) VALUES
('สมชาย สายสตรอง', 'Male', '2026-01-10', 'basic'),
('อรทัย ฟิตแอนด์เฟิร์ม', 'Female', '2026-01-15', 'Premium'),
('ธนพล กล้ามแน่น', 'Male', '2026-01-20', 'premium'),
('จิราภรณ์ แข็งแรง', 'Female', '2026-01-25', 'basic'),
('ปกรณ์ ฟิตเนส', 'Male', '2026-02-01', 'Premium');

-- เพิ่มข้อมูลการชำระเงินตัวอย่าง
INSERT INTO member_payment (member_id, amount, payment_method, note) VALUES
(1, 1200.00, 'transfer', 'ค่าสมาชิก'),
(2, 2500.00, 'cash', 'ค่าสมาชิก'),
(3, 2500.00, 'card', 'ค่าสมาชิก');

-- เพิ่มเทรนเนอร์ (3 คน)
INSERT INTO trainer (name, specialty, phone) VALUES
('โค้ชยักษ์', 'Weight Training', '081-111-2222'),
('โค้ชฟ้า', 'Yoga & Pilates', '082-333-4444'),
('โค้ชเสือ', 'HIIT & Cardio', '083-555-6666');

-- เพิ่มคลาสเรียน (3 คลาส)
-- หมายเหตุ: คลาสที่ 1 (HIIT) กำหนด capacity = 2 เพื่อทดสอบคลาสเต็ม
INSERT INTO gym_class (trainer_id, name, room, capacity, schedule_time) VALUES
(3, 'HIIT Burn Express', 'Room A', 2, '2026-10-01 09:00:00'),
(2, 'Yoga Flow', 'Room B', 10, '2026-10-01 10:30:00'),
(1, 'Heavy Weight Class', 'Room C', 5, '2026-10-01 17:00:00');

-- เพิ่มการจอง
-- ★ คลาสที่ 1 (class_id = 1) ถูกจอง 2 คน (เต็ม capacity พอดี) ไว้ทดสอบระบบคลาสเต็ม
INSERT INTO booking (member_id, class_id, book_date, status) VALUES
(1, 1, '2026-09-25', 'booked'),
(2, 1, '2026-09-26', 'booked'),
(3, 2, '2026-09-27', 'booked'),
(4, 2, '2026-09-28', 'booked'),
(5, 3, '2026-09-28', 'booked');

-- เพิ่มอุปกรณ์
INSERT INTO equipment (name, zone, status) VALUES
('Dumbbell Set', 'Zone A', 'Available'),
('Yoga Mat', 'Zone B', 'Available'),
('Kettlebell', 'Zone A', 'Available');

UPDATE equipment
SET stock_quantity = CASE name
    WHEN 'Dumbbell Set' THEN 10
    WHEN 'Yoga Mat' THEN 20
    WHEN 'Kettlebell' THEN 20
    ELSE stock_quantity
END;

-- จับคู่อุปกรณ์กับคลาสเรียน
INSERT INTO class_equipment (class_id, equip_id, quantity) VALUES
(1, 3, 10), -- คลาส HIIT ใช้ Kettlebell 10 ลูก
(2, 2, 15), -- คลาส Yoga ใช้ Yoga Mat 15 ผืน
(3, 1, 5);  -- คลาส Weight ใช้ Dumbbell 5 ชุด