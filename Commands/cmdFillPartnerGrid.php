<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdFillPartnerGrid implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();

		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {

			//Werte für Paging
			$start = (integer)$request->getParameter('start');
			$limit = (integer) $request->getParameter('limit');
		
			//Variable Suchen brauchen wir, weil wir diese Funktion auch zum Suchen in der Grid benützen wollen!
			//dieser Wert wird als zusätzliches Kriterium in den SQL-String eingebunden.
			$suchen = " (tPartner.nachname LIKE '%".$request->getParameter('suchen')."%' or tPartner.firmenname LIKE '%".$request->getParameter('suchen')."%' or tPartner.plz LIKE '%".$request->getParameter('suchen')."%') AND tPartner.aktiv=true";
			
			$sql = "select tPartner.ID_Partner,tPartner.firmenname,tPartner.vorname,tPartner.nachname,tPartner.adresse,tPartner.plz,tPartner.ort,
					tPartner.tel,tPartner.email,CONCAT(tUser.vorname,' ',tUser.nachname) as username, tPartner.letzteBearbeitung
					from tPartner left join tUser 
					ON tPartner.ID_User = tUser.ID_User where".$suchen." limit $start,$limit";
			$sql_anzahl = "select count(*) as anzahl from tPartner where tPartner.aktiv = true;";
			
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
			
			//Alles was geöffnet bzw. instanziiert wurde, wird auch wieder
			//geschlossen bzw. zerstört.
			$ergebnis->free();
			$ergebnis_anzahl->free();
		
		} else $response->write("{success:false}");
	}
 }