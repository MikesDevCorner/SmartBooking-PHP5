<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdUpdateUser implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();
		
		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {

			//DIESES COMMAND STELLT DIE ÄNDERUNG DER MAILADRESSE SOWIE DIE ÄNDERUNG DES PASSWORTES
			//FÜR DEN USER ZUR VERFÜGUNG. ZUERST WIRD ABER MIT PASSWORTABFRAGE GEPRÜFT, OB DER USER AUCH
			//BERECHTIGT IST, ÄNDERUNGEN VORZUNEHMEN
	
			//welcher User ist momentan als valider User angemeldet...
			$userid = $_SESSION['ID_User'];
			//das Passwort aus der DB besorgen und mit dem eingegebenen Passwort abgleichen
			$pwdcheck = $db->query('SELECT passwort from tUser WHERE ID_User ='.$userid)->fetch_object();
			if(md5($request->getParameter('pwd')) == $pwdcheck->passwort) 
			{
				$field = $request->getParameter('field');
				$value = $db->real_escape_string($request->getParameter('value'));
				
				if ($request->issetParameter('newPwd'))  {
					$value = md5($value);
				} else $mailinsession = true;
				
				//Der tatsächliche Update der DB mit den neuen Werten.
				//echo 'UPDATE tUser SET `'.$field.'`= \''.$value.'\' WHERE ID_User ='.$userid;
				$db->query('UPDATE tUser SET `'.$field.'`= \''.$value.'\' WHERE ID_User ='.$userid);
				$rows = $db->affected_rows();
						
				if($mailinsession == true) {
					$_SESSION['valid_user'] = $value;
				}
				
				if($rows > 0) $response->write("{success:true}");
				else $response->write("{success:false, pwd:true}");
			} else $response->write("{success:false,pwd:false}");
			
		
		} else $response->write("{success:false}");
	}
 }