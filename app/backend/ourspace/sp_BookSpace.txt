USE OurSpace;

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

