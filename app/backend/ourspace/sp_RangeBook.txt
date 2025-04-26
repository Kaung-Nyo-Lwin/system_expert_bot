USE OurSpace;

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
    SUM(b.spacePrice) AS 'Rental Amount',
    SUM(b.sysFee) As 'System Fee'
    -- COUNT(DISTINCT b.sid) AS 'Number of Spaces'
    FROM booking b
	INNER JOIN spacetem st
    ON b.sid = st.sid
    WHERE b.status IN ('completed','booked')
    GROUP BY st.definedRange
    ;
    
    
    DROP TEMPORARY TABLE IF EXISTS temp;
	
    
END//
DELIMITER ;
