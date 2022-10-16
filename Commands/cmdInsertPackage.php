<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdInsertPackage implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
		
			$packagename = $db->real_escape_string($request->getParameter('packagename'));
			$pdfPfad = $db->real_escape_string($request->getParameter('pdfPfad'));
			$ID_User = $_SESSION['ID_User'];
			$letzteBearbeitung = date("Y-m-d");
			
			//Zusammenbau für das Stored Prcedures
			$SQL = "CALL procInsertPackage('$packagename', '$pdfPfad','".$ID_User[0]."', '$letzteBearbeitung')";
			
			//Einfügen in die Tabelle
			$db->query($SQL);
			
			//die beeinflussten Zeilen checken um festzustellen ob Erfolg oder Misserfolg.
			$zeilen = $db->affected_rows();

			if($zeilen > 0) $response->write("{success:true}");
			else $response->write("{success:false}");
			
		} else $response->write("{success:false}");
	}
 }