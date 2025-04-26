USE OurSpace;

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


