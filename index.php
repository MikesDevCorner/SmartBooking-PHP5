<?php
	session_start();

	class DBConnectException extends Exception {}
	class DBSQLException extends Exception {}


	function __autoload_libraries($class_name) {
		include "Classes/{$class_name}.php";
	}
    spl_autoload_register('__autoload_libraries');

	try {
		$resolver = new FileSystemCommandResolver('Commands',"_Standard");
		$controller = new FrontController($resolver);
		$request = new HttpRequest("post");
		$response = new HttpResponse();
		$controller->handleRequest($request,$response);
	}


	//DIE FEHLERBEHANDLUNG SETZT DARAUF AUF, DASS EIN FEHLER BEI EINEM AJAX-CALL GENAU GLEICH BEHANDELT WIRD WIE
	//EIN FEHLER BEI EINEM NON-AJAX-CALL. IM 2. FALL WIRD EIN EIGENES TEMPLATE AUFGERUFEN MIT DER FEHLERMELDUNG
	//IM AJAX-FALL WIRD IN DER APPLIKATION EINE MESSAGE-BOX MIT DEN GLEICHEN INFORMATIONEN AUFGEPOPPT.
	catch(DBConnectException $e) {
		if($request->issetParameter("nonajax")) {
			//Wenn es sich um keine AJAX-Call handelt, wird die Aufbereitung des Fehlers vom Server übernommen
			$view = new TemplateView('Fehler');
			$view->assign('message',$e->getMessage());
			$view->assign('type','Connect');
			$view->render($response);
			$response->flush();
		} else {
			//Wenn es sich um einen AJAX-Call handelt, wird die Aufbereitung des Fehlers vom Client übernommen
			$response->write('({"error":true, "type":"Connect", "message":"' . $e->getMessage() .'"})');
			$response->flush();
		}
	}

	catch(DBSQLException $e) {
		if($request->issetParameter("nonajax")) {
			$view = new TemplateView('Fehler');
			$view->assign('message',$e->getMessage());
			$view->assign('type','Sql');
			$view->render($response);
			$response->flush();
		} else {
			$response->write('({"error":true, "type":"Sql", "message":"' . $e->getMessage() .'"})');
			$response->flush();
		}
	}

	catch(Exception $e) {
		if($request->issetParameter("nonajax")) {
			$view = new TemplateView('Fehler');
			$view->assign('message',$e->getMessage());
			$view->assign('type','Different');
			$view->render($response);
			$response->flush();
		} else {
			$response->write('({"error":true, "type":"Different", "message":"' . $e->getMessage() .'"})');
			$response->flush();
		}
	}