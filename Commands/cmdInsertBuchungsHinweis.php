<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdInsertBuchungsHinweis implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
	
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
		
			//Befüllen der benötigten Variablen für den Insert
			$ID_Buchung = (integer) $request->getParameter('ID_Buchung');
			$infodatum = date("Y-m-d");
			$infotext = $db->real_escape_string($request->getParameter('infotext'));
			$ID_User = $_SESSION['ID_User'];
			
			
			//Zusammenbauen des SQL-Statements (Stored Prozedure)
			$SQL = "CALL procInsertBuchungsHinweis('$ID_Buchung', '$infodatum', '$infotext', '$ID_User')";
			
			//abfeuern des SQL-Strings mittels mysql_query	
			$db->query($SQL);
			
			//die beeinflussten Zeilen checken um festzustellen ob Erfolg oder Misserfolg.
			$zeilen = $db->affected_rows();

			if($zeilen > 0) $response->write("{success:true}");
			else $response->write("{success:false}");
			
		} else $response->write("{success:false}");
	}
 }