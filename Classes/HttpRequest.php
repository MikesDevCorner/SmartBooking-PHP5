<?php

include_once("Interfaces".DIRECTORY_SEPARATOR."IRequest.php");

//Warum wird nicht direkt mit $_GET, $_POST oder $_REQUEST gearbeitet?
// - Grundlegende Regeln der Softwareentwicklung werden nicht eingehalten:
// 		* Es wird nicht gegen eine Schnittstelle, sondern gegen eine konkrete Implementierung prorammiert
//		* Die von PHP implementierte Schnittstelle zu PHP-Daten ($_GET, ...) ist nicht objektorientiert
//		  Anzumerken ist, dass diese Schnittstelle zu Requestdaten als einfach empfunden wird,
//		  und vermutlich zum Erfolg von PHP maßgeblich beigetragen hat.
//		* Die Zerlegung der Anwendung in Schichten wird vernachlässigt. Das führt vermutlich zur Duplizierung
//		  von Code und einer enormen Steigerung von Komplexität, wenn es zur Erweiterung der Anwendung kommt.

class HttpRequest implements IRequest {
	
	private $parameters = array();
	
	public function __construct($method="POST") {
		$method = strtoupper($method);
		//Falls über die Get-Methode der Parameter "JSON" gesetzt ist,
		//wird davon ausgegangen, dass die rohen Plaintext-Request-Daten
		//im JSON-Format ein Objekt mit allen Request-Daten enthalten.
		//Dieser Aufruf indiziert einen Ajax-Call.
		if (isset($_GET['json'])) {
			$oData = json_decode($GLOBALS['HTTP_RAW_POST_DATA']);
			$this->setParameter('cmd',$oData->cmd);
			$this->setParameter('oData', $oData);
		} 
		//Der else-Fall tritt ein, wenn der Request ganz normal über ein
		//Form-Submit oder ähnlich gemacht wird. Auch in diesem Fall kann es
		//sich um einen AJAX-Request handeln. Er ist aber nicht im JSON-Format übergeben.
		else {
			if($method == "GET") {$this->parameters=$_GET;}
			if($method == "POST") {$this->parameters=$_POST;}
			if($method == "REQUEST") {$this->parameters=$_REQUEST;}
		}
	}
	
	public function issetParameter($name) {
		return isset($this->parameters[$name]);
	}
	
	public function getParameter($name) {
		if($this->issetParameter($name)) {
			return $this->parameters[$name];			
		}
		else return null;
	}
	
	public function getParameterNames() {
		//nur die Key-Spalte des Parameter-Arrays.
		return array_keys($this->parameters);
	}
	
	public function unsetParameter($name) {
		if($this->issetParameter($name)) {
			unset($this->parameters[$name]);			
		}
	}
	
	//setParameter ist vielleicht etwas ungewohnt in einem HTTP-Request.
	//wir brauchen diese Funktion, um den "Nicht-Ajax-Aufrufen" explizit ein Argument
	//mit dem Namen nonajax mitzuübergeben. Das passiert in der cmdLogin.php
	//Diese Markierung wird dem Request erst am Server verpasst, und zwar vom
	//aufgerufenen Command
	public function setParameter($name, $value) {
		if($this->issetParameter($name)) {
			return false;
		} else {
			$this->parameters[$name] = $value;
		}
	}
	
	public function getHeader($name) {
		$name = strtoupper($name);
		if (isset($_SERVER[$name])) {
			return $_SERVER[$name];
		} else return null;
	}
}