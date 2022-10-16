<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdFillTimetableGrid implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {

		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {

			$id_buchung = $request->getParameter('ID_Buchung');
			$sql = "SELECT tLeistungszeitpunkt.ID_LeistungsZeitpunkt, tLeistungszeitpunkt.ID_Buchung, tLeistung.Leistung, 
			tLeistungszeitpunkt.EchtUhrzeit, tLeistungszeitpunkt.EchtDatum FROM tLeistungszeitpunkt INNER JOIN tLeistung
			ON (tLeistungszeitpunkt.ID_Leistung = tLeistung.ID_Leistung) WHERE ID_Buchung = $id_buchung";
			
			//Abschicken an die Datenbank
			$ergebnis = $db->query($sql);
			$zeilen = $db->affected_rows();

			//alle Zeilen der SQL-SELECT Anweisung nacheinander in ein Array fetchen
			while($zeile = $ergebnis->fetch_object()) {
				$arr[] = $zeile; 
			}
			
			//das $arr-Array in das JSON-Format konvertieren
			$data = json_encode($arr);

			//Aufbereiten des Responses
			if($zeilen == 0) $response->write('({"total":"0","results":[]})');
			else $response->write('({"total":"' . $anzahl . '","results":' . $data . '})');  
			
			//4. Alles was geöffnet bzw. instanziiert wurde, wird auch wieder
			//geschlossen bzw. zerstört.
			$ergebnis->free();
			
		} else $response->write("{success:false}");
	}
 }