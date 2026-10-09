# ============================================================
#  db.py — ชั้นติดต่อฐานข้อมูล  ★★★ นิสิตเขียน SQL ในไฟล์นี้ ★★★
#  มองหาคำว่า  # TODO  ทุกฟังก์ชัน — ใช้ %s เป็น placeholder เสมอ (กัน SQL injection)
# ============================================================

import mysql.connector
import config


def get_connection():
    return mysql.connector.connect(
        host=config.DB_HOST, user=config.DB_USER, password=config.DB_PASSWORD,
        database=config.DB_NAME, port=config.DB_PORT)


def run_query(sql, params=None):
    """รัน SELECT คืนผลเป็น list ของ dict"""
    conn = get_connection(); cur = conn.cursor(dictionary=True)
    cur.execute(sql, params or ()); rows = cur.fetchall()
    cur.close(); conn.close(); return rows


def run_command(sql, params=None):
    """รัน INSERT / UPDATE / DELETE แล้ว commit"""
    conn = get_connection(); cur = conn.cursor()
    cur.execute(sql, params or ()); conn.commit()
    out = {"new_id": cur.lastrowid, "affected": cur.rowcount}
    cur.close(); conn.close(); return out


def blank_to_none(value):
    """ช่องที่ไม่ได้กรอกในฟอร์มจะส่งมาเป็น "" — แปลงเป็น None (= NULL ใน SQL)"""
    return None if value in ("", None) else value


# ---------- สมาชิก (member) ----------
def search_members(filters):
    sql = "SELECT * FROM member WHERE 1=1"
    params = []
    
    if filters.get("name"):
        sql += " AND name LIKE %s"
        params.append(f"%{filters['name']}%")
    if filters.get("gender"):
        sql += " AND gender = %s"
        params.append(filters["gender"])
    if filters.get("package_type"):
        sql += " AND package_type = %s"
        params.append(filters["package_type"])
        
    sql += " ORDER BY member_id DESC"
    return run_query(sql, params)

def get_member(member_id):
    rows = run_query("SELECT * FROM member WHERE member_id = %s", (member_id,))
    return rows[0] if rows else None


def create_member(data):
    sql = """
        INSERT INTO member (name, gender, join_date, package_type)
        VALUES (%s, %s, %s, %s)
    """
    params = (
        blank_to_none(data.get("name")), 
        blank_to_none(data.get("gender")), 
        blank_to_none(data.get("join_date")), 
        blank_to_none(data.get("package_type"))
    )
    return run_command(sql, params)


def update_member(member_id, data):
    sql = """
        UPDATE member 
        SET name=%s, gender=%s, join_date=%s, package_type=%s 
        WHERE member_id=%s
    """
    params = (
        blank_to_none(data.get("name")), 
        blank_to_none(data.get("gender")), 
        blank_to_none(data.get("join_date")), 
        blank_to_none(data.get("package_type")), 
        member_id
    )
    return run_command(sql, params)


def delete_member(member_id):
    return run_command("DELETE FROM member WHERE member_id=%s", (member_id,))


# ---------- เทรนเนอร์ (trainer) ----------
def search_trainers(filters):
    sql = "SELECT * FROM trainer WHERE 1=1"
    params = []

    if filters.get("name"):
        sql += " AND name LIKE %s"
        params.append(f"%{filters['name']}%")
    if filters.get("specialty"):
        sql += " AND specialty LIKE %s"
        params.append(f"%{filters['specialty']}%")

    sql += " ORDER BY trainer_id DESC"
    return run_query(sql, params)


def get_trainer(trainer_id):
    rows = run_query("SELECT * FROM trainer WHERE trainer_id = %s", (trainer_id,))
    return rows[0] if rows else None


def create_trainer(data):
    sql = "INSERT INTO trainer (name, specialty, phone) VALUES (%s, %s, %s)"
    params = (
        blank_to_none(data.get("name")),
        blank_to_none(data.get("specialty")),
        blank_to_none(data.get("phone"))
    )
    return run_command(sql, params)


def update_trainer(trainer_id, data):
    sql = "UPDATE trainer SET name=%s, specialty=%s, phone=%s WHERE trainer_id=%s"
    params = (
        blank_to_none(data.get("name")),
        blank_to_none(data.get("specialty")),
        blank_to_none(data.get("phone")),
        trainer_id
    )
    return run_command(sql, params)


def delete_trainer(trainer_id):
    return run_command("DELETE FROM trainer WHERE trainer_id=%s", (trainer_id,))


# ---------- คลาสเรียน (gym_class) ----------
def search_classes(filters):
    sql = """
        SELECT g.class_id, g.name, t.name AS trainer_name, g.room, g.capacity, g.schedule_time,
               (g.capacity - IFNULL(b.booked_count, 0)) AS seats_left
        FROM gym_class g
        LEFT JOIN trainer t ON g.trainer_id = t.trainer_id
        LEFT JOIN (
            SELECT class_id, COUNT(*) AS booked_count
            FROM booking
            WHERE status = 'booked'
            GROUP BY class_id
        ) b ON g.class_id = b.class_id
        WHERE 1=1
    """
    params = []
    
    if filters.get("name"):
        sql += " AND g.name LIKE %s"
        params.append(f"%{filters['name']}%")
    if filters.get("room"):
        sql += " AND g.room LIKE %s"
        params.append(f"%{filters['room']}%")
    if filters.get("trainer_id"):
        sql += " AND g.trainer_id = %s"
        params.append(filters["trainer_id"])
        
    sql += " ORDER BY g.class_id DESC"
    return run_query(sql, params)


def get_class(class_id):
    rows = run_query("SELECT * FROM gym_class WHERE class_id = %s", (class_id,))
    return rows[0] if rows else None


def create_class(data):
    sql = """
        INSERT INTO gym_class (name, trainer_id, room, capacity, schedule_time)
        VALUES (%s, %s, %s, %s, %s)
    """
    params = (
        blank_to_none(data.get("name")), 
        blank_to_none(data.get("trainer_id")), 
        blank_to_none(data.get("room")), 
        blank_to_none(data.get("capacity")), 
        blank_to_none(data.get("schedule_time"))
    )
    return run_command(sql, params)


def update_class(class_id, data):
    sql = """
        UPDATE gym_class 
        SET name=%s, trainer_id=%s, room=%s, capacity=%s, schedule_time=%s 
        WHERE class_id=%s
    """
    params = (
        blank_to_none(data.get("name")), 
        blank_to_none(data.get("trainer_id")), 
        blank_to_none(data.get("room")), 
        blank_to_none(data.get("capacity")), 
        blank_to_none(data.get("schedule_time")), 
        class_id
    )
    return run_command(sql, params)


def delete_class(class_id):
    return run_command("DELETE FROM gym_class WHERE class_id=%s", (class_id,))


# ---------- การจอง (booking) ----------
def search_bookings(filters):
    sql = """
        SELECT b.*, m.name AS member_name, g.name AS class_name
        FROM booking b
        INNER JOIN member m ON b.member_id = m.member_id
        INNER JOIN gym_class g ON b.class_id = g.class_id
        WHERE 1=1
    """
    params = []
    
    if filters.get("member_id"):
        sql += " AND b.member_id = %s"
        params.append(filters["member_id"])
    if filters.get("class_id"):
        sql += " AND b.class_id = %s"
        params.append(filters["class_id"])
    if filters.get("status"):
        sql += " AND b.status = %s"
        params.append(filters["status"])
        
    sql += " ORDER BY b.booking_id DESC"
    return run_query(sql, params)


def get_booking(booking_id):
    rows = run_query("SELECT * FROM booking WHERE booking_id = %s", (booking_id,))
    return rows[0] if rows else None


def check_can_book(cursor, member_id, class_id, booking_id=None):
    cursor.execute("SELECT capacity FROM gym_class WHERE class_id = %s", (class_id,))
    class_info = cursor.fetchone()
    if not class_info:
        raise ValueError("ไม่พบคลาสเรียนนี้ในระบบ")

    cursor.execute(
        "SELECT COUNT(*) AS total FROM booking WHERE class_id = %s AND status = 'booked' AND booking_id <> %s",
        (class_id, booking_id or 0)
    )
    booked_count = cursor.fetchone()["total"]
    if class_info["capacity"] - booked_count <= 0:
        raise ValueError("คลาสนี้เต็มแล้ว ไม่สามารถจองเพิ่มได้")

    cursor.execute(
        "SELECT COUNT(*) AS total FROM booking WHERE member_id = %s AND class_id = %s AND status = 'booked' AND booking_id <> %s",
        (member_id, class_id, booking_id or 0)
    )
    if cursor.fetchone()["total"] > 0:
        raise ValueError("สมาชิกท่านนี้ได้จองคลาสนี้ไว้แล้ว")


def create_booking(data):
    status = data.get("status", "booked")
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        if status == "booked":
            cur.execute(
                "SELECT class_id FROM gym_class WHERE class_id = %s FOR UPDATE",
                (data.get("class_id"),)
            )
            if not cur.fetchone():
                raise ValueError("ไม่พบคลาสเรียนนี้ในระบบ")
            check_can_book(cur, data.get("member_id"), data.get("class_id"))

        sql = """
            INSERT INTO booking (member_id, class_id, book_date, status)
            VALUES (%s, %s, %s, %s)
        """
        params = (
            blank_to_none(data.get("member_id")),
            blank_to_none(data.get("class_id")),
            blank_to_none(data.get("book_date")),
            status
        )
        cur.execute(sql, params)
        conn.commit()
        return {"new_id": cur.lastrowid, "affected": cur.rowcount}
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def update_booking(booking_id, data):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT * FROM booking WHERE booking_id = %s FOR UPDATE", (booking_id,))
        old_booking = cur.fetchone()
        if not old_booking:
            raise ValueError("ไม่พบรายการจองนี้ในระบบ")

        new_status = data.get("status", old_booking["status"])
        new_member = data.get("member_id", old_booking["member_id"])
        new_class = data.get("class_id", old_booking["class_id"])
        should_check = new_status == "booked" and (
            old_booking["status"] != "booked"
            or str(old_booking["member_id"]) != str(new_member)
            or str(old_booking["class_id"]) != str(new_class)
        )

        if should_check:
            class_ids = sorted({old_booking["class_id"], int(new_class)})
            for class_id in class_ids:
                cur.execute(
                    "SELECT class_id FROM gym_class WHERE class_id = %s FOR UPDATE",
                    (class_id,)
                )
            check_can_book(cur, new_member, new_class, booking_id)

        sql = """
            UPDATE booking
            SET member_id=%s, class_id=%s, book_date=%s, status=%s
            WHERE booking_id=%s
        """
        params = (
            blank_to_none(new_member),
            blank_to_none(new_class),
            blank_to_none(data.get("book_date", old_booking["book_date"])),
            new_status,
            booking_id
        )
        cur.execute(sql, params)
        conn.commit()
        return {"new_id": cur.lastrowid, "affected": cur.rowcount}
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def delete_booking(booking_id):
    return run_command("DELETE FROM booking WHERE booking_id=%s", (booking_id,))


# ============================================================
#  REPORT (รายงาน)
# ============================================================
def report_summary():
    sql = """
        SELECT
            (SELECT COUNT(*) FROM member) AS 'สมาชิก',
            (SELECT COUNT(*) FROM gym_class) AS 'คลาส',
            (SELECT COUNT(*) FROM trainer) AS 'เทรนเนอร์',
            (SELECT COUNT(*) FROM booking WHERE status = 'booked') AS 'การจอง',
            (SELECT COUNT(*) FROM equipment WHERE status = 'available') AS 'อุปกรณ์ที่พร้อมใช้',
            (SELECT IFNULL(SUM(capacity), 0) FROM gym_class) AS 'ความจุผู้เรียนทั้งหมด'
    """
    return run_query(sql)[0]


def report_popular_classes():
    """📈 คลาสยอดนิยม (Most Booked)"""
    sql = """
        SELECT g.name AS 'ชื่อคลาส', COUNT(b.booking_id) AS 'จำนวนการจอง'
        FROM booking b
        INNER JOIN gym_class g ON b.class_id = g.class_id
        WHERE b.status = 'booked'
        GROUP BY g.class_id, g.name
        ORDER BY COUNT(b.booking_id) DESC
        LIMIT 5
    """
    return run_query(sql)


def report_trainers_above_avg():
    """🏅 เทรนเนอร์ที่มีผู้จองมากกว่าค่าเฉลี่ย (Above Average)"""
    sql = """
        SELECT t.name AS 'ชื่อเทรนเนอร์', COUNT(b.booking_id) AS 'ยอดจองรวม'
        FROM trainer t
        LEFT JOIN gym_class g ON g.trainer_id = t.trainer_id
        LEFT JOIN booking b ON b.class_id = g.class_id AND b.status = 'booked'
        GROUP BY t.trainer_id, t.name
        HAVING COUNT(b.booking_id) > (
            SELECT AVG(trainer_totals.booking_count)
            FROM (
                SELECT t2.trainer_id, COUNT(b2.booking_id) AS booking_count
                FROM trainer t2
                LEFT JOIN gym_class g2 ON g2.trainer_id = t2.trainer_id
                LEFT JOIN booking b2 ON b2.class_id = g2.class_id AND b2.status = 'booked'
                GROUP BY t2.trainer_id
            ) trainer_totals
        )
    """
    return run_query(sql)


def report_class_equipment():
    """🧰 อุปกรณ์ที่ใช้ในแต่ละคลาส (Join 3 Tables)"""
    sql = """
        SELECT g.name AS 'ชื่อคลาส', e.name AS 'ชื่ออุปกรณ์', ce.quantity AS 'จำนวนที่ใช้'
        FROM class_equipment ce
        INNER JOIN gym_class g ON ce.class_id = g.class_id
        INNER JOIN equipment e ON ce.equip_id = e.equip_id
        ORDER BY g.name ASC
    """
    return run_query(sql)


# ============================================================
#  รายการรายงานที่แสดงบนหน้า /report
# ============================================================
REPORTS = [
    ("popular-classes", "📈 คลาสยอดนิยม (Most Booked)", report_popular_classes),
    ("top-trainers", "🏅 เทรนเนอร์ที่มีผู้จองมากกว่าค่าเฉลี่ย (Above Average)", report_trainers_above_avg),
    ("class-equipment", "🧰 อุปกรณ์ที่ใช้ในแต่ละคลาส (Join 3 Tables)", report_class_equipment),
]
