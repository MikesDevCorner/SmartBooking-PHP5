<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdGetAnfrageGraphData implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {
		
		//make db-connection
	 	$db = new DbConnection();

		//check if user has permissions to proceed
		$user = new SecurityObject();
		if ($user->checkCredentials($db, $request)== true) {
		
			$AnfangsDatum = $request->getParameter('anfang');
			$EndDatum = $request->getParameter('ende');

			$sql = "SELECT COUNT(ID_Anfrage) AS anzahl, CONCAT(YEAR(termin), '-',
					MONTH(termin)) AS MONTH FROM tAnfrage WHERE aktiv = TRUE AND termin BETWEEN '".$AnfangsDatum."' AND '".$EndDatum."'
					GROUP BY month ORDER BY month ASC";
			
			
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