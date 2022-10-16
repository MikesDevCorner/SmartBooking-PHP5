<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdGetJhb implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();

		$sql = "select ID_Jhb, jhb from tJhb WHERE aktiv = true ORDER BY jhb ASC";
		
		$ergebnis = $db->query($sql);
		$zeilen = $db->affected_rows();

		while($zeile = $ergebnis->fetch_object()){
			$arr[] = $zeile;
		}
		$data = json_encode($arr);
		
		$response->write('({"total":"' . $zeilen . '","results":' . $data . '})');
	}
 }