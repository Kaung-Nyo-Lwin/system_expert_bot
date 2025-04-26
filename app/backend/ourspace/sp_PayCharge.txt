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
