<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdInsertPartner implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
	
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
		
			//Befüllen der benötigten Variablen für den Insert
			$ID_Partner = (integer) $request->getParameter('ID_Partner');
			$firmenname = $db->real_escape_string($request->getParameter('firmenname'));
			$vorname = $db->real_escape_string($request->getParameter('vorname'));
			$nachname = $db->real_escape_string($request->getParameter('nachname'));
			$adresse = $db->real_escape_string($request->getParameter('adresse'));
			$plz = $db->real_escape_string($request->getParameter('plz'));
			$ort = $db->real_escape_string($request->getParameter('ort'));
			$tel = $db->real_escape_string($request->getParameter('tel'));
			$email = $db->real_escape_string($request->getParameter('email'));
			
			$ID_User = $_SESSION['ID_User'];
			$letzteBearbeitung = date("Y-m-d");
			
			//Zusammenbauen des SQL-Statements (Stored Prozedure)
			$SQL = "CALL procInsertPartner('$ID_Partner', '$firmenname', '$vorname', '$nachname', ";
			$SQL .= "'$adresse', '$plz', '$ort', '$tel', '$email', '".$ID_User[0]."','$letzteBearbeitung')";
			
			//abfeuern des SQL-Strings mittels mysql_query	
			$db->query($SQL);
			
			//die beeinflussten Zeilen checken um festzustellen ob Erfolg oder Misserfolg.
			$zeilen = $db->affected_rows();

			if($zeilen > 0) $response->write("{success:true}");
			else $response->write("{success:false}");
			
		} else $response->write("{success:false}");
	}
 }