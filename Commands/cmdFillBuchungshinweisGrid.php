<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdFillBuchungshinweisGrid implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {

		$ID_Buchung = (integer)$request->getParameter('ID_Buchung');
		
		$sql = "select tBuchungsinfo.ID_Buchungsinfo, tBuchungsinfo.infoDatum, tBuchungsinfo.infotext, CONCAT(tUser.vorname,' ',tUser.nachname) as user from tBuchungsinfo inner join tUser on (tBuchungsinfo.ID_User = tUser.ID_User) where tBuchungsinfo.ID_Buchung = $ID_Buchung";
		

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