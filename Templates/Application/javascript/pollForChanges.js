/**************************************************************************************
*	POLL FOR CHANGES IST FÜR DAS SERVER-POLLING VON NEUEN
*	INFORMATIONEN ZUSTÄNDIG
**************************************************************************************/

//diese Funktion  schickt alle 15sek einen asynchronen Request an den Server und reloaded den store
//das bedeutet, ein neuer Record in der Datenbank wird mit max. 15sek Verstatz in den store geladen und angezeigt.
//Für die Verwendung ist gedacht, diese Funktion statt der initialen store.load Function zu benützen.
function pollForChanges(grid,first) {
	//beim ersten Aufruf dieser Funktion, wird der store natürlich nicht reloaded, sondern es erfolgt der initiale LOAD-Aufruf.
	if (first == true) {
		grid.getStore().load({
			params:{start:0, limit:10},
			//Fehlerbehandlung für den ersten, initialisierenden Datenabruf in die Tabellen
			//Wenn es zu einer Exception kommt, wird die entsprechende handle-Exception Funktion aufgerufen
			callback: function(rec,opti,succ) {
				if (grid.getStore()!=null) {
					var JSON_Data = grid.getStore().reader.jsonData;
					if(JSON_Data.error==true) { //FEHLERBEHANDLUNG
						Ext.example.msg("Type: "+JSON_Data.type, JSON_Data.message); //weiter Unterscheidung mit Fehler-Objekt
					} else {
						if(JSON_Data.total == 0) {
							Ext.example.msg('Status', 'Noch keine Daten in diesem Bereich vorhanden.');
						} 
					}
				}
			}
		});
		setTimeout(function(){pollForChanges(grid,false);}, 15000);
	}
	else {
		//wenn ein Datensatz bearbeitet wird, darf nicht gepolled werden, da ein reload des stores während einige Felder 'dirty' sind
		//kein Update in der Datenbank der schmutigen Felder auslöst. Während des Bearbeitens eines Datensatzes habe ich die selbst
		// eingebrachte Eigenschaft _pollEnabled im Store auf false gesetzt, erst danach kann wieder gepolled werden.
		if (grid.getStore()!=null) {
			if(grid.getStore()._pollEnabled == true) {
				grid.getStore().reload({
					callback: function(rec,opti,succ) {					
						//unabhängig von success oder failure wird in 15sek wieder ein call abgesetzt.
						//Bei den reloads im 15 Sekunden-Takt wollen wir keine Fehlerbehandlung.
						//Auch wenn der Server nicht erreichbar war oder ein anderer Fehler auftrat
						//wollen wir den User damit nicht behelligen. Das aktuell halten der Datensätze
						//in den Stores soll unauffällig und im Hintergrund passieren.
						setTimeout(function(){pollForChanges(grid,false);}, 15000);
					}
				});
			} //else setTimeout(function(){pollForChanges(grid,false);}, 15000);
		}
	}
}