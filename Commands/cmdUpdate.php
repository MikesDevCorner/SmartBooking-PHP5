<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdUpdate implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {

		//make db-connection
	 	$db = new DbConnection();
	
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {

			$table = $request->getParameter('table');
			$key = $request->getParameter('key');
			$id = (integer)$db->real_escape_string($request->getParameter('keyID'));
			$field = $request->getParameter('field');
			$value = $db->real_escape_string($request->getParameter('value'));		
			$now = date("Y-m-d");
	
			//welcher User ist momentan als valider User angemeldet...
			$userid = $_SESSION['ID_User'];
			//Der tatsächliche Update der DB mit den neuen Werten.
			if(is_string($request->getParameter('value'))AND $value != 'true' AND $value != 'false') {
				$db->query('UPDATE '.$table.' SET '.$field.'= \''.$value.'\' WHERE '.$key.'='.$id);
			}
			else {
				$db->query('UPDATE '.$table.' SET '.$field.'= '.$value.' WHERE '.$key.'='.$id);
			}
		
			$rows = $db->affected_rows();
	
			if($rows > 0) {
				//ID des angemeldeten Users und das aktuelle Datum zu diesem Datensatz dazuspeichern.
				if ($table == "tAnsprechperson" || $table == "tKunde" || $table == "tAnfrage" || $table == "tPackage" || $table == "tPartner" || $table == "tBuchung") {
					$db->query("UPDATE ".$table." SET ID_User = $userid WHERE ".$key.' = '.$id);
					$db->query("UPDATE ".$table.' SET letzteBearbeitung = \''.$now.'\' WHERE '.$key.' = '.$id);
					$response->write("{success:true}");
				} else {
					$response->write("{success:true}");
				}
			} else throw new DBSQLException('Kein Datensatz wurde upgedated. Bitte prüfen Sie den SQL-Ausdruck!');
		
		} else $response->write("{success:false}");
	}
 }