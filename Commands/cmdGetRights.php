<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdGetRights implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();
	
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
			$response->write('({"total":"1","results":[{
			"ID_User":"'.$_SESSION['ID_User'].'",
			"email":"'.$_SESSION['valid_user'].'",
			"username":"'.$_SESSION['username'].'",
			"right_user":'.$_SESSION['right_user'].',
			"right_anfrage":'.$_SESSION['right_anfrage'].',
			"right_buchung":'.$_SESSION['right_buchung'].',
			"right_leistung":'.$_SESSION['right_leistung'].',
			"right_package":'.$_SESSION['right_package'].',
			"right_partner":'.$_SESSION['right_partner'].',
			"right_auswertungen":'.$_SESSION['right_auswertungen'].',
			"right_kunde":"'.$_SESSION['right_kunde'].'",
			"right_jugendherbergen":'.$_SESSION['right_jugendherbergen'].'}]})');
		}
	}
 }