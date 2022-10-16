<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdGetMergeSuggestions implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {

		//make db-connection
	 	$db = new DbConnection();
		
		//Werte für Paging
		$start = (integer) $request->getParameter('start');
		$limit = (integer) $request->getParameter('limit');
		$alle = $request->getParameter('alle');

		$plz = $request->getParameter('plz');
		if ($plz == "")	$plz = 'null';

		$name = $request->getParameter('name');
		if ($name == "") $name = 'null';
		$name = substr($name,0,4);
			
		$resykd = $request->getParameter('resykd');
		if($resykd=="") $resykd = 'null';
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
			if($alle == 'true') {
				$sql = "select ID_Kunde,kategoriek,organisation,adresse,plz from tKunde WHERE aktiv = true limit $start,$limit";
			} 
			else {
				$sql = "select ID_Kunde,kategoriek,organisation,adresse,plz from tKunde WHERE (resykd = '$resykd' OR plz = '$plz' OR organisation LIKE '%$name%') AND aktiv = true limit $start,$limit";
			}
			$ergebnis = $db->query($sql);
			$zeilen = $db->affected_rows();
			
			if($alle == 'true') {
				$sql_anzahl = "select count(*) as anzahl from tKunde WHERE aktiv = true";
			} else {
				$sql_anzahl = "select count(*) as anzahl from tKunde WHERE (resykd = '$resykd' OR plz = '$plz' OR organisation LIKE '%$name%') AND aktiv = true";
			}
			//select-count ist möglicherweise langsam... Alternative?
			//Link zum Thema: http://www.sqlhacks.com/index.php/Optimize/Fast_Count	
			
			$ergebnis_anzahl = $db->query($sql_anzahl);
			$anzahl = $ergebnis_anzahl->fetch_object()->anzahl;
	
			while($zeile = $ergebnis->fetch_object()){
				$arr[] = $zeile;
			}
			$data = json_encode($arr);
			$response->write('({"total":"' . $anzahl . '","results":' . $data . '})');
		
		} else $response->write("{success:false}");
	}
 }