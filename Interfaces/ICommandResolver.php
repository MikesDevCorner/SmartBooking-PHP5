<?php

// In form03aw.php mussten wir uns selbst um das Instanziieren eines Commands kümmern.
// z.B.: new CmdAntwortLogin()
// Der CommandResolver soll in der Lage sein, mit Bekanntgabe des Namens eines Kommandos, 
// z.B. AntwortLogin, diesen Command zu finden und zu instanziieren. 
// Sollten wir diesen Command nicht finden, soll es zu einer Standardantwort kommen 
// (z.B. "Bitte Sysadmin verständigen").
// Beim Kommandonamen wird der Startteil nicht "Cmd" nicht mitgeschickt, da er immer gleich ist.
	
interface ICommandResolver {
	public function getCommand(IRequest $request);
}
