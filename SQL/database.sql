/*********************************************************************************************************/
/*************************************** CREATE DATABASE *************************************************/
/*********************************************************************************************************/

create database if not exists `smartbooking`;
USE `smartbooking`;


/*********************************************************************************************************/
/*************************************** CREATE TABLES ***************************************************/
/*********************************************************************************************************/

CREATE TABLE `tAnfrage` (
  `ID_Anfrage` int(11) NOT NULL auto_increment,
  `kategorie` varchar(30) collate latin1_general_ci NOT NULL,
  `organisation` varchar(50) collate latin1_general_ci default NULL,
  `ID_Package` int(11) NOT NULL,
  `termin` date NOT NULL,
  `ersatztermin` date default NULL,
  `kinder` int(11) default NULL,
  `erwachsene` int(11) default NULL,
  `female` int(11) default NULL,
  `male` int(11) default NULL,
  `vegetarier` int(11) default NULL,
  `relVorschriften` text collate latin1_general_ci,
  `allergien` text collate latin1_general_ci,
  `abgefrKnr` varchar(20) collate latin1_general_ci default NULL,
  `adresse` varchar(50) collate latin1_general_ci NOT NULL,
  `plz` varchar(10) collate latin1_general_ci NOT NULL,
  `ort` varchar(50) collate latin1_general_ci NOT NULL,
  `tel` varchar(50) collate latin1_general_ci default NULL,
  `fax` varchar(50) collate latin1_general_ci default NULL,
  `email` varchar(50) collate latin1_general_ci NULL,
  `vorname` varchar(50) collate latin1_general_ci NOT NULL,
  `nachname` varchar(50) collate latin1_general_ci NOT NULL,
  `ipadr` varchar(20) collate latin1_general_ci default NULL,
  `telAP` varchar(50) collate latin1_general_ci NOT NULL,
  `emailAP` varchar(50) collate latin1_general_ci NOT NULL,
  `ID_User` int(11) default NULL,
  `letzteBearbeitung` date default NULL,
  `bemerkung` text collate latin1_general_ci,
  `uebernommen` tinyint(1) default '0',
  `abgelehnt` tinyint(1) default '0',
  `aktiv` tinyint(1) default '1',
  `erstelltAm` date NOT NULL,
  PRIMARY KEY  (`ID_Anfrage`),
  KEY `fk_tAnfrage_tPackage` (`ID_Package`),
  KEY `IX_tAnfrage_organisation` (`organisation`),
  KEY `IX_tAnfrage_nachname` (`nachname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `tAnsprechperson` (
  `ID_Ansprechperson` int(11) NOT NULL auto_increment,
  `ID_Kunde` int(11) NOT NULL,
  `nachname` varchar(50) collate latin1_general_ci NOT NULL,
  `vorname` varchar(50) collate latin1_general_ci default NULL,
  `telefon` varchar(20) collate latin1_general_ci default NULL,
  `email` varchar(50) collate latin1_general_ci NOT NULL,
  `aktiv` tinyint(1) default '1',
  `ID_User` int(11) NOT NULL,
  `letzteBearbeitung` date NOT NULL,
  `bemerkung` text collate latin1_general_ci,
  PRIMARY KEY  (`ID_Ansprechperson`),
  KEY `fk_tAnsprechperson_IDKunde` (`ID_Kunde`),
  KEY `IX_AnsprechpersonNachname` (`nachname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `tBuchung` (
  `ID_Buchung` int(11) NOT NULL auto_increment,
  `resyBuchungsNr` varchar(10) collate latin1_general_ci NOT NULL,
  `ID_Package` int(11) NOT NULL,
  `terminAnreise` date NOT NULL,
  `ersatzTerminAnreise` date default NULL,
  `kinder` int(11) default NULL,
  `erwachsene` int(11) default NULL,
  `female` int(11) default NULL,
  `male` int(11) default NULL,
  `vegetarier` int(11) default NULL,
  `relVorschriften` text collate latin1_general_ci,
  `allergien` text collate latin1_general_ci,
  `ID_User` int(11) default NULL,
  `letzteBearbeitung` date default NULL,
  `erstelltAm` date default NULL,
  `buchungsStatus` varchar(20) collate latin1_general_ci default NULL,
  `aktiv` tinyint(1) default '1',
  `ID_Ansprechperson` int(11) NOT NULL,
  PRIMARY KEY  (`ID_Buchung`),
  KEY `IX_resyB` (`resyBuchungsNr`),
  KEY `IX_status` (`buchungsStatus`),
  KEY `FK_tbuchung_tansprechperson` (`ID_Ansprechperson`),
  KEY `FK_tbuchung_tpackage` (`ID_Package`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `tBuchungsinfo` (
  `ID_Buchungsinfo` int(11) NOT NULL auto_increment,
  `ID_Buchung` int(11) NOT NULL,
  `infoDatum` date NOT NULL,
  `infotext` text collate latin1_general_ci,
  `ID_User` int(11) NOT NULL,
  PRIMARY KEY  (`ID_Buchungsinfo`),
  KEY `FK_tbuchungsinfo` (`ID_Buchung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `tJhb` (
  `ID_Jhb` int(11) NOT NULL auto_increment,
  `jhb` varchar(50) collate latin1_general_ci NOT NULL,
  `adresse` varchar(70) collate latin1_general_ci NOT NULL,
  `plz` varchar(10) collate latin1_general_ci NOT NULL,
  `ort` varchar(50) collate latin1_general_ci NOT NULL,
  `aktiv` tinyint(1) default '1',
  PRIMARY KEY  (`ID_Jhb`),
  KEY `IX_tJHB_jhb` (`jhb`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `tJhb_Package` (
  `ID_Jhb` int(11) NOT NULL,
  `ID_Package` int(11) NOT NULL,
  PRIMARY KEY  (`ID_Jhb`,`ID_Package`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `tKunde` (
  `ID_Kunde` int(11) NOT NULL auto_increment,
  `kategoriek` varchar(30) collate latin1_general_ci NOT NULL,
  `organisation` varchar(50) collate latin1_general_ci NOT NULL,
  `adresse` varchar(70) collate latin1_general_ci NOT NULL,
  `plz` varchar(10) collate latin1_general_ci NOT NULL,
  `ort` varchar(50) collate latin1_general_ci NOT NULL,
  `telefon` varchar(50) collate latin1_general_ci NOT NULL,
  `fax` varchar(50) collate latin1_general_ci default NULL,
  `email` varchar(50) collate latin1_general_ci NOT NULL,
  `ID_User` int(11) NOT NULL,
  `letzteBearbeitung` date default NULL,
  `resykd` varchar(20) collate latin1_general_ci NOT NULL,
  `bemerkung` text collate latin1_general_ci,
  `erstelltAm` date default NULL,
  `aktiv` tinyint(1) default '1',
  PRIMARY KEY  (`ID_Kunde`),
  KEY `IX_resyKd` (`resykd`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `tLeistung` (
  `ID_Leistung` int(11) NOT NULL auto_increment,
  `Leistung` varchar(50) collate latin1_general_ci NOT NULL,
  `StandardUhrzeit` time NOT NULL,
  `aktiv` tinyint(1) default '1',
  `LeistungsBemerkung` text collate latin1_general_ci,
  `ID_Partner` int(11) NOT NULL,
  PRIMARY KEY  (`ID_Leistung`),
  KEY `IX_tLeistung_Leistung` (`Leistung`),
  KEY `FK_tleistung_tPartner` (`ID_Partner`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `tLeistungszeitpunkt` (
  `ID_LeistungsZeitpunkt` int(11) NOT NULL auto_increment,
  `ID_Buchung` int(11) NOT NULL,
  `ID_Leistung` int(11) NOT NULL,
  `EchtUhrzeit` time NOT NULL,
  `EchtDatum` date NOT NULL,
  PRIMARY KEY  (`ID_LeistungsZeitpunkt`),
  KEY `FK_tLeistungsZeitpunkt_tBuchung` (`ID_Buchung`),
  KEY `FK_tLeistungsZeitpunkt_tLeistung` (`ID_Leistung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `tPackage` (
  `ID_Package` int(11) NOT NULL auto_increment,
  `packagename` varchar(50) collate latin1_general_ci NOT NULL,
  `pdfPfad` varchar(200) collate latin1_general_ci default NULL,
  `ID_User` int(11) default NULL,
  `letzteBearbeitung` date NOT NULL,
  `aktiv` tinyint(1) default '1',
  PRIMARY KEY  (`ID_Package`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `tPackageleistung` (
  `ID_Package` int(11) NOT NULL,
  `ID_Leistung` int(11) NOT NULL,
  `leistungstag` int(11) default NULL,
  `ID_User` int(11) NOT NULL,
  `letzteBearbeitung` date NOT NULL,
  `bermerkung` text collate latin1_general_ci,
  PRIMARY KEY  (`ID_Package`,`ID_Leistung`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `tPartner` (
  `ID_Partner` int(11) NOT NULL auto_increment,
  `firmenname` varchar(70) collate latin1_general_ci default NULL,
  `vorname` varchar(50) collate latin1_general_ci default NULL,
  `nachname` varchar(50) collate latin1_general_ci default NULL,
  `adresse` varchar(70) collate latin1_general_ci NOT NULL,
  `plz` varchar(10) collate latin1_general_ci NOT NULL,
  `ort` varchar(50) collate latin1_general_ci NOT NULL,
  `tel` varchar(20) collate latin1_general_ci default NULL,
  `email` varchar(50) collate latin1_general_ci default NULL,
  `aktiv` tinyint(1) default '1',
  `ID_User` int(11) default NULL,
  `letzteBearbeitung` date default NULL,
  PRIMARY KEY  (`ID_Partner`),
  KEY `IX_tPartner_firmenname` (`firmenname`),
  KEY `IX_tPartner_nachname` (`nachname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `tUser` (
  `ID_User` int(11) NOT NULL auto_increment,
  `vorname` varchar(50) collate latin1_general_ci NOT NULL,
  `nachname` varchar(50) collate latin1_general_ci NOT NULL,
  `email` varchar(50) collate latin1_general_ci NOT NULL,
  `adresse` varchar(70) collate latin1_general_ci default NULL,
  `plz` varchar(10) collate latin1_general_ci default NULL,
  `ort` varchar(50) collate latin1_general_ci default NULL,
  `passwort` varchar(50) collate latin1_general_ci NOT NULL,
  `right_User` tinyint(1) default '1',
  `right_Anfrage` tinyint(1) default '1',
  `right_Buchung` tinyint(1) default '1',
  `right_Leistung` tinyint(1) default '1',
  `right_Package` tinyint(1) default '1',
  `right_Partner` tinyint(1) default '1',
  `right_Auswertungen` tinyint(1) default '1',
  `right_Kunde` tinyint(1) default '1',
  `right_Jugendherbergen` tinyint(1) default '1',
  `aktiv` tinyint(1) default '1',
  PRIMARY KEY  (`ID_User`),
  UNIQUE KEY `UK_eMail` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*password is: init*/
insert  into `tUser`(`ID_User`,`vorname`,`nachname`,`email`,`adresse`,`plz`,`ort`,`passwort`,`right_User`,`right_Anfrage`,`right_Buchung`,`right_Leistung`,`right_Package`,`right_Partner`,`right_Auswertungen`,`right_Kunde`,`right_Jugendherbergen`,`aktiv`) values (1,'Michael','Wagner','test@test.at',NULL,NULL,NULL,'e37f0136aa3ffaf149b351f6a4c948e9',1,1,1,1,1,1,1,1,1,1);


/*********************************************************************************************************/
/*************************************** ADD CONSTRAINTS TO TABLES ***************************************/
/*********************************************************************************************************/


ALTER TABLE tAnfrage ADD CONSTRAINT `fk_tAnfrage_tPackage` FOREIGN KEY (`ID_Package`) REFERENCES `tPackage` (`ID_Package`) ON UPDATE CASCADE;
ALTER TABLE tAnsprechperson ADD CONSTRAINT `fk_tAnsprechperson_IDKunde` FOREIGN KEY (`ID_Kunde`) REFERENCES `tKunde` (`ID_Kunde`) ON UPDATE CASCADE;
ALTER TABLE tBuchung ADD CONSTRAINT `FK_tbuchung_tpackage` FOREIGN KEY (`ID_Package`) REFERENCES `tPackage` (`ID_Package`) ON UPDATE CASCADE;
ALTER TABLE tBuchung ADD CONSTRAINT `FK_tbuchung_tansprechperson` FOREIGN KEY (`ID_Ansprechperson`) REFERENCES `tAnsprechperson` (`ID_Ansprechperson`) ON UPDATE CASCADE;
ALTER TABLE tBuchungsinfo ADD CONSTRAINT `FK_tbuchungsinfo` FOREIGN KEY (`ID_Buchung`) REFERENCES `tBuchung` (`ID_Buchung`) ON UPDATE CASCADE;
ALTER TABLE tJhb_Package ADD CONSTRAINT `FK_tJHB_tJhb_Package` FOREIGN KEY (`ID_Jhb`) REFERENCES `tJhb` (`ID_Jhb`) ON UPDATE CASCADE;
ALTER TABLE tJhb_Package ADD CONSTRAINT `FK_tPackage_tJhb_Package` FOREIGN KEY (`ID_Package`) REFERENCES `tPackage` (`ID_Package`) ON UPDATE CASCADE;
ALTER TABLE tLeistung ADD CONSTRAINT `FK_tleistung_tPartner` FOREIGN KEY (`ID_Partner`) REFERENCES `tPartner` (`ID_Partner`) ON UPDATE CASCADE;
ALTER TABLE tLeistungszeitpunkt ADD CONSTRAINT `FK_tLeistungsZeitpunkt_tBuchung` FOREIGN KEY (`ID_Buchung`) REFERENCES `tBuchung` (`ID_Buchung`) ON UPDATE CASCADE;
ALTER TABLE tLeistungszeitpunkt ADD CONSTRAINT `FK_tLeistungsZeitpunkt_tLeistung` FOREIGN KEY (`ID_Leistung`) REFERENCES `tLeistung` (`ID_Leistung`) ON UPDATE CASCADE;
ALTER TABLE tPackageleistung ADD CONSTRAINT `FK_PackageLeistung_IDLeistung` FOREIGN KEY (`ID_Leistung`) REFERENCES `tLeistung` (`ID_Leistung`) ON UPDATE CASCADE;
ALTER TABLE tPackageleistung ADD CONSTRAINT `FK_PackageLeistung_IDPackage` FOREIGN KEY (`ID_Package`) REFERENCES `tPackage` (`ID_Package`) ON UPDATE CASCADE;





/*********************************************************************************************************/
/*************************************** VIEWS ***********************************************************/
/*********************************************************************************************************/

DELIMITER $$
CREATE VIEW `vAnfrage` AS 
SELECT
  `tAnfrage`.`ID_Anfrage`        AS `ID_Anfrage`,
  `tAnfrage`.`kategorie`         AS `kategorie`,
  `tAnfrage`.`organisation`      AS `organisation`,
  `tPackage`.`packagename`       AS `packagename`,
  `tAnfrage`.`termin`            AS `termin`,
  `tAnfrage`.`ersatztermin`      AS `ersatztermin`,
  `tAnfrage`.`kinder`            AS `kinder`,
  `tAnfrage`.`erwachsene`        AS `erwachsene`,
  `tAnfrage`.`female`            AS `female`,
  `tAnfrage`.`male`              AS `male`,
  `tAnfrage`.`vegetarier`        AS `vegetarier`,
  `tAnfrage`.`relVorschriften`   AS `relVorschriften`,
  `tAnfrage`.`allergien`         AS `allergien`,
  `tAnfrage`.`abgefrKnr`         AS `abgefrKnr`,
  `tAnfrage`.`adresse`           AS `adresse`,
  `tAnfrage`.`plz`               AS `plz`,
  `tAnfrage`.`ort`               AS `ort`,
  `tAnfrage`.`tel`               AS `tel`,
  `tAnfrage`.`fax`               AS `fax`,
  `tAnfrage`.`email`             AS `email`,
  `tAnfrage`.`vorname`           AS `vorname`,
  `tAnfrage`.`nachname`          AS `nachname`,
  `tAnfrage`.`ipadr`             AS `ipadr`,
  `tAnfrage`.`telAP`             AS `telAP`,
  `tAnfrage`.`emailAP`           AS `emailAP`,
  `tAnfrage`.`uebernommen`       AS `uebernommen`,
  `tAnfrage`.`abgelehnt`         AS `abgelehnt`,
  CONCAT(`tUser`.`vorname`,_latin1' ',`tUser`.`nachname`) AS `username`,
  `tAnfrage`.`letzteBearbeitung` AS `letzteBearbeitung`,
  `tAnfrage`.`bemerkung`         AS `bemerkung`,
  `tAnfrage`.`erstelltAm`        AS `erstelltAm`
FROM ((`tAnfrage` LEFT JOIN `tUser` ON ((`tAnfrage`.`ID_User` = `tUser`.`ID_User`)))
LEFT JOIN `tPackage` ON ((`tPackage`.`ID_Package` = `tAnfrage`.`ID_Package`)))
WHERE (`tAnfrage`.`aktiv` = 1)$$
DELIMITER ;




/*********************************************************************************************************/
/*************************************** STORED PROCEDURES ***********************************************/
/*********************************************************************************************************/

DELIMITER $$
CREATE PROCEDURE `procInsertAnfrage`(
		IN kategorie varchar(30),
		IN organisation varchar(50),
		IN ID_Package int,
		IN termin date,
		IN ersatztermin date,
		IN kinder int,
		IN erwachsene int,
		IN female int,
		IN male int,
		IN vegetarier int,
		IN relVorschriften text,
		IN allergien text,
		IN abgefrKnr varchar(20),
		IN adresse varchar(50),
		IN plz varchar(10),
		IN ort varchar(50),
		IN tel varchar(50),
		IN fax varchar(50),
		IN email varchar(50),
		IN vorname varchar(50),
		IN nachname varchar(50),
		IN ipadr varchar(20),
		IN telAP varchar(50),
		IN emailAP varchar(50),
		IN ID_User int,
		IN letzteBearbeitung date,
		IN bemerkung text,
		IN erstelltAm date)
	BEGIN
		INSERT INTO tAnfrage (kategorie, organisation, ID_Package, termin, ersatztermin, kinder, 
		erwachsene, female, male, vegetarier, relVorschriften, allergien, abgefrKnr, adresse, 
		plz, ort, tel, fax, email, vorname, nachname, ipadr, telAP, emailAP, ID_User, letzteBearbeitung, 
		bemerkung, erstelltAm)
		VALUES (kategorie, organisation, ID_Package, termin, ersatztermin, kinder, 
		erwachsene, female, male, vegetarier, relVorschriften, allergien, abgefrKnr, adresse, 
		plz, ort, tel, fax, email, vorname, nachname, ipadr, telAP, emailAP, ID_User, letzteBearbeitung, 
		bemerkung, erstelltAm);
	END $$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `procInsertPartner`(
		IN ID_Partner int,
		IN firmenname varchar(70),
		IN vorname varchar(50),
		IN nachname varchar(50),
		IN adresse varchar(70),
		IN plz varchar(10),
		IN ort varchar(50),
		IN tel varchar(20),
		IN email varchar(50),
		IN ID_User int,
		IN letzteBearbeitung date)
	BEGIN
		INSERT INTO tPartner (ID_Partner, firmenname, vorname, nachname, adresse, 
		plz, ort, tel, email, ID_User, letzteBearbeitung)
		VALUES (ID_Partner, firmenname, vorname, nachname, adresse, 
		plz, ort, tel, email, ID_User, letzteBearbeitung);
	END $$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `procInsertJhb`(
		IN jhb varchar(50),
       		IN adresse varchar(70),
        	IN plz varchar(10),
        	IN ort varchar(50))
	BEGIN
		INSERT INTO tJhb (jhb, adresse, plz, ort, aktiv)
       		VALUES (jhb, adresse, plz, ort, true);        
	END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `procInsertJhbPack`(
	IN ID_Jhb int(11),
	IN ID_Package int(11))
	BEGIN
     	INSERT INTO tJhb_Package (ID_Jhb, ID_Package)
     	VALUES (ID_Jhb, ID_Package);        
	END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `procInsertPackage`(
		IN packagename varchar(50),
		IN pdfPfad varchar(200),
		IN ID_User int)
	BEGIN
		INSERT INTO tPackage(packagename, pdfPfad, ID_User, aktiv)
		VALUES (packagename, pdfPfad, ID_User, true);        
	END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `procInsertPackLeistung`(
		IN ID_Package int,
        IN ID_Leistung int)
	BEGIN
		INSERT INTO tPackageleistung(ID_Package, ID_Leistung)
		VALUES (ID_Package,ID_Leistung);        
    END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `procInsertKunde`(
		IN kategorie VARCHAR(30),
		IN organisation VARCHAR(50),
		IN adresse VARCHAR(50),
		IN plz VARCHAR(10),
		IN ort VARCHAR(50),
		IN telefon VARCHAR(50),
		IN fax VARCHAR(50),
		IN email VARCHAR(50),
		IN resykd VARCHAR(20),
		IN bemerkung TEXT,
		IN ID_User INT,
		IN letzteBearbeitung DATE,
		IN erstelltAm DATE)
	BEGIN
		INSERT INTO tKunde (kategoriek, organisation,  
		adresse, plz, ort, telefon, fax, email, ID_User, resykd, letzteBearbeitung, 
		bemerkung, erstelltAm)
		VALUES (kategorie, organisation,  
		adresse, plz, ort, telefon, fax, email, ID_User, resykd, letzteBearbeitung, 
		bemerkung, erstelltAm);
	END $$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `procInsertAnsprechperson`(
		IN ID_Kunde INT,
		IN nachname VARCHAR(50),
		IN vorname VARCHAR(50),
		IN telefon VARCHAR(20),
		IN email VARCHAR(50),
		IN ID_User INT,
		IN letzteBearbeitung DATE,
		IN bemerkung TEXT)
	BEGIN
		INSERT INTO tAnsprechperson (ID_Kunde,nachname,vorname,telefon,email,ID_User,letzteBearbeitung,bemerkung)
		VALUES (ID_Kunde,nachname,vorname,telefon,email,ID_User,letzteBearbeitung,bemerkung);
	END $$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `procInsertBuchung`(
		IN resyBuchungsNr VARCHAR(10),
		IN ID_Package int,
		IN terminAnreise DATE,
		IN ersatzTerminAnreise DATE,
		IN kinder INT,
		IN erwachsene INT,
		IN female INT,
		IN male INT,
		IN vegetarier INT,
		IN relVorschriften TEXT,
		IN allergien TEXT,
		IN ID_User INT,
		IN letzteBearbeitung DATE,
		IN erstelltAm DATE,
		IN buchungsStatus VARCHAR(20),
		IN ID_Ansprechperson int)
	BEGIN
		INSERT INTO tBuchung (resyBuchungsNr,ID_Package,terminAnreise,ersatzTerminAnreise,kinder,erwachsene,female,male,
		vegetarier,relVorschriften,allergien,ID_User,letzteBearbeitung,erstelltAm,buchungsStatus,ID_Ansprechperson)
		VALUES (resyBuchungsNr,ID_Package,terminAnreise,ersatzTerminAnreise,kinder,erwachsene,female,male,
		vegetarier,relVorschriften,allergien,ID_User,letzteBearbeitung,erstelltAm,buchungsStatus,ID_Ansprechperson);
	END $$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `procInsertLeistung`(
		IN Leistung VARCHAR(50),
		IN StandardUhrzeit TIME,
		IN LeistungsBemerkung TEXT,
		IN ID_Partner INT)
	BEGIN
		INSERT INTO tLeistung (Leistung, StandardUhrzeit, LeistungsBemerkung, ID_Partner, aktiv)
       		VALUES (Leistung, StandardUhrzeit, LeistungsBemerkung, ID_Partner, TRUE);        
	END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `procInsertUser`(
		IN adresse VARCHAR(70),
		IN email VARCHAR(50),
		IN nachname VARCHAR(50),
		IN vorname VARCHAR(50),
		IN ort VARCHAR(50),
		IN plz VARCHAR(10),
		IN passwd VARCHAR(50))
	BEGIN
		INSERT INTO tUser (adresse, email, nachname, vorname, ort, plz, passwort, aktiv)
       		VALUES (adresse, email, nachname, vorname, ort, plz, passwd, TRUE);        
	END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `procInsertLeistungsZeitpunkt`(
		IN ID_Buchung INT,
		IN ID_Leistung INT,
		IN zeit time,
		IN tag date)
	BEGIN
		INSERT INTO tLeistungszeitpunkt (ID_Buchung, ID_Leistung, EchtUhrzeit, EchtDatum)
       		VALUES (ID_Buchung, ID_Leistung, zeit, tag);        
	END$$
DELIMITER ;


DELIMITER $$
CREATE PROCEDURE `procInsertBuchungsHinweis`(
		IN ID_Buchung INT,
		IN infoDatum date,
		IN infotext TEXT,
		IN ID_User INT)
	BEGIN
		INSERT INTO tBuchungsinfo (ID_Buchung, infodatum, infotext, ID_User)
       		VALUES (ID_Buchung, infodatum, infotext, ID_User);        
	END$$
DELIMITER ;



/*********************************************************************************************************/
/*************************************** ANLEGEN VON TESTDATEN********************************************/
/*********************************************************************************************************/

insert  into `tPackage`(`ID_Package`,`packagename`,`pdfPfad`,`ID_User`,`aktiv`,`letzteBearbeitung`) values (1,'Jugend Aktiv AB','/packages/jugendaktive_annaberg.pdf',2,1,'2010-06-03'),(2,'Come Together Annaberg','/packages/cometogether_a.pdf',2,1,'2010-06-03'),(3,'Sportwoche Mini Annaberg','/packages/sportwoche_a.pdf',2,1,'2010-06-03'),(4,'Wasserratten Bad Grosspertholz','/package/wasserratten_bg.pdf',2,1,'2010-06-03'),(5,'Creatme Youth Bad Grosspertholz','/packages/creatmeyouth_bg.pdf',2,1,'2010-06-03'),(6,'Meine StÃ¤rke Drosendorf','/packages/meinestaerke_d.pdf',2,1,'2010-06-03'),(7,'Kommunikation und Teamerleben Lackenhof','/packages/kom_team_l.pdf',2,1,'2010-06-03'),(8,'Vertrauen und sichern Lackenhof','/packages/vertrauen_l.pdf',2,1,'2010-06-03'),(9,'Gruppendynamic Melk','/packages/gruppendymanik_m.pdf',2,1,'2010-06-03'),(10,'Soziales Lernen Melk','/pakckages/sozialeslernen_m.pdf',2,1,'2010-06-03'),(11,'We are Media Tulln','/package/wearemedia_t.pdf',2,1,'2010-06-03');
insert  into `tPartner`(`ID_Partner`,`firmenname`,`vorname`,`nachname`,`adresse`,`plz`,`ort`,`tel`,`email`,`aktiv`,`ID_User`,`letzteBearbeitung`) values (1,'Pirkers Lebzelterei','Monika','Schwaighofer','Hauptplatz ','3882','Mariazell','03882 2444','',1,2,'2010-06-03'),(2,'Mannitou Outdoor OG','Martin','Veith','Endergasse 57/5/5','1120','Wien','+43 650 9533551','office@mannitou.com ',1,2,'2010-06-03'),(3,'Reiterhof Schagl','Martin','Pfeffer','Langseitenrotte 21','3223','Wiernerbruck','02728 348','schaglhof@aon.at',1,2,'2010-06-03'),(4,'Annabergerhaus','Veronika','Hinteregger','Annarotte','3222','Annaberg','0664 4432003','',1,2,'2010-06-03'),(5,'Herbergsleiter',' ',' ',' ',' ',' ',' ',' ',1,2,'2010-06-03'),(6,'Tennisschule - Mariazellerland','Wolfgang','GlÃ¤nzl','Mariazllerstr. 24','3882','Mariazell','03882 22463','',1,2,'2010-06-03'),(7,'EIBL Lifte TÃ¼rnitz Ges.m.b.H.','Peter','Schackmann','EiblstraÃŸe 12a','31840','TÃ¼rniitz','02769 8245',' office@eibllifte.at ',1,2,'2010-06-03'),(8,'Mariazeller Schwebebahn',' ',' ','WienerstraÃŸe 26','8630','Mariazell','03882 2555','betriebsleitung@mariazell-buergeralpe.at',1,2,'2010-06-03'),(9,'Kameltheater Kernhof','Herbert','Eder','Kamelplatz 1','3195','Kernhof','0664 1111012 ','kameltheater@aon.at',1,2,'2010-06-03'),(10,'Naturlehrpfad Annaberg','Helmuth','Widmayer','Annarotte 177','3222','Annaberg','02728 77045','widmayer.h@aon.at',1,2,'2010-06-03'),(11,'Aqua City St. PÃ¶lten',' ',' ','SchieÃŸstattring 15','3100','St. PÃ¶lten','02742 3526610','',1,2,'2010-06-03'),(12,'Basilika Mariazell','Heidemarie','Lammer','Hauptplatz','8630','Mariazell','03882 2595505','',1,2,'2010-06-03'),(13,'Sole-Felsen-Bad GmÃ¼nd BetriebsfÃ¼hrungs-GmbH ',' ',' ','Albrechtser Str. 12','3950','GmÃ¼nd','02852/20 20 30','info@sole-felsen-bad.at',1,2,'2010-06-03'),(14,'Waldviertel Tourismus','Elisabeth','Ederndorfer','Sparkassenplatz 4','3910','Zwettl','+43 2822 541 09','info@waldviertel.at',1,2,'2010-06-03'),(15,'Lindhorn Kinderclub','Margarete','Patterer','Weitental 42','3295','Lackenhof','0664 / 4237923','info@projektwochen.at',1,2,'2010-06-03'),(16,'Kletterhalle Obergrafendorf','DI Mag. Franz ','Trischler','Am See 1','3200','Obergrafendorf','0676 77 69 808','office@franztrischler.at.',1,2,'2010-06-03'),(17,'MotionManager','Mag. Christoph','Zarfl','Franz Werfelgasse 22','8045','Graz','+43  676 777 16 23','',1,2,'2010-06-03');
insert  into `tLeistung`(`ID_Leistung`,`Leistung`,`StandardUhrzeit`,`aktiv`,`LeistungsBemerkung`,`ID_Partner`) values (1,'Lebkuchen verzieren','10:00:00',1,'',1),(2,'Reiten','10:00:00',1,'',3),(3,'Sommerrodelbahn','10:00:00',1,'',7),(4,'High und Lowropes Elemente','09:00:00',1,'',2),(5,'ProblemlÃ¶sungen fÃ¼r die Gruppe','13:00:00',1,'',2),(6,'Lagerfeuer','20:00:00',1,'',2),(7,'Angeleitete und spielerische Reflexion','09:00:00',1,'',2),(8,'Schatzkammer','09:00:00',1,'',12),(9,'Holzknechtland - BÃ¼rgeralpe','13:00:00',1,'',8),(10,'Kameltheater','11:00:00',1,'',9),(11,'FÃ¼hrung Naturlehrpfad','14:00:00',1,'',10),(12,'Tennis','10:00:00',1,'',6),(13,'Lagerfeuer','19:30:00',1,'',5),(14,'Beachvolleyball','09:00:00',1,'',2),(15,'Ruthsche,Schwimmen, Action','13:00:00',1,'',13),(16,'Schwimmtraining','09:00:00',1,'',13),(17,'Viedeoabend','19:30:00',1,'',5),(18,'Spieleabend','19:00:00',1,'',5),(19,'Aqua Fitness','09:00:00',1,'',13),(20,'Kinderakademie Waldviertel','13:00:00',1,'',14),(21,'BÃ¼hne frei','09:00:00',1,'',14),(22,'Fassldorf','13:00:00',1,'',14),(23,'Modellieren','09:30:00',1,'',14),(24,'ProblemlÃ¶sungsaufgaben','13:00:00',1,'',2),(25,'High- und Lowropes Elemente','09:00:00',1,'',2),(26,'Yoga und bioenergetische Ãœbungen','13:30:00',1,'',2),(27,'Outdoortag','09:00:00',1,'',15),(28,'Fackelwanderung','19:30:00',1,'',15),(29,'Vom niedrigen Seilelement bis hoch hinaus','13:30:00',1,'',15),(30,'Spiel & SpaÃŸ reden Ã¼ber das','13:30:00',1,'',15),(31,'Kommunikationsspiele','09:00:00',1,'',15),(32,'Bouldern bis Toprpe','13:00:00',1,'',15),(33,'First Aid Paket','09:00:00',1,'',15),(34,'Gruppendymnamische Aufgabenstellung','13:30:00',1,'',15),(35,'Kletterschein','09:00:00',1,'',15),(36,'Klettern','09:00:00',1,'',16),(37,'Indoor Sky Walk','13:30:00',1,'',16),(38,'Gruppendynamische Komm. Aufgabe','13:00:00',1,'',16),(39,'Kegeln','09:00:00',1,'',16),(40,'Hochseilgarten mit Flying Fox','09:00:00',1,'',16),(41,'Klettern auf der Riesenleiter','13:30:00',1,'',16),(42,'Trendsportfimnacht','20:00:00',1,'',17),(43,'Workshops im Bereich Fotografie und Film','13:00:00',1,'',17),(44,'Videoschnitt und Photoshop','09:00:00',1,'',17),(45,'Lichtschpiele','16:00:00',1,'',17),(46,'Fotoschau','09:00:00',1,'',17),(47,'vb','00:00:00',1,'cvb',10);
insert  into `tJhb`(`ID_Jhb`,`jhb`,`adresse`,`plz`,`ort`,`aktiv`) values (1,'Annaberg','Annarotte 77','3222','Annaberg',1),(2,'Bad Grosspertholz','Nr. 177','3972','Bad Grosspertholz',1),(3,'Drosendorf','BadstraÃŸe 25','2095','Drosendorf',1),(4,'Lackenhof','Ã–tscherweg 3','3295','Lackenhof',1),(5,'Melk','Abt Karl StraÃŸe 42','3390','Melk',1),(6,'Tulln','Marc Aurel Park 1','3430','Tulln',1);
insert  into `tKunde`(`ID_Kunde`,`kategoriek`,`organisation`,`adresse`,`plz`,`ort`,`telefon`,`fax`,`email`,`ID_User`,`letzteBearbeitung`,`resykd`,`bemerkung`,`erstelltAm`,`aktiv`) values (1,'Schule','VS Altlengbach','Schulgasse 3','3033','Altlengbach','0664 73 66 99 02','','',2,'2010-06-03','000037001258','','2010-06-03',1),(2,'Schule','VS Altlengbach','Schulgasse 3','3033','Altlengbach','0664 73 66 99 02','','',2,'2010-06-03','0000370001258','','2010-06-03',0),(3,'Schule','BG MÃ¶dling','Untere Bachgasse 4','2340','MÃ¶dling','02236','','',2,'2010-06-03','000037001154','','2010-06-03',1),(4,'Schule','VS Texing','Texing 19','3242','Texing','','','',2,'2010-06-03','000036004141','','2010-06-03',1),(5,'Schule','RG3','RadetzkystraÃŸe 2A','1030','Wien','','','',2,'2010-06-03','000037001156','','2010-06-03',1),(6,'Schule','BRG 4','Waltergasse 7','1040','Wien','','','',2,'2010-06-03','000035002085','','2010-06-03',1),(7,'Schule','PTS Wien West','SchopenhauerstraÃŸe 81','1180','Wien','','','',2,'2010-06-03','000037001161','','2010-06-03',1),(8,'Schule','Sporthaupstschule Scheibbs','Feldgasse 3','3270','Scheibbs','','','',2,'2010-06-03','000000151893','','2010-06-03',1);
insert  into `tAnsprechperson`(`ID_Ansprechperson`,`ID_Kunde`,`nachname`,`vorname`,`telefon`,`email`,`aktiv`,`ID_User`,`letzteBearbeitung`,`bemerkung`) values (1,1,'Neuhold','Maria','0664 73 66 99 02','annaberg@noejhw.at',1,2,'2010-06-03',''),(2,3,'Zsak','Maria','02236','annaberg@noejhw.at',1,2,'2010-06-03',''),(3,4,'Thier','Eva','02755 7256','roland@wimdayer.at',1,2,'2010-06-03',''),(4,5,'Tzaferis','Christa','0699 11998286','roland@widmayer.at',1,2,'2010-06-03',''),(5,6,'Michalek','Regine','01 5053447','roland@widmayer.at',1,2,'2010-06-03',''),(6,7,'Greinsteiner','Martina','01 645 01 27','roland@widmayer.at',1,2,'2010-06-03',''),(7,8,'Rinner','Sandra','07482 42266,0','roland@widmayer.at',1,2,'2010-06-03','');
insert  into `tBuchung`(`ID_Buchung`,`resyBuchungsNr`,`ID_Package`,`terminAnreise`,`ersatzTerminAnreise`,`kinder`,`erwachsene`,`female`,`male`,`vegetarier`,`relVorschriften`,`allergien`,`ID_User`,`letzteBearbeitung`,`erstelltAm`,`buchungsStatus`,`aktiv`,`ID_Ansprechperson`) values (1,'1000370002',1,'2010-06-07','2010-06-09',41,4,33,12,0,'','',2,'2010-06-03','2010-06-03','reserviert',1,1),(2,'1000370003',2,'2010-06-20','1900-05-31',45,4,20,25,0,'','',2,'2010-06-03','2010-06-03','reserviert',1,2),(3,'',2,'2010-10-06','1900-05-31',15,2,10,7,0,'','',2,'2010-06-03','2010-06-03','offen',1,3);
insert  into `tBuchungsinfo`(`ID_Buchungsinfo`,`ID_Buchung`,`infoDatum`,`infotext`,`ID_User`) values (1,3,'2010-06-05','hfjjfj',1);
insert  into `tAnfrage`(`ID_Anfrage`,`kategorie`,`organisation`,`ID_Package`,`termin`,`ersatztermin`,`kinder`,`erwachsene`,`female`,`male`,`vegetarier`,`relVorschriften`,`allergien`,`abgefrKnr`,`adresse`,`plz`,`ort`,`tel`,`fax`,`email`,`vorname`,`nachname`,`ipadr`,`telAP`,`emailAP`,`ID_User`,`letzteBearbeitung`,`bemerkung`,`uebernommen`,`abgelehnt`,`aktiv`,`erstelltAm`) values (22,'Schule','VS Altlengbach',1,'2010-06-07','2010-06-09',41,4,33,12,0,'','','','Schulgasse 3','3033','Altlengbach','','','','Maria','Neuhold','127.0.0.1','0664 73 66 99 02','vs-altlengbach@noeschule.at',2,'2010-06-03','',1,0,1,'2010-06-03'),(23,'Schule','BG MÃ¶dling',2,'2028-06-20','0000-00-00',45,4,20,25,0,'','','','UntereBachgasse 8','2340','MÃ¶dling','','','','Maria','Zsak','127.0.0.1','02236','annaberg@noejhw.at',2,'2010-06-03','',1,0,1,'2010-06-03'),(24,'Schule','VS Wieberg / Rehberg',1,'2010-09-13','0000-00-00',14,2,10,6,0,'','','','HauptstraÃŸe 73','3500  ','Krems','','','','Maria','Schmid','127.0.0.1','02732 415 60','301041@noeschule.at',2,'2010-06-03','',0,0,1,'2010-06-03'),(25,'Schule','VS Enzersdorf',1,'2010-09-15','0000-00-00',26,2,15,13,0,'','','','Barmhartstalweg 13 ','2340','Maria Enzersdorf','','','','Petra','Pfeffer','127.0.0.1',' 0664-33 25 314','roland@widmayer.at',2,'2010-06-03','',0,0,1,'2010-06-03'),(26,'Schule','BAKIP 10',2,'2010-09-15','0000-00-00',35,2,36,1,0,'','','','Ettenreichgasse 45c','1010','Wien','','','','Gottfried ','Hofmann','127.0.0.1','01 604 815 613','roland@widmayer.at',2,'2010-06-03','',0,0,1,'2010-06-03'),(27,'Schule','VS Texing',2,'2010-10-06','0000-00-00',15,2,10,7,0,'','','','Texing 19','3242','Texing','','','','Eva','Thier','127.0.0.1','0676 / 84143714','roland@widmayer.at',2,'2010-06-03','',1,0,1,'2010-06-03'),(28,'Privat','',2,'2010-06-24','2010-06-24',0,0,0,0,0,'','','','c','d','e','','','','a','b','127.0.0.1','dd','m@w.at',1,'2010-06-05','',0,0,1,'2010-06-05'),(29,'Schule','',2,'2014-06-20','0000-00-00',0,0,0,0,0,'','','','z','z','z','','','','z','z','127.0.0.1','z','a@b.at',1,'2010-06-05','',0,0,1,'2010-06-05'),(30,'Firma','',6,'2023-06-20','0000-00-00',0,0,0,0,0,'','','','f','f','f','f','f','','f','f','127.0.0.1','f','test@test.at',1,'2010-06-05','',0,0,1,'2010-06-05'),(31,'Schule','',11,'2010-06-23','2010-06-23',0,0,0,0,0,'','','','m','m','m','','','','m','m','127.0.0.1','m','wagnmich@gmail.com',1,'2010-06-05','',0,0,1,'2010-06-05');
insert  into `tJhb_Package`(`ID_Jhb`,`ID_Package`) values (1,1),(1,2),(1,3),(2,5),(2,6),(3,6),(4,7),(4,8),(5,9),(5,10),(6,11);
insert  into `tLeistungszeitpunkt`(`ID_LeistungsZeitpunkt`,`ID_Buchung`,`ID_Leistung`,`EchtUhrzeit`,`EchtDatum`) values (1,1,1,'10:00:00','2010-06-08'),(2,1,3,'10:00:00','2010-06-07'),(3,1,8,'09:00:00','2010-06-08'),(4,1,9,'13:00:00','2010-06-08'),(5,1,10,'11:00:00','2010-06-09'),(6,1,11,'14:00:00','2010-06-07'),(7,1,13,'19:30:00','2010-06-08'),(8,2,4,'09:00:00','2028-06-21'),(9,2,5,'13:00:00','2028-06-20'),(10,2,6,'20:00:00','2028-06-20'),(11,2,7,'09:00:00','2028-06-22'),(12,3,4,'09:00:00','2010-10-07'),(13,3,5,'13:00:00','2010-10-06'),(14,3,6,'20:00:00','2010-10-06'),(15,3,7,'09:00:00','2010-10-08');
insert  into `tPackageleistung`(`ID_Package`,`ID_Leistung`,`leistungstag`,`ID_User`,`letzteBearbeitung`,`bermerkung`) values (1,1,2,0,'0000-00-00',NULL),(1,3,1,0,'0000-00-00',NULL),(1,8,2,0,'0000-00-00',NULL),(1,9,2,0,'0000-00-00',NULL),(1,10,3,0,'0000-00-00',NULL),(1,11,1,0,'0000-00-00',NULL),(1,13,2,0,'0000-00-00',NULL),(2,4,2,0,'0000-00-00',NULL),(2,5,1,0,'0000-00-00',NULL),(2,6,1,0,'0000-00-00',NULL),(2,7,3,0,'0000-00-00',NULL),(3,2,2,0,'0000-00-00',NULL),(3,4,1,0,'0000-00-00',NULL),(3,6,2,0,'0000-00-00',NULL),(3,12,2,0,'0000-00-00',NULL),(3,14,3,0,'0000-00-00',NULL),(4,15,1,0,'0000-00-00',NULL),(4,16,2,0,'0000-00-00',NULL),(4,17,1,0,'0000-00-00',NULL),(4,18,2,0,'0000-00-00',NULL),(4,19,3,0,'0000-00-00',NULL),(5,20,1,0,'0000-00-00',NULL),(5,21,2,0,'0000-00-00',NULL),(5,22,2,0,'0000-00-00',NULL),(5,23,3,0,'0000-00-00',NULL),(6,7,3,0,'0000-00-00',NULL),(6,24,1,0,'0000-00-00',NULL),(6,25,2,0,'0000-00-00',NULL),(6,26,2,0,'0000-00-00',NULL),(7,27,2,0,'0000-00-00',NULL),(7,28,2,0,'0000-00-00',NULL),(7,29,2,0,'0000-00-00',NULL),(7,30,1,0,'0000-00-00',NULL),(7,31,3,0,'0000-00-00',NULL),(8,32,1,0,'0000-00-00',NULL),(8,33,2,0,'0000-00-00',NULL),(8,34,2,0,'0000-00-00',NULL),(8,35,3,0,'0000-00-00',NULL),(9,6,2,0,'0000-00-00',NULL),(9,18,2,0,'0000-00-00',NULL),(9,36,2,0,'0000-00-00',NULL),(9,37,2,0,'0000-00-00',NULL),(9,38,1,0,'0000-00-00',NULL),(9,39,3,0,'0000-00-00',NULL),(10,37,3,0,'0000-00-00',NULL),(10,38,1,0,'0000-00-00',NULL),(10,39,3,0,'0000-00-00',NULL),(10,40,2,0,'0000-00-00',NULL),(10,41,2,0,'0000-00-00',NULL),(11,43,1,0,'0000-00-00',NULL),(11,44,2,0,'0000-00-00',NULL),(11,45,2,0,'0000-00-00',NULL),(11,46,3,0,'0000-00-00',NULL);



/*********************************************************************************************************/
/*************************************** ANLEGEN DES USERS ***********************************************/
/*********************************************************************************************************/
USE `mysql`;
insert  into `db`(`Host`,`Db`,`User`,`Select_priv`,`Insert_priv`,`Update_priv`,`Delete_priv`,`Create_priv`,`Drop_priv`,`Grant_priv`,`References_priv`,`Index_priv`,`Alter_priv`,`Create_tmp_table_priv`,`Lock_tables_priv`,`Create_view_priv`,`Show_view_priv`,`Create_routine_priv`,`Alter_routine_priv`,`Execute_priv`) values ('%','smartbooking','projectuser','Y','Y','Y','Y','N','N','N','N','N','N','N','N','N','Y','N','N','Y');
insert  into `user`(`Host`,`User`,`authentication_string`,`Select_priv`,`Insert_priv`,`Update_priv`,`Delete_priv`,`Create_priv`,`Drop_priv`,`Reload_priv`,`Shutdown_priv`,`Process_priv`,`File_priv`,`Grant_priv`,`References_priv`,`Index_priv`,`Alter_priv`,`Show_db_priv`,`Super_priv`,`Create_tmp_table_priv`,`Lock_tables_priv`,`Execute_priv`,`Repl_slave_priv`,`Repl_client_priv`,`Create_view_priv`,`Show_view_priv`,`Create_routine_priv`,`Alter_routine_priv`,`Create_user_priv`,`ssl_type`,`ssl_cipher`,`x509_issuer`,`x509_subject`,`max_questions`,`max_updates`,`max_connections`,`max_user_connections`) values ('%','projectuser','*8BDE35CA5EB8031F50432DB0E00BCF9F10EAC025','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','N','','','','',0,0,0,0);