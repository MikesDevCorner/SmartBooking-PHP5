<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdLogout implements ICommand {
	//Vernichtet die Session und setzt alle angelegten Session-Variablen (valid_user, rights) auf null.
	public function execute(IRequest $request, IResponse $response) {
		//Zerstören aller Session-Variablen:
		$_SESSION = array();
		//Zersötren der Session-Cookies:
		if(ini_get("session.use_cookies")) {
			$params = session_get_cookie_params();
			setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
		}
		//Zerstören der Session:
		session_destroy();
		//Rückmeldung ob alles erledigt:
		$response->write("{success:true}");
	}
 }