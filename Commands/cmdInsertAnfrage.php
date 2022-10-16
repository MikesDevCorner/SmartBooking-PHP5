<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdInsertAnfrage implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {

		//make db-connection
	 	$db = new DbConnection();
		
		//Befüllen der benätigten Variablen für den Insert
		$kategorie = $request->getParameter('kategorie');
		$organisation = $db->real_escape_string($request->getParameter('organisation'));
		$ID_Package = (integer) $request->getParameter('ID_Package');
		$termin = $request->getParameter('termin');
		$ersatztermin = $request->getParameter('ersatztermin');
		$kinder = (integer) $db->real_escape_string($request->getParameter('kinder'));
		$erwachsene = (integer) $db->real_escape_string($request->getParameter('erwachsene'));
		$female = (integer) $db->real_escape_string($request->getParameter('female'));
		$male = (integer) $db->real_escape_string($request->getParameter('male'));
		$vegetarier = (integer) $db->real_escape_string($request->getParameter('vegetarier'));
		$relVorschriften = $db->real_escape_string($request->getParameter('relVorschriften'));
		$allergien = $db->real_escape_string($request->getParameter('allergien'));
		$abgefrKnr = $db->real_escape_string($request->getParameter('abgefrKnr'));
		$adresse = $db->real_escape_string($request->getParameter('adresse'));
		$plz = $db->real_escape_string($request->getParameter('plz'));
		$ort = $db->real_escape_string($request->getParameter('ort'));
		$tel = $db->real_escape_string($request->getParameter('tel'));
		$fax = $db->real_escape_string($request->getParameter('fax'));
		$email = $db->real_escape_string($request->getParameter('email'));
		$vorname = $db->real_escape_string($request->getParameter('vorname'));
		$nachname = $db->real_escape_string($request->getParameter('nachname'));

		//die IP-Adresse des anlegenden Hosts wird durch eine PHP-Funktion ermittelt...
		$ipadr = $_SERVER['REMOTE_ADDR'];
		$telAP = $db->real_escape_string($request->getParameter('telAP'));
		$emailAP = $db->real_escape_string($request->getParameter('emailAP'));
		//der User wird aus der Session ermittelt und die zugehörige User-ID wird aus der Datenbank rückgefragt...
		$ID_User = $_SESSION['ID_User'];
		$letzteBearbeitung = date("Y-m-d");
		$bemerkung = $db->real_escape_string($request->getParameter('bemerkung'));
		$erstelltAm = date("Y-m-d");

		//Zusammenbauen des SQL-Statements (Stored Prozedure)
		$SQL = "CALL procInsertAnfrage('$kategorie', '$organisation', '$ID_Package', '$termin', '$ersatztermin', ";
		$SQL .= "'$kinder', '$erwachsene', $female, $male, '$vegetarier', '$relVorschriften', '$allergien', '$abgefrKnr', '$adresse', '$plz', '$ort', '$tel', ";
		$SQL .= "'$fax', '$email', '$vorname', '$nachname', '$ipadr', '$telAP', '$emailAP', '".$ID_User[0]."','$letzteBearbeitung', '$bemerkung', '$erstelltAm')";
		
		//abfeuern des SQL-Strings mittels mysql_query	
		$db->query($SQL);
		//die beeinflussten Zeilen checken um festzustellen ob Erfolg oder Misserfolg.
		$zeilen = $db->affected_rows();

		if($zeilen > 0) 
			$response->write("{success:true}");
		else 
			throw new DBSQLException('Der Datensatz konnte nicht eingefügt werden, bitte prüfen Sie den SQL-Ausdruck.');
		
	}
 }