<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdFillJHBAuswertungGrid implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
	
		//make db-connection
	 	$db = new DbConnection();
		

			//check if user has permissions to proceed
			$user = new SecurityObject();
			if ($user->checkCredentials($db, $request)== true) {

			//Werte für Paging
			//$start = (integer) $request->getParameter('start');
			//$limit = (integer) $request->getParameter('limit');
			$JHB = (integer) $request->getParameter('jhb');
			$AnfangsDatum = $request->getParameter('Vontermin');
			$EndDatum = $request->getParameter('Bistermin');
			
			//Variable Suchen brauchen wir, weil wir diese Funktion auch zum Suchen in der Grid benützen wollen!
			//dieser Wert wird als zusätzliches Kriterium in den SQL-String eingebunden.
			$suchen = " tLeistung.Leistung LIKE '%".$request->getParameter('suchen')."%' AND tLeistung.aktiv=true";
			
			$sql = "SELECT 
						tJhb.jhb,
						tBuchung.resyBuchungsNr,
						tKunde.organisation,
						CONCAT(tAnsprechperson.nachname,' ',tAnsprechperson.vorname) AS Ansprechperson,
						tPackage.packagename,
						tBuchung.terminAnreise,
						tBuchung.buchungsStatus,
						tBuchung.kinder,
						tBuchung.erwachsene,
						tBuchung.kinder + tBuchung.erwachsene AS Gesamt
					FROM
						tJhb INNER JOIN tJhb_Package ON
						tJhb.ID_Jhb = tJhb_Package.ID_Jhb
						INNER JOIN tPackage ON
						tJhb_Package.ID_Package = tPackage.ID_Package
						INNER JOIN tBuchung ON
						tPackage.ID_Package = tBuchung.ID_Package
						INNER JOIN tAnsprechperson ON
						tBuchung.ID_Ansprechperson = tAnsprechperson.ID_Ansprechperson
						INNER JOIN tKunde ON
						tAnsprechperson.ID_Kunde = tKunde.ID_Kunde
					WHERE	
						tJhb.ID_Jhb='".$JHB."' AND tBuchung.terminAnreise BETWEEN '".$AnfangsDatum."' AND '".$EndDatum."' ORDER BY tBuchung.terminAnreise ASC;";
			
			//$sql_anzahl = "select count(*) as anzahl from tLeistung where tLeistung.aktiv = true;";
			//Abschicken an die Datenbank
			
			//echo $sql;
			$ergebnis = $db->query($sql);
			$zeilen = $db->affected_rows();

			//alle Zeilen der SQL-SELECT Anweisung nacheinander in ein Array fetchen
			while($zeile = $ergebnis->fetch_object()){ 
				$arr[] = $zeile; }
			//das $arr-Array in das JSON-Format konvertieren
				$data = json_encode($arr);
			
			//select-count ist möglicherweise langsam... Alternative?
			//Link zum Thema: http://www.sqlhacks.com/index.php/Optimize/Fast_Count	
			//$ergebnis_anzahl = $db->query($sql_anzahl);
			//$anzahl = $ergebnis_anzahl->fetch_object()->anzahl;
					
				//Aufbereiten des Responses
			if($zeilen == 0) $response->write('({"total":"0","results":[]})');
			else $response->write('({"total":"' . $zeilen . '","results":' . $data . '})');  
			
			//4. Alles was geöffnet bzw. instanziiert wurde, wird auch wieder
			//geschlossen bzw. zerstört.
			$ergebnis->free();
			//$ergebnis_anzahl->free();
		
		} else $response->write("{success:false}");
		
	}
 }