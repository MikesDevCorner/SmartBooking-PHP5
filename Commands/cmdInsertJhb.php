<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdInsertJhb implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
			
			$jhb = $db->real_escape_string($request->getParameter('jhb'));
			$adresse = $db->real_escape_string($request->getParameter('adresse'));
			$plz = $db->real_escape_string($request->getParameter('plz'));
			$ort = $db->real_escape_string($request->getParameter('ort'));
			
			//Zusammenbau für das Stored Prcedures
			$SQL = "CALL procInsertJHB('$jhb', '$adresse', '$plz','$ort')";

			//Einfügen in die Tabelle
			$db->query($SQL);
			
			//die beeinflussten Zeilen checken um festzustellen ob Erfolg oder Misserfolg.
			$zeilen = $db->affected_rows();

			if($zeilen > 0) $response->write("{success:true}");
			else $response->write("{success:false}");
			
		} else $response->write("{success:false}");
	}
 }