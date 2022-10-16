<?php
 include_once("Interfaces/ICommand.php");
 
 class cmdGetPackage implements ICommand {
 
	public function execute(IRequest $request, IResponse $response) {

		//make db-connection
	 	$db = new DbConnection();
		
		if($request->issetParameter('ID_Jhb')) {
			$ID_JHB = $request->getParameter('ID_Jhb');
			$sql = "SELECT tPackage.ID_Package, packagename FROM tPackage INNER JOIN tJhb_Package ";
			$sql = $sql."ON (tPackage.ID_Package = tJhb_Package.ID_Package) WHERE (tPackage.aktiv = TRUE AND tJhb_Package.ID_Jhb = '$ID_JHB') ORDER BY packagename ASC";
		} else {
			$sql = "select ID_Package, packagename from tPackage WHERE aktiv = true ORDER BY packagename ASC";
		}
		
		$ergebnis = $db->query($sql);
		$zeilen = $db->affected_rows();

		while($zeile = $ergebnis->fetch_object()){
			$arr[] = $zeile;
		}
		$data = json_encode($arr);
		$response->write('({"total":"' . $zeilen . '","results":' . $data . '})');
	}
 }