<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdGetBuchungsGraphData implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();

		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
		
			$AnfangsDatum = $request->getParameter('anfang');
			$EndDatum = $request->getParameter('ende');

			$sql = "SELECT COUNT(ID_Buchung) AS anzahl, tJhb.jhb 
					FROM tBuchung 
					INNER JOIN tPackage ON (tBuchung.ID_Package = tPackage.ID_Package)
					INNER JOIN tJhb_Package ON (tPackage.ID_Package = tJhb_Package.ID_Package)
					INNER JOIN tJhb ON (tJhb_Package.ID_Jhb = tJhb.ID_Jhb)
					WHERE tBuchung.aktiv = TRUE GROUP BY tJhb.jhb ORDER BY anzahl DESC";
			
			$ergebnis = $db->query($sql);
			$zeilen = $db->affected_rows();
	
			while($zeile = $ergebnis->fetch_object()){
				$arr[] = $zeile;
			}
			$data = json_encode($arr);
			$response->write('({"total":"' . $zeilen . '","results":' . $data . '})');
		
		} else $response->write("{success:false}");

	}
 }