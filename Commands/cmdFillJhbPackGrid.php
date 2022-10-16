<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdFillJhbPackGrid implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		$JHB_ID = $request->getParameter('ID_Jhb');
		
		//make db-connection
	 	$db = new DbConnection();

		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {

			$sql = "select tPackage.ID_Package, tPackage.packagename FROM 
			tPackage inner join tJhb_Package on tPackage.ID_Package = tJhb_Package.ID_Package WHERE ID_Jhb = $JHB_ID ORDER BY packagename ASC";
			
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
			else $response->write('({"total":"' . $anzahl . '","results":' . $data . '})');  
			
			//4. Alles was geöffnet bzw. instanziiert wurde, wird auch wieder
			//geschlossen bzw. zerstört.
			$ergebnis->free();
		
		} else $response->write("{success:false}");
	}
 }