USE OurSpace;

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
                AND s.status = 'open'
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
