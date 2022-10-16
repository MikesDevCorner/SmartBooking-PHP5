<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdFillPackLeistungGrid implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
			
			$PACK_ID = $request->getParameter('ID_Package');
		
			$sql = "SELECT 	tPackageleistung.ID_Leistung,
							tLeistung.Leistung,
							tPackageleistung.leistungstag,
							tLeistung.StandardUhrzeit
					FROM
							tPackageleistung inner join tLeistung
							on tPackageleistung.ID_Leistung = tLeistung.ID_Leistung

					WHERE tPackageleistung.ID_Package = $PACK_ID ORDER BY leistungstag ASC";
			
		
			//Abschicken an die Datenbank
			$ergebnis = $db->query($sql);
			$zeilen = $db->affected_rows();

			//alle Zeilen der SQL-SELECT Anweisung nacheinander in ein Array fetchen
			while($zeile = $ergebnis->fetch_object()){ 
				$arr[] = $zeile; 
			}
			
			//das $arr-Array in das JSON-Format konvertieren
			$data = json_encode($arr);
					
			//Aufbereiten des Responses
			if($zeilen == 0) $response->write('({"total":"0","results":[]})');
			else $response->write('({"total":"' . $zeilen . '","results":' . $data . '})');  
			
			//4. Alles was geöffnet bzw. instanziiert wurde, wird auch wieder
			//geschlossen bzw. zerstört.
			$ergebnis->free();
		
		} else $response->write("{success:false}");
	}
 }