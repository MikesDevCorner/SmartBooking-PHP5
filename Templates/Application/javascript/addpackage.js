/************************************************************************************************
----------------------------Funktion, um einen Tab zum Mainbereich zu adden.----------------------------------
Ich habe mich für diese Variante entschieden, da somit das Initiieren des Programmes flotter geht. 
Beim Instanziieren eines neuen Tabs für das Center-Panel wird der jeweilige Programmteil nachgeladen. 
Ich bin der Meinung das diese Herangehensweise den Workflow des Users am wenigsten beeinträchtigt.
Technisch wäre es auch möglich, alle Tabs beim Ext.onReady()  Event zu laden. Man hätte dadurch den Vorteil
einer verkürzten Zeit während des Betriebes. Dafür dauert das initiierende Laden des Programmes um ein viel-
faches länger und nicht benötigte Programmteile werden gleich von Beginn an immer mitgeladen.
*************************************************************************************************/

function addPackagesTab(){
	//zuerst gehört gecheckt, ob es den Tab nicht vielleicht schon gibt.
	//wenn ja, wird er nur mehr focusiert, wenn nein werden die Grids, Forms und Stores erstellt
	//und alles läuft wie geschmiert :)
	if(document.getElementById('packageTab') == null) {

/***************************************************************************************************/
/*****  Hier startet der Hauptbereich für die Packages. Liegt im Zentrum des Hauptpanels   *********/
/***************************************************************************************************/
	
	// create the data store Junge Hotels
		var packStore = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url: 'index.php',
				method: 'POST'
			}),
			remoteSort:true,
			baseParams:{
				cmd: "FillPackageGrid"
			},
			reader: new Ext.data.JsonReader({
				root: 'results',
				totalProperty: 'total'
			},Ext.data.Record.create([
				 {name: 'ID_Package', type:'int'},
				 {name: 'packagename', type:'string'},
				 {name: 'pdfPfad', type:'string'},
				 {name: 'username', type:'string'},
				 {name: 'letzteBearbeitung', type:'date', dateFormat:'Y-m-d'}
				 
			  ])
			)
		});
		 //packStore._pollEnabled = false;
		 packStore.addListener('update',function(st,rec,op) {
		  //Hier brauchen wir einen kleinen Trick den ich (Gott sei Dank)
		  //aus dem Netz der Netze geklaut habe! Wir müssen ja für jedes upgedatete Feld
		  //einen Ajax-Update-Call machen. Ich hatte aber von rec.getChanges() nur ein Objekt
		  //indem ALLE geänderten Werte gespeichert waren. Diese kurze aber echt geile Schleife
		  //löst mein Problem und setzt für jede Property des Objects einen AJAX-Update-Call ab
		  //mit den geänderten Werten! Genial einfach, einfach genial!!
		  var obj = eval(rec.getChanges());
		  if (typeof(obj) == "object")
			 for (var j in obj) {   //das ist die Schleife aus dem I-Netz! TOLLE SACHE!		 
				 Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
						waitTitle:'Connecting', 
						waitMsg:'Sending data...',
						url: 'index.php',
						params: {
							cmd:"Update",
							key: 'ID_Package',
							keyID: rec.data.ID_Package,
							table:"tPackage",
							field: j,
							value: obj[j]
						},
						failure:function(response,options){
							Ext.example.msg('Status', 'not Updated, Errors occured!');
							
						},
						success:function(response,options){
							var responseData = Ext.util.JSON.decode(response.responseText);
							if(responseData.success == true) {
								packStore.reload();
								packStore.commitChanges();
								Ext.example.msg('Status', 'Updated successfully!');
							} else {
								Ext.example.msg('Fehler!', 'Leider kein Zugriff');
							}
						}
					});
			 }
		});
	
		//Pfad für Druck-Layout-Einstellungs-CSS:
		Ext.ux.GridPrinter.stylesheetPath = 'Templates/Application/css/grid_print.css';
	
		var PackGrid = new Ext.grid.GridPanel({
			frame: false,
			border:true,
			id:'PackGrid',
			store: packStore,
			columns: [
				{header: "Package", width: 50, sortable: false, dataIndex: 'packagename'},
				{header: "Pdf-Pfad", width: 50, sortable: false, dataIndex: 'pdfPfad'},
				{header: "User", width: 50, sortable: false, dataIndex: 'username'}	
			],
			stripeRows: true,
			viewConfig: {
				forceFit:true
			},    
			//layout:'fit',
			region:'center',
			sm: new Ext.grid.RowSelectionModel({
				singleSelect:true
			}),
			bbar: new Ext.PagingToolbar({
			  pageSize: 10,
			  store: packStore,
			  displayInfo: true,
			  plugins: new Ext.ux.ProgressBarPager()
			}),
			tbar: new Ext.Toolbar({
				items: [{
					tooltip:'Packages anzeigen',
					iconCls:'lesen',
					id:'PackShowButton',
					handler:function() {
						var rec = PackGrid.getSelectionModel().getSelected();
						if(rec) 
						{
							 //Datensatz Package Anzeigen 
							 var showPackage = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									defaults: {width: 200},
									bodyStyle:'padding:10px',
									defaultType: 'textfield',
									height: 'auto',
									border: false,
									items:[{
									  fieldLabel: 'Package-ID',
									  readOnly:true,
									  name: 'ID_Package'
								  },{						  
									  fieldLabel: 'Package',
									  readOnly:true,
									  name: 'packagename'
								  },{
									  fieldLabel: 'Pdf-Pfad',
									  allowBlank:false,
									  name: 'pdfPfad'
								  },{
									  fieldLabel: 'Zuletzt bearbeitet von',
									  readOnly:true,
									  name: 'username'
								  },{
									  fieldLabel: 'Zuletzt bearbeitet am',
									  readOnly:true,
									  hideTrigger:true,
									  disabled:true,
									  format: 'd.m.Y',
									  xtype:'datefield',
									  name: 'letzteBearbeitung'
									  }]
							 });
							 
							 var showPackageFP = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'ticketForm',
								items: [{
								
									activeTab: 0,
									defaults:{autoHeight:true}, 
									items:[showPackage]
								}],
								buttons: [{text:'Ok',
										   handler:function() {win.close();}}]
							});
					  
							var win = new Ext.Window({
								title:'Daten Packages anzeigen',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [showPackageFP]
							});
							showPackageFP.getForm().loadRecord(PackGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}	
					  },
						
					width:50,
					},{
					tooltip:'Packe bearbeiten',
					iconCls:'schreiben',
					id:'PackEditButton',
					handler:function() {
						//das Polling des Stores wird ausgeschalten, solange bis die Bearbeitung des Datensatzes abgeschlossen ist.
						//packStore._pollEnabled = false;
						//der in der Grid selektierte Record aus dem Store wird vollständig in der Variable rec gespeichert, und in das FormPanel zum Bearbeiten geladen.
						var rec = PackGrid.getSelectionModel().getSelected();
						//wenn diese if-Abfrage false ergibt ist kein Datensatz in der Grid selektiert und es wird ein entsprechender Hinweis ausgegeben.
						if(rec) 
						{
							 //Daten des Packages Ändern 
							 var writePackAendern = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									defaults: {width: 200},
									bodyStyle:'padding:10px',
									defaultType: 'textfield',
									height: 'auto',
									border: false,
									items:[{
									  fieldLabel: 'Package ID',
									  readOnly:true,
									  name: 'ID_Package'
								  },{						  
									  fieldLabel: 'Package*',
									  allowBlank:false,
									  name: 'packagename'
								  },{
									  fieldLabel: 'Pfad',
									  allowBlank:false,
									  name: 'pdfPfad'
								  }]
							 });
							  
							var writePackFP = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'PackForm',
								monitorValid:true,
								items: [{
									activeTab: 0,
									defaults:{autoHeight:true}, 
									items:[writePackAendern]
								}],
								buttons: [{ text:'save',
											iconCls:'save',
											formBind: true,
											handler: function() {
												writePackFP.getForm().updateRecord(PackGrid.getSelectionModel().getSelected());
												//das Polling für den Store wieder aktivieren...
												//packStore._pollEnabled = true;
												win.close();
											}
										  },{
											text: 'cancel',
											handler: function() {
												//das Polling für den Store wieder aktivieren...
												//packStore._pollEnabled = true;
												win.close();
											}
										  }
										 ]
							});
					  
							var win = new Ext.Window({
								title:'Daten Packages ändern',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [writePackFP]
							});
							writePackFP.getForm().loadRecord(PackGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  },
					
					width:50,
					
				},{
					tooltip:'Packages neu anlegen',
					iconCls:'add',
					id:'PackNewButton',
					width:50,
					handler:function() {
					var neuPack = new Ext.form.FieldSet({
							labelAlign: 'left',
							labelWidth: 150,
							layout:'form',
							defaults: {width: 200},
							defaultType: 'textfield',
							bodyStyle:'padding:10px',
							height: 'auto',
							border: false,
							items:[{
									  fieldLabel: 'Package*',
									  allowBlank:false,
									  name: 'packagename'
								  },{
									  fieldLabel: 'Pfad',
									  allowBlank:false,
									  name: 'pdfPfad'
								    }]
						 });
						 var formpackanlegen = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'packForm',
								url:'index.php',
								buttons: [{
									text: 'Save',
									formBind: true,
									  iconCls:'save',
									  handler: function(){ 
										formpackanlegen.getForm().submit({ 
											method:'POST', 
											waitTitle:'Connecting', 
											waitMsg:'Sending data...',
											params: {
												cmd:'InsertPackage'										
											},
											success:function(form, action){ 
												if(action.result.success == true) {
													Ext.example.msg('Status', 'Saved successfully!');
													packStore.reload();
												} else {
													Ext.example.msg('Fehler', 'Nicht gespeichert!!');
												}
											anlegenpackwindow.close();
											},
											failure:function(form, action){ 
												if(action.failureType == 'server'){ 
													Ext.example.msg('Not Saved. Server-Error Occured.');
												}else{ 
													Ext.example.msg('Warning!', 'Server is unreachable at the Moment: ' + action.response.responseText);
												} 
												anlegenpackwindow.close();
											} 
										}); 
									}
								  },{
									  text: 'Cancel',
									  handler: function() {anlegenpackwindow.close();}
								  }],
								items: [neuPack]	 
						 });
						 
						 
						 var anlegenpackwindow = new Ext.Window ({
							title:'Packages anlegen',
								closable:true,
								width:500,
								border:true,
								resizable:false,
								modal:true,
								items: [formpackanlegen]
							});
							anlegenpackwindow.show(this);
							
					}
				},{
					tooltip:'Package löschen',
					handler: function() {
					var rec = PackGrid.getSelectionModel().getSelected();
						if(rec) 
						{							
						  Ext.Msg.show({
							   title:'wirklich löschen?',
							   msg: 'Sie sind dabei, ein Package zu löschen. Wollen Sie dieses Junges Hotel wirklich löschen?',
							   buttons: Ext.Msg.YESNO,
							   fn: function(buttonID) {
									if(buttonID=='yes') {
										  Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
												waitTitle:'Connecting', 
												waitMsg:'updating data...',
												url: 'index.php',
												params: {
													cmd:"Update",
													key: 'ID_Package',
													keyID: PackGrid.getSelectionModel().getSelected().data.ID_Package,
													table:"tPackage",
													field: 'aktiv',
													value: 0
												},
												failure:function(response,options){
													Ext.example.msg('Status', 'Not deleted! Error Occured!');
												},
												success:function(response,options){
													var responseData = Ext.util.JSON.decode(response.responseText);
													if(responseData.success == true) {
														packStore.reload();
														packStore.commitChanges();
														Ext.example.msg('Status', 'Deleted successfully!');
													} else {
														Ext.example.msg('Fehler', 'Keine Berechtigung');
													}
												}
											});
										  packStore.reload(); 			            		  			
									}
							   },
							   icon: Ext.MessageBox.QUESTION
						  });
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  },
					iconCls:'delete',
					id:'PackageDeleteButton',
					width:50,
					
				},{
					tooltip:'Tabelle drucken',
					iconCls:'print',
					id:'DruckenButton',
					width:50,
					handler:function() {
						//nachträglich eininstalliertes extjs-Plugin
						Ext.ux.GridPrinter.print(PackGrid);
					}
				},'->',{
					xtype:'textfield',
					name:'searchfield',
					id:'packsuchfeld',
					enableKeyEvents:true,
					emptyText:'Packages suchen...'
				}] 
			}) 
	});	 
	//dieser Event wird bei jedem Keyup-Event des Suchfeldes ausgelöst. Wir machen nach jedem Buchstaben einen AJAX-Request und
		//schießen das Ergebnis dieses neuen Requests an den Store. Hoffentlich ist der Datenbankzugriff schnell genug damit sich dieser geile
		//moderne Effekt den ich mir vorstelle auch zu 100% entfaltet... --> wenn dieser Kommentar in der Endversion noch enthalten ist, dann gehts :)
		Ext.getCmp('packsuchfeld').addListener('keyup',function(tf,e) {
			packStore.reload({params:{suchen:tf.getValue(),start:0, limit:10}});
		});
	
		// Jedesmal, wenn eine Zeile in der Grid ausgewählt wird, werden die Daten im packleistStore neu geladen
		// Dieses Listener lauscht auf den 'rowselect' Event, den das Selection Model der Grid aussendet.
		
		PackGrid.getSelectionModel().addListener('rowselect',function() {
			packleistungStore.load({
				params:{ID_Package:PackGrid.getSelectionModel().getSelected().data.ID_Package},
				callback: function(rec,opti,succ) {
					var JSON_Data = PackGrid.getStore().reader.jsonData;
					if(JSON_Data.error==true) { //FEHLERBEHANDLUNG
						Ext.example.msg("Type: "+JSON_Data.type, JSON_Data.message); //weiter Unterscheidung mit Fehler-Objekt
					} else {
						if(JSON_Data.total == 0) {
							Ext.example.msg('Status', 'Noch keine Leistungen für dieses Package angelegt...');
						} 
					}
				}
			});
			PackLeistungGrid.getTopToolbar().setVisible(true);
			PackLeistungGrid.setTitle('Leistungen von: '+PackGrid.getSelectionModel().getSelected().data.packagename);
		});
		 
		//die ersten 10 Datensätze in den Store laden (Event an die Grid)
		pollForChanges(PackGrid,true);
		
/*****************************************************************************************************************/
/***********      Hier startet der Bereich für die Leistungen im Ost-Bereich des Hauptpanels      ****************/
/*****************************************************************************************************************/

//Der Store packleistungStore versorgt die Grid PackLeistungGrid mit den Einträgen die auf die Packages in der
//Tabelle tpackagesleistung bezogen sind.

		var packleistungStore = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url:'index.php',
				method:'POST'
			}),
			remoteSort: true,
			baseParams:{
				cmd: "FillPackLeistungGrid"
			},
			reader: new Ext.data.JsonReader({
				root: 'results',
				totalProperty: 'total'
			},Ext.data.Record.create([
				{name: 'ID_Leistung', type:'int'},
				{name: 'Leistung', type: 'string'},
				{name: 'leistungstag', type: 'int'},
				{name: 'StandardUhrzeit', type: 'string'}
			  ])
			)
		});
		packleistungStore.addListener('update',function(st,rec,op) {
		
		  var obj = eval(rec.getChanges());
		  if (typeof(obj) == "object")
			 for (var j in obj) {   //das ist die Schleife aus dem I-Netz! TOLLE SACHE!		 
				 Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
						waitTitle:'Connecting', 
						waitMsg:'Sending data...',
						url: 'index.php',
						params: {
							cmd:"UpdatePackLeistung",
							key1: 'ID_Package',
							key2: 'ID_Leistung',
							keyID1: PackGrid.getSelectionModel().getSelected().data.ID_Package,
							keyID2: PackLeistungGrid.getSelectionModel().getSelected().data.ID_Leistung,
							table:"tPackageleistung",
							field: j,
							value: obj[j]
						},
						failure:function(response,options){
							Ext.example.msg('Status', 'not Updated, Errors occured!');
							
						},
						success:function(response,options){
							var responseData = Ext.util.JSON.decode(response.responseText);
							if(responseData.success == true) {
								packleistungStore.reload();
								packleistungStore.commitChanges();
								Ext.example.msg('Status', 'Updated successfully!');
							} else {
								Ext.example.msg('Fehler!', 'Leider kein Zugriff');
							}
						}
					});
			 }
		});
// Der Store leistungStore versorgt die ComboBox in der EditorGrid mit den Leistungen
// Es werden alle Leistungen gespeichtert!

		var leistungStore = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url: 'index.php',
				method: 'POST'
			}),
			reader: new Ext.data.JsonReader({
				root: 'results',
				totalProperty: 'total',
				id: 'ID_Leistung'
			},Ext.data.Record.create([
				{name: 'ID_Leistung', type: 'int'},
				{name: 'Leistung', type: 'string'}
			])
			),
			baseParams:{
				start: 0,
				cmd: "GetLeistung"
			}
		});
		
		leistungStore.load();
		
		var PackLeistungGrid = new Ext.grid.EditorGridPanel({
			frame: true,
			enableHdMenu: false,
			border: true,
			width: 300,
			id: 'PackLeistungGrid',
			tbar: new Ext.Toolbar({
				hidden: true,
				items:[{
					tooltip:'Leistung hinzufügen',
					iconCls:'add',
					id:'addLeistung',
					width:50,
					handler: function() {
						//Diese Button wird ein neues Element mit dem Standartnamen 'neues Package' in den packleistungStore hinzufügen.
						//ACHTUNG: Dieses Element existiert nur im Store und wird nicht in die Datenbank geschrieben.
						//Erst wenn der Standartname durch wählen in der Combobox abgeändert wird, wird in die Datenbank geschrieben
						//konkret passiert das Schreiben in die Datenbank im Listener der am ColumnModel-Editor der ComboBox auf den 'change'-Event lauscht.
						var Leistung = PackLeistungGrid.getStore().recordType;
						var l = new Leistung({
							Leistung: 'neue Leistung'
						});
						PackLeistungGrid.stopEditing();
						packleistungStore.insert(0, l);
						PackLeistungGrid.startEditing(0, 0);
					}
				},{
					tooltip:'Leistung löschen',
					iconCls:'delete',
					id:'delLeistung',
					width:50,
					handler: function() {
						Ext.Ajax.request({
							waitTitle:'Connecting', 
							waitMsg:'Sending data...',
							url: 'index.php',
							params: {
								cmd:"HandlePackLeistung",
								ID_Package: PackGrid.getSelectionModel().getSelected().data.ID_Package,
								ID_Leistung: PackLeistungGrid.getSelectionModel().getSelected().data.ID_Leistung,
								remove: 1
							},
							failure:function(response,options){
								Ext.example.msg('Status', 'not Deleted, Errors occured!');
							},
							success:function(response,options){
								var responseData = Ext.util.JSON.decode(response.responseText);
								if(responseData.success == true) {
									packleistungStore.reload();
									packleistungStore.commitChanges();
									Ext.example.msg('Erfolg', 'Leistung erfolgreich vom Package entfernt!');
								} else {
									Ext.example.msg('Fehler!', 'Diese Leistung ist bereits auf diesem Package zugeordnet!');
								}
							}
						});
					}
				}]
			}),
			store: packleistungStore,
			title: 'Leistung',
			clicksToEdit:2,	
			//Das Columnmodel in der Editorgrid ist etwas erweitert, im Vergleich zu der normalen Grid.
			//Es wird zusätzlich ein Editor benötigt, um festzulegen, wie die Änderung der Gridzelle abgehandelt werden soll.
			columns: [
				{ 
				width: 30,
				header: 'Leistung',
				dataIndex: 'Leistung',
				editor: new Ext.form.ComboBox({
                    fieldLabel: 'Leistung*',
					xtype:'combo',
					allowBlank:false,
					editable:false,
					id:'currentCombo',
					forceSelection:true,
					name:'Leistung',
					triggerAction:'all',
					mode: 'local',
					//um alle Leistungen aus der DB in dieser Combobox anzeigen zu können, müssen wir einen Store erstellen
					//und diesen über den CmdGetLeistung-Command befüllen lassen.
					store: leistungStore,
					valueField: 'ID_Leistung',
					displayField: 'Leistung',
					//Dieser Listener lauscht auf den Select-Event der Combobox in der EditorGrid
					//Wenn sich die Combobox ändert, wird die Änderung in die Datenbank geschrieben
					//und der Store für die Jhb_Pack Grid wird neu geladen (damit auch der neue Wert enthalten ist)
					listeners:{
						'select': {
							fn: function(combo, record, index) {
								
								//Leider gibt es anscheinend (auch lt. API) keine einfachere Möglichkeit, im select-Event die ID des alten
								//Wertes, also des Wertes der vor dem selecten in der Combo gestanden hat, herauszufinden. Den Text bekommt man allerdings.
								//Mit dieser Schleife durchlaufe ich den gesamten Packagestore und suche nach der entsprechenden ID. Die ID wird benötigt, um
								//in der Datenbanktabelle auch Datensätze updaten zu können. Ohne diese ID kann man den entsprechenden Datensatz nicht lokalisieren.
								var oldValue;
								//zugegeben, dieses Array sieht echt hässlich aus. Zur Erklärung: im select-Event steht das Objekt "combo" zur Verfügung
								//ausgehend von diesem Objekt kann man sehr viele Dinge erreichen. Z.B. ist combo.store der hinter der Combobox stehende Store.
								//Auf diesem Store liegt das Objekt "data". In diesem "Data"-Objekt liegt jetzt endlich das Array, in dem die gesamten Wertpaare als Objekt gespeichert sind.
								//Der Name dieses Arrays ist "items". Ein Element des Arrays "Items" ist wiederum ein Objekt mit vielen Eigenschaften. Eine Eigenschaft davon heißt "json".
								//Und auf dieser "json" Eigenschaft liegen jetzt endgültig die Werte als String, gespeichert.
								for (var i = 0; i < combo.store.data.items.length; ++i) {
									if(combo.store.data.items[i].json.Leistung == combo.startValue) {
										oldValue = combo.store.data.items[i].json.ID_Leistung;
									}
								}
								Ext.Ajax.request({
									waitTitle:'Connecting', 
									waitMsg:'Sending data...',
									url: 'index.php',
									params: {
										cmd:"HandlePackLeistung",
										ID_Package: PackGrid.getSelectionModel().getSelected().data.ID_Package,
										ID_Leistung: record.data.ID_Leistung,
										//leistungstag: record.data.leistungstag,
										oldText: combo.startValue,
										oldValue: oldValue
									},
									failure:function(response,options){
										Ext.example.msg('Status', 'not Updated, Errors occured!');
									},
									success:function(response,options){
										var responseData = Ext.util.JSON.decode(response.responseText);
										if(responseData.success == true) {
											packleistungStore.reload();
											packleistungStore.commitChanges();
											Ext.example.msg('Erfolg', 'Leistung erfolgreich dem Package zugeordnet!');
										} else {
											packleistungStore.reload();
											packleistungStore.commitChanges();
											Ext.example.msg('Fehler!', 'Diese Leistung ist bereits auf diesem Package zugeordnet!');
										}
									}
								});
							}
						}, 
						//Der Listener auf dem Blur Event ist notwendig, damit die Combobox keinen Zahlenwert anzeigt, falls man
						//in den Eingabemodus wechselt, keine Eingabe tätigt und danach den Eingabemodus wieder verlässt.
						//der Blur-Event wird ausgelöst, wenn der Eingabemodus der Combobox beendet wird.
						'blur': {
							fn: function() {packleistungStore.reload();}
						}
					}
                })
				},{
				header: 'Tag',
				width: 10,
				dataIndex: 'leistungstag',
				editor: new Ext.form.TextField({
					allowBlank:false
				
					
				})
				},{
				header: 'Uhrzeit',
				width: 30,
				dataIndex: 'StandardUhrzeit',
				//editor: new Ext.form.TextField({
				//	allowBlank: false
				//})
				}
			],
			stripeRows: true,
			viewConfig: {
				forceFit:true
			},    
			region:'east',
			sm: new Ext.grid.RowSelectionModel({
				singleSelect:true
			})
		});	
					
		
		
		
		var packageTab = new Ext.Panel({
			title:'Packages',
			closable:true,
			id:'packageTab',
			layout:'border',
			iconCls:'packages',
			items:[PackGrid,PackLeistungGrid]
		});
		
		//beim Schließen des Package-Tabs müssen auch sämtliche erzeugte Variablen wieder zerstört werden, damit der Referenz-Count auf 0 gestellt wird
		//damit der Garbage-Collector seine Arbeit erledigen kann.
		packageTab.addListener('beforedestroy',function() {
			packStore.destroy();
			packleistungStore.destroy();
			leistungStore.destroy();
		});
		
		
		//hier wird die gerade erstellte GridForm-Kombination an das TabPanel im Center-Bereich geadded
		Ext.getCmp('tabcenter').add(packageTab).show();
		//doLayout ist notwendig, wenn ein Item in einen bereits gerenderten Container nachträglich
		//eingepflegt wird. So wie die grid in das Tabpanel.
		Ext.getCmp('bl2_center').doLayout();

	
	} else Ext.getCmp('tabcenter').setActiveTab('packageTab');
}
