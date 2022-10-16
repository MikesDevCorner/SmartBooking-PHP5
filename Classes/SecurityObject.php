<?php

include_once("Interfaces".DIRECTORY_SEPARATOR."ISecurityObject.php");


class SecurityObject implements ISecurityObject {

	public function checkCredentials(IDbConnection $db, IRequest $request) {
		if ( isset($_SESSION[ "valid_user" ]) ) return true;

		$user_email = $request->getParameter("user_email");
		$passwort = $request->getParameter("passwort");

		if ( $user_email && $passwort ) { 

			$sql = "select email, CONCAT(vorname,' ',nachname) as username, right_User, right_Anfrage, right_Buchung, 
			right_Leistung, right_Package, right_Partner, right_Auswertungen, right_Kunde, right_Jugendherbergen, ID_User
			from tUser
			where email='$user_email'
			and passwort=md5('$passwort')
			and aktiv = true";
			
			$ergebnis = $db->query($sql);
			
			$zeilen = $db->affected_rows();
			$userdata = $ergebnis->fetch_object();
			
			if ( $zeilen == 1 ) { 
				//alle für die Session relevanten Daten in dieser Session speichern und somit für die restlichen
				//Files abrufbar machen...
				$_SESSION['valid_user'] = $userdata->email;
				$_SESSION['username'] = $userdata->username;
				$_SESSION['right_user'] = $userdata->right_User;
				$_SESSION['right_anfrage'] = $userdata->right_Anfrage;
				$_SESSION['right_buchung'] = $userdata->right_Buchung;
				$_SESSION['right_leistung'] = $userdata->right_Leistung;
				$_SESSION['right_package'] = $userdata->right_Package;
				$_SESSION['right_partner'] = $userdata->right_Partner;
				$_SESSION['right_auswertungen'] = $userdata->right_Auswertungen;
				$_SESSION['right_kunde'] = $userdata->right_Kunde;
				$_SESSION['right_jugendherbergen'] = $userdata->right_Jugendherbergen;
				$_SESSION['ID_User'] = $userdata->ID_User;
				//Rückgabewert der Funktion ist true, wenn der Datenbankcall eine valide Zeile ergeben hat.
				return true;
			} else return false;
		} else return false;
	}

	public function checkRight($right) {
		return $_SESSION[$right];
	}
}