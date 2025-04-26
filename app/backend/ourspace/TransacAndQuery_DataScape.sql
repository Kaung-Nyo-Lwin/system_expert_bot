-- 1. Kaung Nyo Lwin
USE OurSpace;

DROP PROCEDURE IF EXISTS `sp_UserRegistration`;

DELIMITER // 
/*
CALL sp_UserRegistration('Marc K','marck@gmail.com','+6611188889','ait',1000,TRUE,FALSE,NULL,now(),NULL);
*/

CREATE PROCEDURE `sp_UserRegistration` (
	IN name 			VARCHAR(255),
    IN email 			VARCHAR(255),
    IN phone 			VARCHAR(15),
    IN address 			VARCHAR(500),
    IN preferedRange 	FLOAT,
    IN isCustomer 		BOOLEAN,
    IN isOwner 			BOOLEAN,
    IN rating 			FLOAT,
    IN createdAt 		TIMESTAMP,
    IN updatedAt 		TIMESTAMP 
    )
BEGIN
	INSERT INTO 
		user(
			name,
			email,
			phone,
			address,
			preferedRange,
			isCustomer,
			isOwner,
			rating,
			createdAt,
			updatedAt
		)
		VALUES(
			name,
			email,
			phone,
			address,
			preferedRange,
			isCustomer,
			isOwner,
			rating,
			createdAt,
			updatedAt
		);
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_BookSpace`;

DELIMITER // 

/*
CALL sp_BookSpace(1,1,'2025-03-14 11:00:00','2025-03-14 15:00:00',now(),'test');
*/

CREATE PROCEDURE `sp_BookSpace` (
	IN cid 			INT,
    IN sid 			INT,
    IN startTime 	TIMESTAMP,
    IN endTime 		TIMESTAMP,
    IN bookingDate  TIMESTAMP,
    IN remark TEXT
    )
BEGIN
	DECLARE duration TIME;
    DECLARE price FLOAT;
    DECLARE fee FLOAT;
    DECLARE sts ENUM('available', 'booked', 'cancelled');
    
    SET duration = TIMESTAMPDIFF(HOUR,startTime, endTime);
    IF duration < 12 THEN
		SET price = (SELECT s.hourlyRate * duration FROM space s WHERE s.id = sid );
	ELSEIF  duration < 24 THEN
		SET price = (SELECT s.hourlyRate * (duration-12) + s.halfdayRate  
						FROM space s WHERE s.id = sid );
	ELSE
		SET price = (SELECT s.fulldatRate * duration FROM space s WHERE s.id = sid );
	END IF;
    SET sts = 'booked';
    
    INSERT INTO 
		booking(cid, sid, bookingDate, totalDuration, 
        startTime, endTime, spacePrice, 
        status, remark, createdAt, updatedAt
		)
	VALUES(
		cid, sid, bookingDate, duration,
        startTime, endTime, price, 
        sts, remark, now(), now()
        );
END//
DELIMITER ;

USE OurSpace;

DROP PROCEDURE IF EXISTS `sp_PayCharge`;

DELIMITER // 

/*
CALL sp_PayCharge(1,1,50,'txt0001','test');
*/

CREATE PROCEDURE `sp_PayCharge` (
	IN rid 			INT,
    IN bid 			INT,
    IN paid 		FLOAT,
    IN transcId 	VARCHAR(200),
    IN bank 		VARCHAR(200)
    )
BEGIN
	DECLARE unpaid FLOAT;
    DECLARE amountToPay FLOAT;
    DECLARE sts ENUM('pending', 'completed', 'refunded', 'cancelled');
    
    SET amountToPay = (SELECT b.total FROM booking b WHERE b.id = bid AND b.status <> 'cancelled') - 
						(SELECT SUM(p.paid) FROM payment p WHERE p.bid = bid AND p.status = 'completed');
    SET unpaid = amountToPay - paid;
    SET sts = 'completed';
    
    INSERT INTO 
		payment(rid, bid, amountToPay, paid, unpaid,
        transacId, bank, status, createdAt, updatedAt
		)
	VALUES(
		rid, bid, amountToPay, paid, unpaid,
        transacId, bank, sts, now(), now()
        );
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_MostSpender`;

DELIMITER // 

/*
CALL sp_MostSpender('2025-01-01','2025-12-31',5);
*/

CREATE PROCEDURE `sp_MostSpender` (
	IN FromDate 	DATETIME,
    IN ToDate 		DATETIME,
    IN NumUsers		INT
    )
BEGIN
	-- SELECT FromDate,ToDate;
	SELECT 
		t.name AS 'User Name', 
		CASE 
			WHEN TIMESTAMPDIFF(DAY,t.createdAt, now()) = 0 THEN 1
			ELSE TIMESTAMPDIFF(DAY,t.createdAt, now()) END 
		AS 'Days On Platform',
		t.totalAmount AS 'Total Spent Amount', 
		t. totalAmount / (CASE 
							WHEN TIMESTAMPDIFF(DAY,t.createdAt, now()) = 0 THEN 1
							ELSE TIMESTAMPDIFF(DAY,t.createdAt, now()) END) 
		AS 'Average Spent Amont Per Day'
	FROM
		(SELECT 
			u.name,
			u.createdAt,
			sum(p.paid) AS 'totalAmount'
		FROM payment p
		INNER JOIN booking b
			ON b.id = p.bid
		INNER JOIN user u
			ON u.id =  b.cid
		WHERE 
			p.createdAt BETWEEN FromDate AND ToDate
			AND p.status = 'completed'
		GROUP BY u.name,u.createdAt) t
        ORDER BY t.totalAmount DESC
        LIMIT NumUsers;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_MonthlyRevenue`;

DELIMITER // 

/*
CALL sp_MonthlyRevenue('2025-01-01','2025-12-31');
*/

CREATE PROCEDURE `sp_MonthlyRevenue` (
	IN FromDate 	DATETIME,
    IN ToDate 		DATETIME
    )
BEGIN
	-- SELECT FromDate,ToDate;
	SELECT 
		t.Month,
		t.Year,
        sum(t.spacePrice) AS 'Space Price',
        sum(t.sysFee) AS 'Platform Fee',
        sum(t.total) AS 'Total'
	FROM
		(SELECT 
			MONTHNAME(b.endTime) AS 'Month',
			YEAR(b.endTime) 'Year',
			b.spacePrice,
			b.sysFee,
			b.total
			FROM booking b
			INNER JOIN rent r
				ON r.bid =  b.id
			WHERE 
				b.endTime BETWEEN FromDate AND ToDate
				AND b.status = 'completed'
			ORDER BY b.endTime) t
		GROUP BY t.Month,t.Year;
END//
DELIMITER ;


DROP PROCEDURE IF EXISTS `sp_PopularDay`;

DELIMITER // 

/*
CALL sp_PopularDay('2025-01-01','2025-12-31');
*/

CREATE PROCEDURE `sp_PopularDay` (
	IN FromDate 	DATETIME,
    IN ToDate 		DATETIME
    )
BEGIN
	-- SELECT FromDate,ToDate;
	SELECT 
		t.Day,
        count(t.id) AS 'Total Bookings',
        sum(t.spacePrice) AS 'Space Price',
        sum(t.sysFee) AS 'Platform Fee'
	FROM
		(SELECT 
			dayname(b.endTime) AS 'Day',
            b.id,
			b.spacePrice,
			b.sysFee
			FROM booking b
			INNER JOIN rent r
				ON r.bid =  b.id
			WHERE 
				b.endTime BETWEEN FromDate AND ToDate
				AND b.status in ('completed','booked')
			) t
		GROUP BY t.Day
        ORDER BY  count(t.id) DESC;
END//
DELIMITER ;


DROP PROCEDURE IF EXISTS `sp_RangeBook`;

DELIMITER // 

/*
CALL sp_RangeBook(0,100,10);
*/

CREATE PROCEDURE `sp_RangeBook` (
    IN lowLimit 	FLOAT,
    IN highLimit 	FLOAT,
    IN steps		INT
    )
BEGIN
	DECLARE prePrice FLOAT;
    DECLARE cur_number FLOAT;
    
	DROP TEMPORARY TABLE IF EXISTS spacetem;
	CREATE TEMPORARY TABLE
			spacetem(
					id INT AUTO_INCREMENT PRIMARY KEY, 
					sid INT, 
                    hourlyRate FLOAT, 
                    definedRange NVARCHAR(200));
                    
                    
	INSERT INTO 
		spacetem(sid, hourlyRate)
			SELECT id, hourlyRate FROM space;
            
    
    WHILE lowLimit < highLimit   DO
		UPDATE spacetem st
			SET definedRange = CAST(lowLimit AS CHAR) || ' - ' || CAST(lowLimit + steps AS CHAR)
				WHERE st.hourlyRate BETWEEN lowLimit AND lowLimit + steps;
		SET lowLimit = lowLimit + steps;
	
    END WHILE;
    
    SELECT st.definedRange AS 'Ranges of Hourly Rate',
    COUNT(b.id) AS 'Total Number of Bookings',
    SUM(b.sysFee) As 'System Fee'
    FROM booking b
	INNER JOIN spacetem st
    ON b.sid = st.sid
    WHERE b.status IN ('completed','booked')
    GROUP BY st.definedRange
    ;
    
    
    DROP TEMPORARY TABLE IF EXISTS spacetem;
	
    
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS `sp_SpaceRecommend`;

DELIMITER // 

/*
CALL sp_SpaceRecommend(1,'Downtown','2025-02-12 10:00:00','2025-02-12 13:00:00',10);
*/

CREATE PROCEDURE `sp_SpaceRecommend` (
	IN uid 				INT,
    IN location 		VARCHAR(100),
    IN startTime 		TIMESTAMP,
    IN endTime 			TIMESTAMP,
    IN priceVariation 	FLOAT
    )
BEGIN
	DECLARE prePrice FLOAT;
    DECLARE upLimit FLOAT;
    DECLARE loLimit FLOAT;
    SET prePrice = (SELECT u.preferedRange FROM user u WHERE u.id = uid);
    SET upLimit = prePrice + priceVariation, loLimit = prePrice - priceVariation;
    
	SELECT av.name AS 'Space Name',av.hourlyRate, av.halfdayRate, av.fulldayRate, av.rating
	FROM 
    -- This suquery av is for availabe spaces
		(SELECT *
		FROM space s 
		WHERE s.id NOT IN
        -- This suquery is to find fully booked spaces within searching timeslots
			(SELECT bt.sid 
				FROM (
					SELECT b.sid,SUM(CAST(TIMESTAMPDIFF(HOUR,b.startTime, b.endTime) AS DECIMAL)) AS 'bookedHours' 
					FROM booking b
					WHERE DATE(b.startTime) = DATE(startTime)
					AND b.startTime >= startTime  AND b.endTime <= endTime
					GROUP BY b.sid
					) bt
				WHERE bt.bookedHours >= CAST(TIMESTAMPDIFF(HOUR,startTime, endTime) AS DECIMAL)
			)
		) av
	LEFT JOIN 
    -- This subquery is to see the number of bookings for each spaces by the user
		(SELECT b.sid,count(b.cid) AS 'num_bookings' 
		FROM booking b
			WHERE b.cid = uid
			GROUP BY b.sid) bf
	ON av.id = bf.sid
    -- filtering and ordering to recommend
	WHERE av.location = location
	AND av.hourlyRate BETWEEN loLimit AND upLimit
	ORDER BY IFNULL(bf.num_bookings,0) DESC, av.rating DESC
	LIMIT 10;
END//
DELIMITER ;


-- 2. Cassandra Chang

SELECT * FROM feedback;
-- FEEDBACK SUBMISSION
DELIMITER //
/*
CALL SubmitFeedback(10, 4, 'Updated review: Still great, but could improve Wi-Fi.', 4.4);
*/
CREATE procedure `SubmitFeedback` (
	IN p_cid INT,       
    IN p_sid INT,       
    IN p_reviews VARCHAR(255),  
    IN p_rating FLOAT
)
BEGIN 
	DECLARE feedback_exists INT;
    -- Start the transaction
    START TRANSACTION;

    -- Check if feedback already exists 
    -- for the given customer and space
    SELECT COUNT(*) INTO feedback_exists 
    FROM feedback 
    WHERE cid = p_cid AND sid = p_sid;

    -- If feedback exists, update it
    IF feedback_exists > 0 THEN
        UPDATE feedback 
        SET reviews = p_reviews, rating = p_rating, createdAt = NOW()
        WHERE cid = p_cid AND sid = p_sid;
    
    -- If no feedback exists, insert a new record
    ELSE
        INSERT INTO feedback (cid, sid, reviews, rating, createdAt)
        VALUES (p_cid, p_sid, p_reviews, p_rating, NOW());
    END IF;
    -- Commit the transaction if successful
    COMMIT;
END//

DELIMITER ;


DELIMITER //

CREATE PROCEDURE AdjustRentalRates(
    IN p_oid INT,         
    IN p_sid INT,         
    IN p_hourlyRate FLOAT, 
    IN p_halfdayRate FLOAT, 
    IN p_fulldayRate FLOAT
)
BEGIN
    DECLARE space_exists INT;

    -- Start transaction
    START TRANSACTION;

    -- Check if the space belongs to the owner
    SELECT COUNT(*) INTO space_exists 
    FROM space 
    WHERE id = p_sid AND oid = p_oid;

    -- If the space exists under the owner's control, update rental rates
    IF space_exists > 0 THEN
        UPDATE space 
        SET hourlyRate = p_hourlyRate, 
            halfdayRate = p_halfdayRate, 
            fulldayRate = p_fulldayRate, 
            updatedAt = NOW()
        WHERE id = p_sid;

        -- Commit the transaction if successful
        COMMIT;
    ELSE
        -- Rollback if the space does not belong to the owner
        ROLLBACK;
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Space does not belong to the specified owner.';
    END IF;
END//
DELIMITER //
DELIMITER ;

DELIMITER //

CREATE PROCEDURE UpdateUserProfile(
    IN p_user_id INT,         
    IN p_name VARCHAR(255),   
    IN p_email VARCHAR(255),  
    IN p_phone VARCHAR(15),   
    IN p_address VARCHAR(500),
    IN p_preferedRange FLOAT  
)
BEGIN
    DECLARE user_exists INT;
    
    -- Start transaction
    START TRANSACTION;

    -- Check if user exists
    SELECT COUNT(*) INTO user_exists FROM user WHERE id = p_user_id;

    -- If user exists, update details
    IF user_exists > 0 THEN
        UPDATE user 
        SET 
            name = IFNULL(p_name, name),
            email = IFNULL(p_email, email),
            phone = IFNULL(p_phone, phone),
            address = IFNULL(p_address, address),
            preferedRange = IFNULL(p_preferedRange, preferedRange),
            updatedAt = NOW()
        WHERE id = p_user_id;

        -- Commit transaction
        COMMIT;
    ELSE
        -- Rollback transaction and return error if user does not exist
        ROLLBACK;
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: User not found.';
    END IF;
END//

DELIMITER ;

/*
CALL SubmitFeedback(10, 4, 'Updated review: Still great, but could improve Wi-Fi.', 4.4);
*/

/*CALL UpdateUserProfile(5, 'Mary Higgins', 'mary@example.com', '9876543210', '123 Main St', 20);
*/

/*
CALL AdjustRentalRates(6,3,20, 120, 220); */

-- q1.Feedback Report

select * from feedback;
select * from space;
select * from facility;
SELECT 
    s.location,
    f.id AS facility_id,
    MAX(s.rating) AS highest_rating,
    GROUP_CONCAT(s.name ORDER BY s.rating DESC) AS top_rated_spaces
FROM space s
JOIN facility f ON s.fid = f.id
GROUP BY s.location, f.id
ORDER BY highest_rating DESC;

-- q2.Customer Booking Report
SELECT 
    b.id AS Booking_ID,
    u.name AS Customer_Name,
    s.name AS Space_Name,
    s.location AS Location,
    b.bookingDate AS Booking_Date,
    b.total AS Total_Charges
FROM booking b
JOIN user u ON b.cid = u.id 
JOIN space s ON b.sid = s.id
WHERE b.cid = 1
ORDER BY b.bookingDate DESC;

-- q3.Space Owner Earnings Report

select * from booking;
SELECT 
	s.oid AS Space_Owner,
    s.id AS Space_Id,
    s.name AS Space_Name,
    COUNT(b.bookingDate) AS Total_Bookings,
    ROUND(SUM(b.spacePrice - (b.spacePrice * (b.discount/100) ) - b.sysFee ))AS Owner_Earning
FROM space s
JOIN booking b ON s.id=b.sid
JOIN user u ON s.oid = u.id
WHERE s.oid=4
GROUP BY s.id, s.name, s.oid
ORDER BY Owner_Earning DESC;

-- q4.Inactive Spaces Report


SELECT 
	u.name AS Owner_Name,
    s.location AS Location,
    s.address AS Address,
	s.oid AS Owner_ID,
    s.name AS Space_Name,
    s.status
FROM
	space s
JOIN user u ON s.oid=u.id
WHERE status='closed' and oid=4;

-- q5.Cancelled Bookings Report

INSERT INTO booking (
     cid, sid, bookingDate, totalDuration, startTime, endTime, 
    spacePrice, status, remark, createdAt, updatedAt
) VALUES (
    5, 16, '2025-08-15 14:00:00', '03:00:00', '2025-08-15 14:00:00', '2025-08-15 17:00:00',
    84, 'cancelled', 'Customer canceled', NOW(), NOW()
);


SELECT 
	u.name AS Customer_Name,
    u.phone AS Customer_Number,
    u.email AS Customer_Email,
    s.name AS Space_Name,
    s.location AS Location,
    s.address AS Address,
	s.oid AS Owner_ID,
    b.status AS Booking_Status
FROM
	booking b
JOIN user u ON b.cid=u.id
JOIN space s ON s.id=b.sid
WHERE b.status='cancelled';

select * from booking;

-- 3. Aymen Zubair Qureshi

-- 1. Owner Reviews Feedback Procedure
DELIMITER //

CREATE PROCEDURE GetOwnerFeedback(IN owner_id INT)
BEGIN
    -- Fetch owner feedback details
    SELECT 
        s.name AS spaceName, 
        u.name AS CustomerName, 
        o.name AS OwnerName, 
        f.rating, 
        f.reviews, 
        f.createdAt
    FROM feedback f
    JOIN space s ON f.sid = s.id
    JOIN user u ON f.cid = u.id  
    JOIN user o ON s.oid = o.id  
    WHERE o.id = owner_id  
    ORDER BY f.createdAt DESC;
END //

DELIMITER ;

-- To call the feedbacks of a specific owner based on id:
CALL GetOwnerFeedback(5);


-- 2. Editing the Bookings Procedure
DELIMITER //

CREATE PROCEDURE editBookingCustomer(
    IN p_booking_id INT,               -- Booking ID to edit
    IN p_customer_name VARCHAR(255),   -- Customer's name to verify the owner of the booking
    IN p_new_booking_date DATETIME,    -- New booking date
    IN p_new_start_time TIMESTAMP,     -- New start time
    IN p_new_end_time TIMESTAMP,       -- New end time
    IN p_new_status ENUM('available','booked','cancelled'),  -- New status for the booking
    IN p_updated_at TIMESTAMP          -- Timestamp for when the booking is updated
)
BEGIN
    DECLARE customer_id INT;

    -- Start the transaction
    START TRANSACTION;

    -- Get the customer's ID based on the provided name (limiting to one row)
    SELECT id INTO customer_id 
    FROM user 
    WHERE name = p_customer_name
    LIMIT 1;  -- Ensures only one row is returned, even if multiple users share the same name

    -- Check if the customer is the one who made the booking
    IF NOT EXISTS (
        SELECT 1 FROM booking WHERE id = p_booking_id AND cid = customer_id
    ) THEN
        -- Rollback the transaction if the customer is not authorized
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Customer is not authorized to edit this booking';
    ELSE
        -- Proceed with updating the booking if the customer is authorized
        UPDATE booking 
        SET bookingDate = p_new_booking_date, 
            startTime = p_new_start_time, 
            endTime = p_new_end_time, 
            status = p_new_status, 
            updatedAt = p_updated_at
        WHERE id = p_booking_id 
        AND cid = customer_id;  -- Ensuring that only the customer's booking can be modified
        
        -- Commit the transaction
        COMMIT;
    END IF;
END//

DELIMITER ;

-- Call to edit a booking for a customer:
CALL EditBookingCustomer(
    22,                                -- Booking ID to edit
    'Hannah Yellow',                        -- Customer's name to verify the booking
    '2025-02-15 11:00:00',             -- New booking date
    '2025-02-15 11:00:00',             -- New start time
    '2025-02-15 13:00:00',             -- New end time
    'booked',                           -- New status
    CURRENT_TIMESTAMP                  -- Timestamp for when the booking is updated
);

-- SELECT to verify booking after update
SELECT id, bookingDate, startTime, endTime, status, updatedAt
FROM booking
WHERE id = 22;


-- 3. New Space Listing Procedure
DELIMITER //

CREATE PROCEDURE NewSpaceListing(
    IN p_spaceName VARCHAR(255),     -- Space Name
    IN p_location VARCHAR(100),      -- Location of the space
    IN p_address VARCHAR(500),       -- Address of the space
    IN p_size FLOAT,                 -- Size of the space
    IN p_roomNos INT,                -- Number of rooms in the space
    IN p_hourlyRate FLOAT,           -- Hourly rental rate
    IN p_halfdayRate FLOAT,          -- Half-day rental rate
    IN p_fulldayRate FLOAT,          -- Full-day rental rate
    IN p_oid INT,                    -- Owner ID (oid)
    IN p_fid INT,                    -- Facility ID (fid)
    IN p_rentFrom TIMESTAMP,         -- Rental start time
    IN p_rentTo TIMESTAMP,           -- Rental end time
    IN p_status ENUM('open', 'closed'), -- Status (open/closed)
    IN p_remark TEXT                 -- Remarks about the space
)
BEGIN
    -- Start the transaction
    START TRANSACTION;

    -- Insert the new space listing
    INSERT INTO space (
        name, location, address, size, numRooms, fid, hourlyRate, 
        halfdayRate, fulldayRate, rentFrom, rentTo, 
        status, remark, oid, createdAt, updatedAt
    )
    VALUES (
        p_spaceName, p_location, p_address, p_size, p_roomNos, p_fid, 
        p_hourlyRate, p_halfdayRate, p_fulldayRate, p_rentFrom, 
        p_rentTo, p_status, p_remark, p_oid, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    );

    -- Commit the transaction
    COMMIT;

    -- Optionally, retrieve the inserted space details
    SELECT * FROM space WHERE name = p_spaceName;

END//

DELIMITER ;

-- Call to add a new space listing
CALL NewSpaceListing(
    'Modern Conference Room',        -- Space Name
    'Downtown, City X',              -- Location
    '123 Conference St, City X',     -- Address
    300.5,                           -- Size (in square feet or meters)
    3,                               -- Number of rooms
    100.00,                          -- Hourly Rate
    250.00,                          -- Half-day Rate
    400.00,                          -- Full-day Rate
    1,                               -- Owner ID (oid)
    2,                               -- Facility ID (fid)
    '2025-02-05 09:00:00',           -- Rent Start Time
    '2025-02-10 17:00:00',           -- Rent End Time
    'open',                          -- Status
    'Great space for events.'        -- Remark
);


-- 1. Owner Review Feedback Query (specific owner)
SELECT 
    s.name AS spaceName, 
    u.name AS CustomerName, 
    f.rating, 
    f.reviews, 
    f.createdAt 
FROM feedback f
JOIN user u ON f.cid = u.id
JOIN space s ON f.sid = s.id
WHERE s.oid = 5;  -- Filtering by the owner's ID


-- 2. Editing a Booking (status) Query
-- TO CANCEL
UPDATE booking 
SET status = 'cancelled', updatedAt = CURRENT_TIMESTAMP 
WHERE id = 5;

SELECT 
    b.id, 
    s.name AS spaceName, 
    b.status, 
    b.bookingDate, 
    b.startTime, 
    b.endTime 
FROM booking b
JOIN space s ON b.sid = s.id
WHERE b.id = 5;


-- TO MODIFY
UPDATE booking 
SET status = 'Available', updatedAt = CURRENT_TIMESTAMP 
WHERE id = 5;

-- 3. Recently Listed Spaces Query
SELECT 
    id, 
    name, 
    location, 
    address, 
    size, 
    numRooms, 
    hourlyRate, 
    halfdayRate, 
    fulldayRate, 
    rating, 
    createdAt 
FROM space 
ORDER BY createdAt DESC 
LIMIT 10;


-- 4. Most Popular Spaces by Booking Frequency
SELECT 
    s.id, 
    s.name, 
    s.location, 
    s.address, 
    s.hourlyRate, 
    s.halfdayRate, 
    s.fulldayRate, 
    s.rating, 
    COUNT(b.id) AS booking_count
FROM space s
JOIN booking b ON s.id = b.sid
WHERE b.status = 'booked'
GROUP BY s.id, s.name, s.location, s.address, s.hourlyRate, s.halfdayRate, s.fulldayRate, s.rating
ORDER BY booking_count DESC
LIMIT 10;


-- 5. Popular Booking Time Slots
SELECT 
    TIME_FORMAT(startTime, '%H:00') AS time_slot,
    COUNT(id) AS booking_count
FROM booking
WHERE status = 'booked'
GROUP BY time_slot
ORDER BY booking_count DESC
LIMIT 10;


-- 4. Truong Vuong

### TRANSACTION
1. Space Status Update
DELIMITER //

CREATE PROCEDURE UpdateSpaceStatus(IN spaceId INT, IN newStatus ENUM('open', 'closed'), IN newRemark TEXT)
BEGIN
    UPDATE space
    SET status = newStatus, remark = newRemark
    WHERE id = spaceId;
END //

DELIMITER ;
CALL UpdateSpaceStatus(1, 'closed', 'Under maintenance');

2. Space Removal
DELIMITER //

CREATE PROCEDURE TemporarilyRemoveSpace(IN spaceId INT)
BEGIN
    UPDATE space
    SET status = 'closed', remark = 'Temporarily removed due to safety concerns'
    WHERE id = spaceId;
END //

CREATE PROCEDURE PermanentlyRemoveSpace(IN spaceId INT)
BEGIN
    DELETE FROM space
    WHERE id = spaceId;
END //

DELIMITER ;
CALL TemporarilyRemoveSpace(2);
CALL PermanentlyRemoveSpace(10);

3. Promotional Offers
DELIMITER //

CREATE PROCEDURE UpdateBookingDiscount(IN bookingId INT, IN discountPercentage FLOAT)
BEGIN
    UPDATE booking
    SET discount = discountPercentage
    WHERE id = bookingId;
END //

DELIMITER ;
CALL UpdateBookingDiscount(4, 20);

-- =======================================================================================================================================
# QUERIES & REPORT
1. Customer Retention Report
DELIMITER //

CREATE PROCEDURE CustomerRetentionReport()
BEGIN
    SELECT  
        u.name AS CustomerName,
        COUNT(b.id) AS TotalBookings,
        ROUND(COALESCE(SUM(b.total), 2), 2) AS TotalSpend,
        MAX(b.bookingDate) AS LastBookingDate,
        CASE 
            WHEN COUNT(b.id) >= 3 THEN 'Loyal'
            ELSE 'At Risk' 
        END AS RetentionStatus
    FROM user u
    LEFT JOIN booking b ON u.id = b.cid
    WHERE u.isCustomer = TRUE
    GROUP BY u.id, u.name
    ORDER BY TotalBookings DESC;
END //

DELIMITER ;
CALL CustomerRetentionReport();

2. Space Utilization Efficiency Report
DELIMITER //

CREATE PROCEDURE SpaceUtilizationEfficiencyReport()
BEGIN
    SELECT  
        s.name AS SpaceName,
        s.location AS Location,
        COUNT(b.id) AS TotalBookings,
        TIMESTAMPDIFF(HOUR, s.rentFrom, s.rentTo) AS AvailableHours,
        CASE 
            WHEN TIMESTAMPDIFF(HOUR, s.rentFrom, s.rentTo) > 0 
            THEN ROUND((COUNT(b.id) / TIMESTAMPDIFF(HOUR, s.rentFrom, s.rentTo)) * 100, 2) 
            ELSE 0 
        END AS UtilizationRate
    FROM space s
    LEFT JOIN booking b ON s.id = b.sid
    GROUP BY s.id, s.name, s.location, s.rentFrom, s.rentTo
    ORDER BY UtilizationRate DESC;
END //

DELIMITER ;
CALL SpaceUtilizationEfficiencyReport();

3. Customer Feedback Sentiment Report
DELIMITER //

CREATE PROCEDURE CustomerFeedbackSentimentReport()
BEGIN
    SELECT  
        s.name AS SpaceName,
        s.location AS Location,
        COUNT(f.id) AS TotalReviews,
        CASE 
            WHEN COUNT(f.id) > 0 
            THEN ROUND(SUM(CASE WHEN f.rating >= 4 THEN 1 ELSE 0 END) / COUNT(f.id) * 100, 2) 
            ELSE 0 
        END AS PositiveSentimentPercentage,
        CASE 
            WHEN COUNT(f.id) > 0 
            THEN ROUND(SUM(CASE WHEN f.rating >= 3 AND f.rating < 4 THEN 1 ELSE 0 END) / COUNT(f.id) * 100, 2) 
            ELSE 0 
        END AS NeutralSentimentPercentage,
        CASE 
            WHEN COUNT(f.id) > 0 
            THEN ROUND(SUM(CASE WHEN f.rating < 3 THEN 1 ELSE 0 END) / COUNT(f.id) * 100, 2) 
            ELSE 0 
        END AS NegativeSentimentPercentage,
        ROUND(AVG(f.rating), 2) AS AverageRating
    FROM feedback f
    JOIN space s ON f.sid = s.id
    GROUP BY s.id, s.name, s.location
    ORDER BY AverageRating DESC;
END //

DELIMITER ;
CALL CustomerFeedbackSentimentReport();

4. Booking Trends by Season Report
DELIMITER //

CREATE PROCEDURE BookingTrendsBySeasonReport()
BEGIN
    SELECT 
        CASE 
            WHEN MONTH(b.bookingDate) IN (12, 1, 2) THEN 'Winter'
            WHEN MONTH(b.bookingDate) IN (3, 4, 5) THEN 'Spring'
            WHEN MONTH(b.bookingDate) IN (6, 7, 8) THEN 'Summer'
            WHEN MONTH(b.bookingDate) IN (9, 10, 11) THEN 'Fall'
        END AS Season,
        COUNT(b.id) AS TotalBookings,
        ROUND(SUM((b.spacePrice * (100 - b.discount) / 100)), 2) AS TotalOwnerRevenue, -- After applying discount
        ROUND(SUM(b.sysFee), 2) AS TotalBookingFee
    FROM booking b
    GROUP BY Season
    ORDER BY TotalBookings DESC;
END //

DELIMITER ;
CALL BookingTrendsBySeasonReport();

5. Space Availability vs. Demand Report
DELIMITER //

CREATE PROCEDURE SpaceAvailabilityVsDemandReport()
BEGIN
    SELECT 
        s.name AS SpaceName,
        s.location AS Location,
        ROUND(SUM((b.spacePrice * (100 - b.discount) / 100)), 2) AS TotalRevenue,
        COUNT(b.id) AS TotalBookings,
        ROUND(AVG((b.spacePrice * (100 - b.discount) / 100)), 2) AS AvgBookingRate,
        CASE
            WHEN COUNT(b.id) > 5 THEN 'High Demand'
            WHEN COUNT(b.id) BETWEEN 2 AND 5 THEN 'Moderate Demand'
            ELSE 'Low Demand'
        END AS PerformanceStatus
    FROM 
        space s
    LEFT JOIN 
        booking b ON s.id = b.sid
    GROUP BY 
        s.id
    ORDER BY 
        TotalRevenue DESC;
END //

DELIMITER ;
CALL SpaceAvailabilityVsDemandReport();
