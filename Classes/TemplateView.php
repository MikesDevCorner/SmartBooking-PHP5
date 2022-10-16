<?php
class TemplateView {
//Das Model muss Templatelöcher mit Inhalt (Daten) beschicken.
//Die Daten pro Loch werden mit der assign-Methode zur Verfügung gestellt.
	
	//Auf $template steht der Name der Datei im Templates-Ordner
	private $template;
	//Die Assign-Methode spricht nicht direkt "Löcher" im Template an, sondern
	//macht Einträge im $vars array.
	//Für die praktische Arbeit:
	//	- Zwischen den Templateprogrammierern (HTML, CSS, JS) und den
	//    Modelprogrammmierern	(PHP) muss bezüglich der Keynamen am $vars-Array eine
	//    Abstimmung erfolgen. 
	private $vars = array();
	
	//dem Konstruktor wird der Template-Name übergeben
	public function __construct($template) {
		$this->template = $template;
	}
	
	public function assign($name, $value) {
		$this->vars[$name]=$value;
	}
	
	//Wenn eine Datei mit include geladen wird, wird ein darin befindlicher
	//PHP-Code geparst bzw. ausgefährt.
	//Wenn in den Löchern PHP-Code steht, dann wird dieser exekutiert.
	// - In unserem Modell müssen die Templateprogrammierer auch "bescheidene"
	//   PHP-Kenntnisse haben.
	
	//Hinter "Löcher beschicken" verbirgt sich eine Schreiboperation.
	// - Schreiben darf aber nur die Responsemethode "write".
	// - zu verhindern, dass die Schreiboperation bis zum Browser durchschlägt,
	//   ist eine wichtige Aufgabe. Lösung: Puffer einschalten.
	public function render(IResponse $response) {
		ob_start();
		$filename = "Templates".DIRECTORY_SEPARATOR.$this->template.DIRECTORY_SEPARATOR."vw".$this->template.".tpl";
		include_once $filename;
		$data = ob_get_clean();
		$response->write($data);
	}
	
	public function __get($property) {
		if(isset($this->vars[$property])) {
			return $this->vars[$property];
		}
		return null;
	}
}