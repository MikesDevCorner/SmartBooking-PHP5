<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdHandlePackLeistung implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();

		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
		
			$id_package = $db->real_escape_string($request->getParameter('ID_Package'));
			$id_leistung = $db->real_escape_string($request->getParameter('ID_Leistung'));
			$leistungsTag = $db->real_escape_string($request->getParameter('leistungstag'));
			$oldText = $db->real_escape_string($request->getParameter('oldText'));
			$oldValue = $db->real_escape_string($request->getParameter('oldValue'));
		
			if($request->issetParameter('remove')) {
			
				$SQL = "DELETE FROM tPackageleistung WHERE (ID_Package = $id_package AND ID_Leistung = $id_leistung)";
				$db->query($SQL);
				$response->write("{success:true}");
				
			} else {
			
				if($oldText == 'neue Leistung') {
					//Wenn es eine neue Leistung ist, muss es erst in der Tabelle angelegt werden!!
					$SQL = "CALL procInsertPackLeistung('$id_package', '$id_leistung')";
				} else {
					//Wenn es aber KEINE neue Leistung ist, muss der betreffende Datensatz nur upgedatet werden!s
					$SQL = "UPDATE tPackageleistung SET ID_Leistung = $id_leistung WHERE (ID_Leistung = $oldValue AND ID_Package = $id_package)";
					
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