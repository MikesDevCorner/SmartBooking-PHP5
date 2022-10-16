<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdInsertJhbPack implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
	
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
		
			$id_jhb = $db->real_escape_string($request->getParameter('ID_Jhb'));
			$id_package = $db->real_escape_string($request->getParameter('ID_Package'));
			
			
			//Zusammenbau für das Stored Prcedures
			$SQL = "CALL procInsertJHBPack('$id_jhb', '$id_package')";

			//Einfügen in die Tabelle
			$db->query($SQL);
			
			//die beeinflussten Zeilen checken um festzustellen ob Erfolg oder Misserfolg.
			$zeilen = $db->affected_rows();

			if($zeilen > 0) $response->write("{success:true}");
			else $response->write("{success:false}");
			
		} else $response->write("{success:false}");
	}
 }