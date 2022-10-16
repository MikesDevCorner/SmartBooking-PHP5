<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdInsertLeistung implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();
		
			//check if user has permissions to proceed
			$user = new SecurityObject();
			if ($user->checkCredentials($db, $request)== true) {
				
				$Leistung = $request->getParameter('Leistung');
				$StandardUhrzeit = $request->getParameter('StandardUhrzeit');
				$LeistungsBemerkung = $db->real_escape_string($request->getParameter('LeistungsBemerkung'));
				$ID_Partner = (integer) $request->getParameter('ID_Partner');

				//Zusammenbauen des SQL-Statements (Stored Prozedure)
				$SQL = "CALL procInsertLeistung('$Leistung', '$StandardUhrzeit', '$LeistungsBemerkung', ";
				$SQL .= "'$ID_Partner')";
				
				//abfeuern des SQL-Strings mittels mysql_query	
				$db->query($SQL);
				
				//die beeinflussten Zeilen checken um festzustellen ob Erfolg oder Misserfolg.
				$zeilen = $db->affected_rows();

				if($zeilen > 0) 
					$response->write("{success:true}");
				else 
					$response->write("{success:false}");
			} else $response->write("{success:false}");
		
	}
 }