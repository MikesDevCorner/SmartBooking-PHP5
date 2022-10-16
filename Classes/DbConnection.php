<?php

include_once("Interfaces".DIRECTORY_SEPARATOR."IDbConnection.php");

class DbConnection implements IDbConnection {
	private $link=null;


	public function __construct() {
		//Verbindung zum Datenbank-Server herstellen (Connection String)
		$this->link = @ new mysqli('127.0.0.1', 'projectuser', 'wifi@wifi0','',3306);
		//@ unterdrückt die Fehlermeldung, wenn Connection nicht erstellt werden kann.
		//$this->link-->connect_error erst ab PHP 5.2.9 unterstützt
		//daher hier die winzige Ausnahme:
		if (mysqli_connect_error()) {
			throw new DBConnectException('Konnte nicht zum Datenbankserver verbinden. Bitte prüfen Sie die Erreichbarkeit des Selbigen.');
		}
		//Datenbank am Server auswählen
		$this->link->select_db('smartbooking');
		if($this->link->errno) {
			throw new DBConnectException('Datenbank konnte nicht ausgewählt werden. Bitte prüfen Sie, ob die Datenbank existiert.');
		}
	}


	public function affected_rows() {
		return $this->link->affected_rows;
	}

	public function query($sql) {
		$query_result = $this->link->query($sql);
		if($this->link->errno) {
			throw new DBSQLException('Der SQL-Ausdruck ist falsch. Bitte prüfen Sie die Schreibweise.');
		}
		return $query_result;
	} 

	public function real_escape_string($value) {
		$res_result = $this->link->real_escape_string($value);
		return $res_result;
	}
}