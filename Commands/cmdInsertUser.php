<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdInsertUser implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
	
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
			
			$adresse = $db->real_escape_string($request->getParameter('adresse'));
			$email = $db->real_escape_string($request->getParameter('email'));
			$nachname = $db->real_escape_string($request->getParameter('nachname'));
			$vorname = $db->real_escape_string($request->getParameter('vorname'));
			$ort = $db->real_escape_string($request->getParameter('ort'));
			$plz = $db->real_escape_string($request->getParameter('plz'));
			
			//Zusammenbauen des SQL-Statements (Stored Prozedure)
			$SQL = "CALL procInsertUser('$adresse', '$email', '$nachname', '$vorname','$ort', '$plz', md5('init'))";
			
			//abfeuern des SQL-Strings mittels mysql_query	
			$db->query($SQL);
			
			//die beeinflussten Zeilen checken um festzustellen ob Erfolg oder Misserfolg.
			$zeilen = $db->affected_rows();

			if($zeilen > 0) $response->write("{success:true}");
			else $response->write("{success:false}");
			
		} else $response->write("{success:false}");
	}
 }