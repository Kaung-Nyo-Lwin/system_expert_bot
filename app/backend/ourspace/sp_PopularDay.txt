USE OurSpace;

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

CALL sp_PopularDay('2025-01-01','2025-12-31');
