<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdInsertBuchung implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {

		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
			$resyBuchungsNr = $request->getParameter('resyBuchungsNr');
			$terminAnreise = $db->real_escape_string($request->getParameter('terminAnreise'));
			$ersatzTerminAnreise = $db->real_escape_string($request->getParameter('ersatzTerminAnreise'));
			$kinder =$request->getParameter('kinder');
			$erwachsene = $request->getParameter('erwachsene');
			$female = $request->getParameter('female');
			$male = $request->getParameter('male');
			$vegetarier = $request->getParameter('vegetarier');
			$relVorschriften = $db->real_escape_string($request->getParameter('relVorschriften'));
			$allergien = $db->real_escape_string($request->getParameter('allergien'));
			$erstelltAm = $db->real_escape_string($request->getParameter('erstelltAm'));
			$buchungsStatus = $db->real_escape_string($request->getParameter('buchungsStatus'));
			$ID_Ansprechperson = $request->getParameter('ID_Ansprechperson');
			
			//der User wird aus der Session ermittelt
			$ID_User = $_SESSION['ID_User'];
			$letzteBearbeitung = date("Y-m-d");

			if($request->issetParameter('ID_Package')) {
				$ID_Package = $request->getParameter('ID_Package');
			}
			else {
				$ID_Anfrage = $request->getParameter('ID_Anfrage');
				$PackSQL = "SELECT ID_Package from tAnfrage where ID_Anfrage = $ID_Anfrage";
				$ID_Package = $db->query($PackSQL)->fetch_object()->ID_Package;
			}

			/**************   STARTEN DER TRANSAKTION:   *********************/
			$db->query('begin');

			//Zusammenbauen des SQL-Statements (Stored Procedure)
			$SQL = "CALL procInsertBuchung('$resyBuchungsNr','$ID_Package', '$terminAnreise', '$ersatzTerminAnreise', '$kinder', '$erwachsene', '$female', '$male', '$vegetarier',";
			$SQL .= "'$relVorschriften', '$allergien','$ID_User','$letzteBearbeitung', '$erstelltAm', '$buchungsStatus','$ID_Ansprechperson')";

			//abfeuern des SQL-Strings mittels mysql_query	
			$db->query($SQL);
			//die beeinflussten Zeilen checken um festzustellen ob Erfolg oder Misserfolg.
			$zeilen = $db->affected_rows();


			//In die Tabelle tLeistungsZeitpunkt müssen jetzt noch die Leistungen des gebuchten Packages gespeichert werden:
			$SQL = "SELECT tLeistung.ID_Leistung as IDL, tLeistung.StandardUhrzeit as ZEIT, tPackageleistung.leistungstag as TAG FROM tPackageleistung ";
			$SQL .= "INNER JOIN tLeistung ON (tPackageleistung.ID_Leistung = tLeistung.ID_Leistung) WHERE tPackageleistung.ID_Package = $ID_Package";
			$ergebnis = $db->query($SQL);

			//die ID der neuen Buchung über die Datenbank ermitteln
			$ID_Buchung = $db->query("SELECT LAST_INSERT_ID() as neueBuchung")->fetch_object()->neueBuchung;
			
			//für jeden Datensatz der SQL-SELECT Anweisung wird ein eigenes Insert-StoreProc aufgerufen
			while($zeile = $ergebnis->fetch_object()) {
				
				$echtDatum = date("Y-m-d", strtotime("+".($zeile->TAG-1)." day", strtotime("$terminAnreise")));
				$db->query("CALL procInsertLeistungsZeitpunkt('$ID_Buchung','$zeile->IDL', '{$zeile->ZEIT}', '$echtDatum')");
			}

			$db->query('commit');
			/**************  ENDE DER TRANSAKTION  **************/

			if($zeilen > 0) {
				$response->write("{success:true}");
			}
			else 
				$response->write("{success:false}");
		} else $response->write("{success:false}");
	}
 }