<?php
 include_once("Interfaces/ICommand.php");
 include("Classes/PHPMailer/class.phpmailer.php");
 
 class cmdMail implements ICommand {

	public function execute(IRequest $request, IResponse $response) {

		//make db-connection
	 	$db = new DbConnection();

		//check if user has permissions to proceed
		//$user = new SecurityObject();

		//MAILVERSAND WIRD NICHT ÜBER BENUTZERSICHERHEIT GESCHÜTZT, DA AUCH VOM FRONTEND BENÜTZBAR SEIN SOLL
		//if ($user->checkCredentials($db, $request)== true) {
 
 			if ( !isset($_SESSION[ "valid_user" ]) ) $from = $_SESSION['valid_user'];
			else $from = "smartbooking@noejhw.at";
			
 			$to = $request->getParameter('to');  
 			
			$mail = new PHPMailer();

			$mail->IsSMTP();                            // set mailer to use SMTP
			$mail->Host = "smtp.ready2web.net";        // specify main and backup server
			$mail->SMTPSecure = "SSL";
			$mail->Port = 587;
			$mail->SMTPAuth = false;                        // turn on SMTP authentication
			//$mail->Username = "smartbooking@noejhw.at";    // SMTP username
			//$mail->Password = "her@cules";            // SMTP password

			$mail->From = $from;    //do NOT fake header.
			$mail->FromName = "Sachbearbeiter NOEJHW";
			$mail->AddAddress($to);
			$mail->AddReplyTo($from, "Support and Help"); //optional

			$mail->Subject = $request->getParameter('subject');
			$mail->Body    = $request->getParameter('body');

			if(!$mail->Send())
			{
			   throw new Exception($mail->ErrorInfo);
			}else{
			   $response->write("{success:true}");
			}		
		//}
	}
 }