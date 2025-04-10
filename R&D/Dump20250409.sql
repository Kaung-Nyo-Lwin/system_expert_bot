-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: mysql-query-quokkas-query-quokkas.g.aivencloud.com    Database: national_metaverse_museum
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '027d33c0-f1ba-11ef-a4cc-9eb89ab3a866:1-15,
94f4e540-dcf3-11ef-ae6f-12ba75e14fe4:1-8534,
fd6e101e-14f5-11f0-8698-6652e8866fa2:1-16';

--
-- Table structure for table `attribute`
--

DROP TABLE IF EXISTS `attribute`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attribute` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `object_id` bigint NOT NULL,
  `artist` varchar(100) DEFAULT NULL,
  `art_style` varchar(100) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_museum_object_attribute` (`object_id`),
  CONSTRAINT `fk_museum_object_attribute` FOREIGN KEY (`object_id`) REFERENCES `museum_object` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `entrance`
--

DROP TABLE IF EXISTS `entrance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entrance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `museum_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `transaction_id` bigint NOT NULL,
  `ticket_no` varchar(50) NOT NULL,
  `price` int NOT NULL,
  `ticket_type` text,
  `entry_time` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_no` (`ticket_no`),
  KEY `fk_museum_entrance` (`museum_id`),
  KEY `fk_entrace_payment` (`transaction_id`),
  CONSTRAINT `fk_entrace_payment` FOREIGN KEY (`transaction_id`) REFERENCES `payment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_museum_entrance` FOREIGN KEY (`museum_id`) REFERENCES `museum` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `keyword`
--

DROP TABLE IF EXISTS `keyword`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `keyword` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `value` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `value` (`value`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `longitude` decimal(11,8) DEFAULT NULL,
  `latitude` decimal(11,8) DEFAULT NULL,
  `country` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `museum`
--

DROP TABLE IF EXISTS `museum`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `museum` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `location_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_museum_location` (`location_id`),
  CONSTRAINT `fk_museum_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `museum_keyword`
--

DROP TABLE IF EXISTS `museum_keyword`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `museum_keyword` (
  `museum_id` bigint NOT NULL,
  `keyword_id` bigint NOT NULL,
  PRIMARY KEY (`museum_id`,`keyword_id`),
  KEY `fk_museum_keyword_keyword` (`keyword_id`),
  CONSTRAINT `fk_museum_keyword_keyword` FOREIGN KEY (`keyword_id`) REFERENCES `keyword` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_museum_keyword_museum` FOREIGN KEY (`museum_id`) REFERENCES `museum` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `museum_object`
--

DROP TABLE IF EXISTS `museum_object`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `museum_object` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `museum_id` bigint NOT NULL,
  `country` text,
  `title` varchar(255) NOT NULL,
  `description` text,
  `year` int DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_museum_object_museum` (`museum_id`),
  CONSTRAINT `fk_museum_object_museum` FOREIGN KEY (`museum_id`) REFERENCES `museum` (`id`) ON DELETE CASCADE,
  CONSTRAINT `museum_object_chk_1` CHECK ((`year` between 0 and 2025))
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `museum_object_keyword`
--

DROP TABLE IF EXISTS `museum_object_keyword`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `museum_object_keyword` (
  `object_id` bigint NOT NULL,
  `keyword_id` bigint NOT NULL,
  PRIMARY KEY (`object_id`,`keyword_id`),
  KEY `keyword_id` (`keyword_id`),
  CONSTRAINT `museum_object_keyword_ibfk_1` FOREIGN KEY (`object_id`) REFERENCES `museum_object` (`id`) ON DELETE CASCADE,
  CONSTRAINT `museum_object_keyword_ibfk_2` FOREIGN KEY (`keyword_id`) REFERENCES `keyword` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `museum_object_type_info`
--

DROP TABLE IF EXISTS `museum_object_type_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `museum_object_type_info` (
  `object_id` bigint NOT NULL,
  `type_id` bigint NOT NULL,
  PRIMARY KEY (`object_id`,`type_id`),
  KEY `fk_museum_object_type_info_type_info` (`type_id`),
  CONSTRAINT `fk_museum_object_type_info_museum` FOREIGN KEY (`object_id`) REFERENCES `museum_object` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_museum_object_type_info_type_info` FOREIGN KEY (`type_id`) REFERENCES `type_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `museum_type_info`
--

DROP TABLE IF EXISTS `museum_type_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `museum_type_info` (
  `museum_id` bigint NOT NULL,
  `type_id` bigint NOT NULL,
  PRIMARY KEY (`museum_id`,`type_id`),
  KEY `fk_museum_type_info_type_info` (`type_id`),
  CONSTRAINT `fk_museum_type_info_museum` FOREIGN KEY (`museum_id`) REFERENCES `museum` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_museum_type_info_type_info` FOREIGN KEY (`type_id`) REFERENCES `type_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `object_dimension`
--

DROP TABLE IF EXISTS `object_dimension`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `object_dimension` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `object_id` bigint NOT NULL,
  `height` decimal(10,2) DEFAULT NULL,
  `width` decimal(10,2) DEFAULT NULL,
  `depth` decimal(10,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_museum_object_dimension` (`object_id`),
  CONSTRAINT `fk_museum_object_dimension` FOREIGN KEY (`object_id`) REFERENCES `museum_object` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `status` varchar(50) NOT NULL,
  `amount` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `type_info`
--

DROP TABLE IF EXISTS `type_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `type_info` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `value` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `value` (`value`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `visitor_interaction`
--

DROP TABLE IF EXISTS `visitor_interaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `visitor_interaction` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `object_id` bigint NOT NULL,
  `is_liked` tinyint(1) DEFAULT NULL,
  `comments` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_user_visitor_interaction` (`user_id`),
  KEY `fk_museum_object_visitor_interaction` (`object_id`),
  CONSTRAINT `fk_museum_object_visitor_interaction` FOREIGN KEY (`object_id`) REFERENCES `museum_object` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_visitor_interaction` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_is_liked_or_comment` CHECK (((`is_liked` is not null) or (`comments` is not null)))
) ENGINE=InnoDB AUTO_INCREMENT=248 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-09 11:29:50
