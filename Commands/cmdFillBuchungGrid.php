<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdFillBuchungGrid implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
			
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
			if($user->checkRight('right_buchung')) {

				//Werte für Paging
				$start = (integer) $request->getParameter('start');
				$limit = (integer) $request->getParameter('limit');
			
				$filter = $request->getParameter('filter');
				$comboFilter = $request->getParameter('comboFilter');
				
				if($filter=='true') {
					//Variable Suchen brauchen wir, weil wir diese Funktion auch zum Suchen in der Grid benützen wollen!
					//dieser Wert wird als zusätzliches Kriterium in den SQL-String eingebunden.
					$suchen = " (resyBuchungsNr LIKE '%".$request->getParameter('suchen')."%' 
							or tAnsprechperson.vorname LIKE '%".$request->getParameter('suchen')."%'
							or tAnsprechperson.nachname LIKE '%".$request->getParameter('suchen')."%'
							or tKunde.organisation LIKE '%".$request->getParameter('suchen')."%'
							or tPackage.packagename LIKE '%".$request->getParameter('suchen')."%'
							AND tBuchung.aktiv=true) AND tBuchung.buchungsStatus = '$comboFilter' ";
					
					$sql = "select tBuchung.ID_Buchung,tBuchung.resyBuchungsNr,tKunde.organisation as Organisation,CONCAT(tAnsprechperson.vorname,' ',tAnsprechperson.nachname) as Ansprechperson, 
							tPackage.packagename, tBuchung.terminAnreise,tBuchung.ersatzTerminAnreise,tBuchung.kinder,tBuchung.erwachsene,tBuchung.female,tBuchung.male,tBuchung.vegetarier,
							tBuchung.relVorschriften,tBuchung.allergien,CONCAT(tUser.vorname,' ',tUser.nachname) as username,tBuchung.letzteBearbeitung,tBuchung.erstelltAm,tBuchung.buchungsStatus, tBuchung.ID_Package
							from tPackage right join ((tAnsprechperson left join tKunde ON tAnsprechperson.ID_Kunde = tKunde.ID_Kunde) right join
							(tBuchung left join tUser ON tBuchung.ID_User = tUser.ID_User) ON tAnsprechperson.ID_Ansprechperson = tBuchung.ID_Ansprechperson)
							ON tPackage.ID_Package = tBuchung.ID_Package where".$suchen." ORDER BY tBuchung.ID_Buchung DESC limit $start,$limit";
					$sql_anzahl = "select count(*) as anzahl from tBuchung where tBuchung.aktiv = true AND tBuchung.buchungsStatus = '$comboFilter'";
				} else {
					//Variable Suchen brauchen wir, weil wir diese Funktion auch zum Suchen in der Grid benützen wollen!
					//dieser Wert wird als zusätzliches Kriterium in den SQL-String eingebunden.
					$suchen = " (resyBuchungsNr LIKE '%".$request->getParameter('suchen')."%' 
							or tAnsprechperson.vorname LIKE '%".$request->getParameter('suchen')."%'
							or tAnsprechperson.nachname LIKE '%".$request->getParameter('suchen')."%'
							or tKunde.organisation LIKE '%".$request->getParameter('suchen')."%'
							or tPackage.packagename LIKE '%".$request->getParameter('suchen')."%'
							AND tBuchung.aktiv=true)";
					
					$sql = "select tBuchung.ID_Buchung,tBuchung.resyBuchungsNr,tKunde.organisation as Organisation,CONCAT(tAnsprechperson.vorname,' ',tAnsprechperson.nachname) as Ansprechperson, 
							tPackage.packagename, tBuchung.terminAnreise,tBuchung.ersatzTerminAnreise,tBuchung.kinder,tBuchung.erwachsene,tBuchung.female,tBuchung.male,tBuchung.vegetarier,
							tBuchung.relVorschriften,tBuchung.allergien,CONCAT(tUser.vorname,' ',tUser.nachname) as username,tBuchung.letzteBearbeitung,tBuchung.erstelltAm,tBuchung.buchungsStatus, tBuchung.ID_Package
							from tPackage right join ((tAnsprechperson left join tKunde ON tAnsprechperson.ID_Kunde = tKunde.ID_Kunde) right join
							(tBuchung left join tUser ON tBuchung.ID_User = tUser.ID_User) ON tAnsprechperson.ID_Ansprechperson = tBuchung.ID_Ansprechperson)
							ON tPackage.ID_Package = tBuchung.ID_Package where".$suchen." ORDER BY tBuchung.ID_Buchung DESC limit $start,$limit";
					$sql_anzahl = "select count(*) as anzahl from tBuchung where tBuchung.aktiv = true;";
				}
				
				//Abschicken an die Datenbank
				$ergebnis = $db->query($sql);
				$zeilen = $db->affected_rows();

				//alle Zeilen der SQL-SELECT Anweisung nacheinander in ein Array fetchen
				while($zeile = $ergebnis->fetch_object()){ 
				$arr[] = $zeile; }
				//das $arr-Array in das JSON-Format konvertieren
				$data = json_encode($arr);
				
				//select-count ist möglicherweise langsam... Alternative?
				//Link zum Thema: http://www.sqlhacks.com/index.php/Optimize/Fast_Count	
				$ergebnis_anzahl = $db->query($sql_anzahl);
				$anzahl = $ergebnis_anzahl->fetch_object()->anzahl;
						
				//Aufbereiten des Responses
				if($zeilen == 0) $response->write('({"total":"0","results":[]})');
				else $response->write('({"total":"' . $anzahl . '","results":' . $data . '})');  
				
				//4. Alles was geöffnet bzw. instanziiert wurde, wird auch wieder
				//geschlossen bzw. zerstört.
				$ergebnis->free();
				$ergebnis_anzahl->free();
			} else $response->write("{success:false}");
		} else $response->write("{success:false}");
	}
 }