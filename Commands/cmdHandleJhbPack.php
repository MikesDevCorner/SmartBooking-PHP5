<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdHandleJhbPack implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {

		//make db-connection
	 	$db = new DbConnection();

		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
		
			$id_jhb = $db->real_escape_string($request->getParameter('ID_Jhb'));
			$id_package = $db->real_escape_string($request->getParameter('ID_Package'));
			$oldText = $db->real_escape_string($request->getParameter('oldText'));
			$oldValue = $db->real_escape_string($request->getParameter('oldValue'));
		
			if($request->issetParameter('remove')) {
			
				$SQL = "DELETE FROM tJhb_Package WHERE (ID_Package = $id_package AND ID_Jhb = $id_jhb)";
				$db->query($SQL);
				$response->write("{success:true}");
				
			} else {
			
				if($oldText == 'neues Package') {
					//Wenn es ein neues Package ist, muss es erst in der Tabelle angelegt werden!!
					$SQL = "CALL procInsertJHBPack('$id_jhb', '$id_package')";
				} else {
					//Wenn es aber KEIN neues Package ist, muss der betreffende Datensatz nur upgedatet werden!s
					$SQL = "UPDATE tJhb_Package SET ID_Package = $id_package WHERE (ID_Package = $oldValue AND ID_Jhb = $id_jhb)";
				}

				//Einfügen in die Tabelle
				$db->query($SQL);
				
				//die beeinflussten Zeilen checken um festzustellen ob Erfolg oder Misserfolg.
				$zeilen = $db->affected_rows();
				if($zeilen > 0) $response->write("{success:true}");
				else $response->write("{success:false}");
			}
		} else $response->write("{success:false}");
	}
 }