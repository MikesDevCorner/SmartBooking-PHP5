<?php
//Leitidee: Jede Seite im Webspace wird zu einem Command
//Ausgenommen davon ist eine einzige Seite - der zentrale Einstiegspunkt
//  Unter PHP am Apache Webserver ist der typische Name dieser Seite index.php

//Das Commandinterface spezifiziert die Anforderung an Klassen,
//die für Seiteninhalte zuständig sind.

//Vorteil:
// - Neue Commandklassen können mit geringer Abhängigkeit hinzugefügt werden
// - Bestehende Commandklassen können ohne große Tiefen- und Breitenwirkung
//   ausgetauscht werden.

interface ICommand {
	public function execute(IRequest $request, IResponse $response);
}
