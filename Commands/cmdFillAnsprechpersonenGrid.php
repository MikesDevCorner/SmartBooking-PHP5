<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdFillAnsprechpersonenGrid implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();

		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {

		
			$ID_Kunde= (integer) $request->getParameter('ID_Kunde');
			
			$sql = "select ID_Ansprechperson,ID_Kunde,nachname,vorname,telefon,email,aktiv,
					bemerkung, letzteBearbeitung from tAnsprechperson where (ID_Kunde = $ID_Kunde AND aktiv=true)";
			$sql_anzahl = "select count(*) as anzahl from tAnsprechperson where (ID_Kunde = $ID_Kunde AND tAnsprechperson.aktiv = true)";
			
			
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
		
	}
 }