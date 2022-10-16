<?php

include_once("Interfaces".DIRECTORY_SEPARATOR."IResponse.php");

class HttpResponse implements IResponse {
	private $status = "200 ok";
	private $headers = array();
	private $body = null;
	
	public function setStatus($status) {
		//Durch die Übergabe des Statuswertes in einer öffentlich zugänglichen Methode
		//an den Werd der privaten Variable "Status" wäre es möglich, aufwendige Prüfungen
		//durchzuführen, um das Speichern nicht erlaubter Stati auf dem privaten Variablenwert
		//zu verhindern.
		$this->status = $status;
	}

	public function addHeader($name, $value) {
		$this->headers[$name] = $value;		
	}
	
	public function write($data) {
		$this->body .= $data;		
	}
	
	public function flush() {
		header("HTTP/1.0 {$this->status}");
		foreach($this->headers as $name => $value) {
			header("{$name}: {$value}");
		}	
		print $this->body;
		$this->headers = array();
		$this->body = null;
	}
	
}