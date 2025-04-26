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
