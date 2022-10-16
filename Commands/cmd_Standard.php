<?php
 include_once("Interfaces/ICommand.php");

 class cmd_Standard implements ICommand {

	private $version="1.0 Stable";
	private $title="Smart Booking";

	public function execute(IRequest $request, IResponse $response) {
	//Der Standard-Command ist der Command, der als erstes vom FrontController aufgerufen wird
	//und entscheidet, welche weiteren Schritte passieren sollen.
	//Entweder es wird die Application gestartet, falls noch keine Server-Session besteht wird der Login für
	//diese Applikation, oder es wird ein Frontend für die Reservierung auf der Homepage generiert,
	//oder es wird ein Fehler ausgegeben.


		//Wir definieren den Seitenaufruf als "nicht-ajax" Aufruf, damit wir in der Fehlerbehandlung 
		//mitbekommen, ob es ein Ajax oder Nicht-Ajax Seitenaufruf war.
		//so ist es viel einfacher, als jedem Ajax-Aufruf ein Attribut ajax zu schenken.
		$request->setParameter('nonajax', true);

		//make db-connection and user-security
	 	$db = new DbConnection();
		$user = new SecurityObject();
		
		if(isset($_GET['frontend'])) {
			$this->Frontend($response);
		} else{
			if ($user->checkCredentials($db, $request)==true) {
				$this->Application($response);
			} else {
				if($request->issetParameter('user_email') && $request->issetParameter('passwort')) {
					$text = "Leider stimmen Ihre Anmeldeinformationen nicht mit unserer Datenbank überein. Bitte versuchen Sie es erneut!";
				} else {
					$text = 'Willkommen beim Admin-Backend von Smart-Booking, eine Anwendung der NÖ-Jugendherbergswerke! Bitte loggen Sie sich ein um fortzufahren...';
				}
				$this->LoginForm($text, $response, $request);
			}
		}
	}




	private function Application($response) {
		$view = new TemplateView('Application');
		$view->assign('version',$this->version);
		$view->assign('title',$this->title);
		$view->render($response);
	}


	private function Frontend($response) {
		$view = new TemplateView('Frontend');
		$view->assign('version',$this->version);
		$view->assign('title',$this->title);
		$view->render($response);
	}


	private function LoginForm($message, $response, $request) { 
		$view = new TemplateView('LoginForm');
		$view->assign('message',$message);
		$view->assign('version',$this->version);
		$view->assign('title',$this->title);
		$view->render($response);
	}
 }