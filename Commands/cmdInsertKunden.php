<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdInsertKunden implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {

			$kategorie = $request->getParameter('kategorie');
			$organisation = $request->getParameter('organisation');
			$adresse = $db->real_escape_string($request->getParameter('adresse'));
			$plz = $db->real_escape_string($request->getParameter('plz'));
			$ort = $db->real_escape_string($request->getParameter('ort'));
			$telefon = $db->real_escape_string($request->getParameter('telefon'));
			$fax = $db->real_escape_string($request->getParameter('fax'));
			$email = $db->real_escape_string($request->getParameter('email'));
			$resykd = $db->real_escape_string($request->getParameter('resykd'));
			$bemerkung = $db->real_escape_string($request->getParameter('bemerkung'));
			//die IP-Adresse des anlegenden Hosts wird durch eine PHP-Funktion ermittelt...
			$ipadr = $_SERVER['REMOTE_ADDR'];
			
			$ID_User = $_SESSION['ID_User'];
			$letzteBearbeitung = date("Y-m-d");
			$bemerkung = $db->real_escape_string($request->getParameter('bemerkung'));
			$erstelltAm = date("Y-m-d");

			//Zusammenbauen des SQL-Statements (Stored Prozedure)
			$SQL = "CALL procInsertKunde('$kategorie', '$organisation', '$adresse', '$plz', ";
			$SQL .= "'$ort', '$telefon', '$fax', '$email', '$resykd', ";
			$SQL .= "'$bemerkung', '".$ID_User[0]."','$letzteBearbeitung', '$erstelltAm')";
			
			//abfeuern des SQL-Strings mittels mysql_query	
			$db->query($SQL);
			//die beeinflussten Zeilen checken um festzustellen ob Erfolg oder Misserfolg.
			$zeilen = $db->affected_rows();

			if($zeilen > 0) {
				$neueID = $db->query("SELECT LAST_INSERT_ID() as neueID")->fetch_object()->neueID;
				$response->write("{success:true, neueID:$neueID}");
			}
			else 
				$response->write("{success:false}");
		} else $response->write("{success:false}");
	}
 }