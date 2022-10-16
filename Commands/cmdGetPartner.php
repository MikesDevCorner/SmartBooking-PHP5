<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdGetPartner implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();

		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {

			$sql = "select ID_Partner, firmenname from tPartner WHERE aktiv = true ORDER BY firmenname ASC";
			$ergebnis = $db->query($sql);
			$zeilen = $db->affected_rows();
	
			while($zeile = $ergebnis->fetch_object()){
				$arr[] = $zeile;
			}
			$data = json_encode($arr);
			$response->write('({"total":"' . $zeilen . '","results":' . $data . '})');
		
		} else $response->write("{success:false}");

	}
 }