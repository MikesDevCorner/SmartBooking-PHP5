<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdUpdatePackLeistung implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {

			$table = $request->getParameter('table');
			$key1 = $request->getParameter('key1');
			$key2 = $request->getParameter('key2');
			$id1 = (integer)$db->real_escape_string($request->getParameter('keyID1'));
			$id2 = (integer)$db->real_escape_string($request->getParameter('keyID2'));
			$field = $request->getParameter('field');
			$value = $db->real_escape_string($request->getParameter('value'));		
			
			//Der tatsächliche Update der DB mit den neuen Werten.
			$db->query ('UPDATE '.$table.' SET '.$field.'= \''.$value.'\' WHERE '.$key1.'='.$id1. ' AND '. $key2.'='.$id2);
						
			$rows = $db->affected_rows();
	
			if($rows > 0) $response->write("{success:true}");
			else $response->write("{success:false}");
		
		} else $response->write("{success:false}");
	}
 }