USE OurSpace;

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

