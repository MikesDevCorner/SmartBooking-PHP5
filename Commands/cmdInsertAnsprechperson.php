<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdInsertAnsprechperson implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {

			$ID_Kunde = $request->getParameter('ID_Kunde');
			$nachname = $db->real_escape_string($request->getParameter('nachname'));
			$vorname = $db->real_escape_string($request->getParameter('vorname'));
			$telefon = $db->real_escape_string($request->getParameter('telefon'));
			$email = $db->real_escape_string($request->getParameter('email'));
			$bemerkung = $db->real_escape_string($request->getParameter('bemerkung'));
			
			$ID_User = $_SESSION['ID_User'];
			$letzteBearbeitung = date("Y-m-d");

			//Zusammenbauen des SQL-Statements (Stored Prozedure)
			$SQL = "CALL procInsertAnsprechperson('$ID_Kunde', '$nachname', '$vorname', '$telefon', ";
			$SQL .= "'$email', '$ID_User', '$letzteBearbeitung', '$bemerkung')";

			//abfeuern des SQL-Strings mittels mysql_query	
			$db->query($SQL);
			//die beeinflussten Zeilen checken um festzustellen ob Erfolg oder Misserfolg.
			$zeilen = $db->affected_rows();

			if($zeilen > 0) {
				//Auf diesem Wege können wir die ID des neu eingefügten Datensatzes ermitteln und an die Client-Applikation zur weiteren Verarbeitung übermitteln.
				$neueAnsprechperson = $db->query("SELECT LAST_INSERT_ID() as neueAnsprechperson")->fetch_object()->neueAnsprechperson;
				$response->write("{success:true, neueAnsprechperson:$neueAnsprechperson}");
			}
			else 
				$response->write("{success:false}");
		} else $response->write("{success:false}");
	}
 }