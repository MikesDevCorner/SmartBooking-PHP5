/************************************************************************************************
----------------------------Funktion, um einen Tab zum Mainbereich zu adden.----------------------------------
Ich habe mich für diese Variante entschieden, da somit das Initiieren des Programmes flotter geht. 
Beim Instanziieren eines neuen Tabs für das Center-Panel wird der jeweilige Programmteil nachgeladen. 
Ich bin der Meinung das diese Herangehensweise den Workflow des Users am wenigsten beeinträchtigt.
Technisch wäre es auch möglich, alle Tabs beim Ext.onReady()  Event zu laden. Man hätte dadurch den Vorteil
einer verkürzten Zeit während des Betriebes. Dafür dauert das initiierende Laden des Programmes um ein viel-
faches länger und nicht benötigte Programmteile werden gleich von Beginn an immer mitgeladen.
*************************************************************************************************/

function addJugendherbergenTab(){
	//zuerst gehört gecheckt, ob es den Tab nicht vielleicht schon gibt.
	//wenn ja, wird er nur mehr focusiert, wenn nein werden die Grids, Forms und Stores erstellt
	//und alles läuft wie geschmiert :)
	if(document.getElementById('JhbTeilung') == null) {
	
	
	
/***************************************************************************************************/
/**********   Hier startet der Hauptbereich für die Jungen Hotels. Liegt im Zentrum des Hauptpanels   ************/
/***************************************************************************************************/	
	
	// create the data store Junge Hotels
		var jhbStore = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url: 'index.php',
				method: 'POST'
			}),
			remoteSort:true,
			baseParams:{
				cmd: "FillJhbGrid"
			},
			sortInfo: {field:'jhb', direction:'ASC'},
			reader: new Ext.data.JsonReader({
				root: 'results',
				totalProperty: 'total'
			},Ext.data.Record.create([
				 {name: 'ID_Jhb', type:'int'},
				 {name: 'jhb', type:'string'},
				 {name: 'adresse', type:'string'},
				 {name: 'plz', type:'string'},
				 {name: 'ort', type:'string'}
			  ])
			)
		});
		//das Polling nach neuen Datensätzen soll so lange true sein, bis ein Datensatz in Bearbeitung steht. Während dieser Bearbeitung
		//wird diese Eigenschaft auf false gesetzt und somit ein reload des stores verhindert.
		//jhbStore._pollEnabled = false;
		jhbStore.addListener('update',function(st,rec,op) {
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
							key: 'ID_Jhb',
							keyID: rec.data.ID_Jhb,
							table:"tJhb",
							field: j,
							value: obj[j]
						},
						failure:function(response,options){
							Ext.example.msg('Status', 'not Updated, Errors occured!');
						},
						success:function(response,options){
							var responseData = Ext.util.JSON.decode(response.responseText);
							if(responseData.success == true) {
								jhbStore.reload();
								jhbStore.commitChanges();
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

		var JhbGrid = new Ext.grid.GridPanel({
			//title:'Junge Hotels',
			frame: false,
			border:true,
			//iconCls: 'herbergen',
			id:'JhbGrid',
			//closable:true,
			store: jhbStore,
			columns: [
				{header: "Nr", width: 15, sortable: false, dataIndex: 'ID_Jhb'},
				{header: "Junge Hotels", width: 50, sortable: false, dataIndex: 'jhb'},
				{header: "Adresse", width: 50, sortable: false, dataIndex: 'adresse'},
				{header: "Plz", width: 20, sortable: false, dataIndex: 'plz'},
				{header: "Ort", width: 50, sortable: false, dataIndex: 'ort'}
			],
			stripeRows: true,
			viewConfig: {
				forceFit:true
			}, 
			region:'center',
			sm: new Ext.grid.RowSelectionModel({
				singleSelect:true

				
			}),
			bbar: new Ext.PagingToolbar({
			  pageSize: 10,
			  store: jhbStore,
			  displayInfo: true,
			  plugins: new Ext.ux.ProgressBarPager()
			}),
			tbar: new Ext.Toolbar({
				items: [{
					tooltip:'Junge Hotels anzeigen',
					iconCls:'lesen',
					width:50,
					id:'JhbShowButton',
					handler:function() {
						var rec = JhbGrid.getSelectionModel().getSelected();
						if(rec) 
						{
							 //Datensatz Junge Hotels Anzeigen 
							 var showJhb = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									defaults: {width: 200},
									bodyStyle:'padding:10px',
									defaultType: 'textfield',
									height: 'auto',
									border: false,
									items:[{
									  fieldLabel: 'Hotel-ID',
									  readOnly:true,
									  name: 'ID_Jhb'
								  },{						  
									  fieldLabel: 'Junges Hotel*',
									  allowBlank:false,
									  name: 'jhb'
								  },{
									  fieldLabel: 'Adresse',
									  allowBlank:false,
									  name: 'adresse'
								  },{
									  fieldLabel: 'PLZ*',
									  allowBlank:false,
									  name: 'plz'
								  },{
									  fieldLabel: 'Ort*',
									  allowBlank:false,
									  name: 'ort'
								  }]
							 });
							 
							 var showJhbFP = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'ticketForm',
								items: [{
									//xtype:'tabpanel',
									activeTab: 0,
									defaults:{autoHeight:true}, 
									items:[showJhb]
								}],
								buttons: [{text:'Ok',
										   handler:function() {win.close();}}]
							});
					  
							var win = new Ext.Window({
								title:'Daten Junge Hotels anzeigen',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [showJhbFP]
							});
							showJhbFP.getForm().loadRecord(JhbGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}	
					  }
				},{
					tooltip:'Junge Hotels bearbeiten',
					iconCls:'schreiben',
					width:50,
					id:'JhbEditButton',
					handler:function() {
						//das Polling des Stores wird ausgeschalten, solange bis die Bearbeitung des Datensatzes abgeschlossen ist.
						//jhbStore._pollEnabled = false;
						//der in der Grid selektierte Record aus dem Store wird vollständig in der Variable rec gespeichert, und in das FormPanel zum Bearbeiten geladen.
						var rec = JhbGrid.getSelectionModel().getSelected();
						//wenn diese if-Abfrage false ergibt ist kein Datensatz in der Grid selektiert und es wird ein entsprechender Hinweis ausgegeben.
						if(rec) 
						{
							 //Daten Junge Hotels Ändern 
							 var writeJhbAendern = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									defaults: {width: 200},
									bodyStyle:'padding:10px',
									defaultType: 'textfield',
									//title:'Ändern der Daten',
									height: 'auto',
									border: false,
									items:[{
									  fieldLabel: 'Hotel-ID',
									  readOnly:true,
									  name: 'ID_Jhb'
								  },{						  
									  fieldLabel: 'Junges Hotel*',
									  allowBlank:false,
									  name: 'jhb'
								  },{
									  fieldLabel: 'Adresse',
									  allowBlank:false,
									  name: 'adresse'
								  },{
									  fieldLabel: 'PLZ*',
									  allowBlank:false,
									  name: 'plz'
								  },{
									  fieldLabel: 'Ort*',
									  allowBlank:false,
									  name: 'ort'
								  }]
							 });
							  
							var writeJhbFP = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'JhbForm',
								monitorValid:true,
								items: [{
									//xtype:'tabpanel',
									activeTab: 0,
									defaults:{autoHeight:true}, 
									items:[writeJhbAendern]
								}],
								buttons: [{ text:'save',
											iconCls:'save',
											formBind: true,
											handler: function() {
												writeJhbFP.getForm().updateRecord(JhbGrid.getSelectionModel().getSelected());
												//das Polling für den Store wieder aktivieren...
												//jhbStore._pollEnabled = true;
												win.close();
											}
										  },{
											text: 'cancel',
											handler: function() {
												//das Polling für den Store wieder aktivieren...
												//jhbStore._pollEnabled = true;
												win.close();
											}
										  }
										 ]
							});
					  
							var win = new Ext.Window({
								title:'Daten Junge Hotels ändern',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [writeJhbFP]
							});
							writeJhbFP.getForm().loadRecord(JhbGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  },
				},{
					tooltip:'Junge Hotels neuanlegen',
					iconCls:'add',
					id:'JhbNewButton',
					width:50,
					handler:function() {
					var neuJhb = new Ext.form.FieldSet({
							labelAlign: 'left',
							labelWidth: 150,
							layout:'form',
							defaults: {width: 200},
							defaultType: 'textfield',
							bodyStyle:'padding:10px',
							//title:'Junges Hotel neu anlegen',
							height: 'auto',
							border: false,
							items:[{
									  fieldLabel: 'Junges Hotel*',
									  allowBlank:false,
									  name: 'jhb'
								  },{
									  fieldLabel: 'Adresse',
									  allowBlank:false,
									  name: 'adresse'
								  },{
									  fieldLabel: 'PLZ*',
									  allowBlank:false,
									  name: 'plz'
								  },{
									  fieldLabel: 'Ort*',
									  allowBlank:false,
									  name: 'ort'
								  }]
						 });
						 var formjhbanlegen = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'ticketForm',
								url:'index.php',
								buttons: [{
									text: 'Save',
									formBind: true,
									  iconCls:'save',
									  handler: function(){ 
										formjhbanlegen.getForm().submit({ 
											method:'POST', 
											waitTitle:'Connecting', 
											waitMsg:'Sending data...',
											params: {
												cmd:'InsertJhb'										
											},
											success:function(form, action){ 
												if(action.result.success == true) {
													Ext.example.msg('Status', 'Saved successfully!');
													jhbStore.reload();
												} else {
													Ext.example.msg('Fehler', 'Nicht gespeichert!!');
												}
											anlegenjhbwindow.close();
											},
											failure:function(form, action){ 
												if(action.failureType == 'server'){ 
													Ext.example.msg('Not Saved. Server-Error Occured.');
												}else{ 
													Ext.example.msg('Warning!', 'Server is unreachable at the Moment: ' + action.response.responseText);
												} 
												anlegenjhbwindow.close();
											} 
										}); 
									}
								  },{
									  text: 'Cancel',
									  handler: function() {anlegenjhbwindow.close();}
								  }],
								items: [neuJhb]	 
						 });
						 
						 
						 var anlegenjhbwindow = new Ext.Window ({
							title:'Junges Hotel anlegen',
								closable:true,
								width:500,
								border:true,
								resizable:false,
								modal:true,
								items: [formjhbanlegen]
							});
							anlegenjhbwindow.show(this);
							
					}
				},{
					tooltip:'Junge Hotels löschen',
					handler: function() {
					var rec = JhbGrid.getSelectionModel().getSelected();
						if(rec) 
						{							
						  Ext.Msg.show({
							   title:'wirklich löschen?',
							   msg: 'Sie sind dabei, ein Junges Hotel zu löschen. Wollen Sie dieses wirklich löschen?',
							   buttons: Ext.Msg.YESNO,
							   fn: function(buttonID) {
									if(buttonID=='yes') {
										  Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
												waitTitle:'Connecting', 
												waitMsg:'updating data...',
												url: 'index.php',
												params: {
													cmd:"Update",
													key: 'ID_Jhb',
													keyID: JhbGrid.getSelectionModel().getSelected().data.ID_Jhb,
													table:"tJhb",
													field: 'aktiv',
													value: 0
												},
												failure:function(response,options){
													Ext.example.msg('Status', 'Not deleted! Error Occured!');
												},
												success:function(response,options){
													var responseData = Ext.util.JSON.decode(response.responseText);
													if(responseData.success == true) {
														jhbStore.reload();
														jhbStore.commitChanges();
														Ext.example.msg('Status', 'Deleted successfully!');
													} else {
														Ext.example.msg('Fehler', 'Keine Berechtigung');
													}
												}
											});
										  jhbStore.reload(); 			            		  			
									}
							   },
							   icon: Ext.MessageBox.QUESTION
						  });
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  },
					iconCls:'delete',
					id:'JhbDeleteButton',
					width:50,
					
				},{
					tooltip:'Tabelle drucken',
					iconCls:'print',
					id:'DruckenButton',
					width:50,
					handler:function() {
						//nachträglich eininstalliertes extjs-Plugin
						Ext.ux.GridPrinter.print(leistungsGrid);
					}
				},'->',{
					xtype:'textfield',
					name:'searchfield',
					id:'jhbsuchfeld',
					enableKeyEvents:true,
					emptyText:'Junge Hotels suchen...'
				}]
			})
		});	 
		//dieser Event wird bei jedem Keyup-Event des Suchfeldes ausgelöst. Wir machen nach jedem Buchstaben einen AJAX-Request und
		//schießen das Ergebnis dieses neuen Requests an den Store. Hoffentlich ist der Datenbankzugriff schnell genug damit sich dieser geile
		//moderne Effekt den ich mir vorstelle auch zu 100% entfaltet... --> wenn dieser Kommentar in der Endversion noch enthalten ist, dann gehts :)
		Ext.getCmp('jhbsuchfeld').addListener('keyup',function(tf,e) {
			jhbStore.reload({params:{suchen:tf.getValue(),start:0, limit:10}});
		});
		
		
		//Jedesmal, wenn eine Zeile in der Grid ausgewählt wird, werden die Daten im jhbpackStore neu geladen!!
		//Dieser Listener lauscht auf den 'rowselect' - Event, den das SelectionModel der Grid aussendet.
		JhbGrid.getSelectionModel().addListener('rowselect',function() {
			jhbpackStore.load({
				params:{ID_Jhb:JhbGrid.getSelectionModel().getSelected().data.ID_Jhb},
				callback: function(rec,opti,succ) {
					var JSON_Data = JhbGrid.getStore().reader.jsonData;
					if(JSON_Data.error==true) { //FEHLERBEHANDLUNG
						Ext.example.msg("Type: "+JSON_Data.type, JSON_Data.message); //weiter Unterscheidung mit Fehler-Objekt
					} else {
						if(JSON_Data.total == 0) {
							Ext.example.msg('Status', 'Noch keine Packages für dieses Hotel angelegt...');
						} 
					}
				}
			});
			JhbPackGrid.getTopToolbar().setVisible(true);
			JhbPackGrid.setTitle('Packages von: '+JhbGrid.getSelectionModel().getSelected().data.jhb);
		});
		
		
		//die ersten 10 Datensätze in den Store laden (Event an die Grid)
		pollForChanges(JhbGrid,true);
		
		
/*************************************************************************************************/
/**************   Hier startet der Bereich für die Packages im Ost-Bereich des Hauptpanels.    ****************/
/*************************************************************************************************/

		// Dieser Store versorgt die folgende Grid mit Einträgen. Es sind alle Datensätze, die auf die Jugendherberge bezogen in der Tabelle
		//tJhb_Package gespeichert sind!
		var jhbpackStore = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url: 'index.php',
				method: 'POST'
			}),
			remoteSort:true,
			baseParams:{
				cmd: "FillJhbPackGrid"
			},
			reader: new Ext.data.JsonReader({
				root: 'results',
				totalProperty: 'total'
			},Ext.data.Record.create([
				 {name: 'ID_Package', type:'int'},
				 {name: 'packagename', type:'string'}
			  ])
			)
		});
		
		//Dieser Store versorgt die ComboBox in der folgenden EditorGrid mit den Packages
		//Es werden alle Packages gespeichert!
		var packageStore = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url: 'index.php',
				method: 'POST'
			}),
			reader: new Ext.data.JsonReader({
				root: 'results',
				totalProperty: 'total',
				id: 'ID_Package'
			},Ext.data.Record.create([
					{name: 'ID_Package', type: 'int'},
					{name: 'packagename', type: 'string'}
				])),
			baseParams:{
				start: 0,
				cmd: "GetPackage"
			},
			autoLoad: true	
		});
		
		
		var JhbPackGrid = new Ext.grid.EditorGridPanel({
			frame: true,
			enableHdMenu: false,
			border:true,
			width:200,
			id:'JhbPackGrid',
			tbar: new Ext.Toolbar({
				hidden: true,
				items: [{
					tooltip:'Package hinzufügen',
					iconCls:'add',
					id:'addPackage',
					width:50,
					handler: function() {
						//Diese Button wird ein neues Element mit dem Standartnamen 'neues Package' in den jhbpackSore hinzufügen.
						//ACHTUNG: Dieses Element existiert nur im Store und wird nicht in die Datenbank geschrieben.
						//Erst wenn der Standartname durch wählen in der Combobox abgeändert wird, wird in die Datenbank geschrieben
						//konkret passiert das Schreiben in die Datenbank im Listener der am ColumnModel-Editor der ComboBox auf den 'change'-Event lauscht.
						var Package = JhbPackGrid.getStore().recordType;
						var p = new Package({
							packagename: 'neues Package'
						});
						JhbPackGrid.stopEditing();
						jhbpackStore.insert(0, p);
						JhbPackGrid.startEditing(0, 0);
					}
				},{
					tooltip:'Package löschen',
					iconCls:'delete',
					id:'delPackage',
					width:50,
					handler: function() {
						Ext.Ajax.request({
							waitTitle:'Connecting', 
							waitMsg:'Sending data...',
							url: 'index.php',
							params: {
								cmd:"HandleJhbPack",
								ID_Jhb: JhbGrid.getSelectionModel().getSelected().data.ID_Jhb,
								ID_Package: JhbPackGrid.getSelectionModel().getSelected().data.ID_Package,
								remove: 1
							},
							failure:function(response,options){
								Ext.example.msg('Status', 'not Deleted, Errors occured!');
							},
							success:function(response,options){
								var responseData = Ext.util.JSON.decode(response.responseText);
								if(responseData.success == true) {
									jhbpackStore.reload();
									jhbpackStore.commitChanges();
									Ext.example.msg('Erfolg', 'Package erfolgreich vom Standort entfernt!');
								} else {
									Ext.example.msg('Fehler!', 'Dieses Package ist bereits auf diesem Standort zugeordnet!');
								}
							}
						});
					}
				}]
			}),
			store: jhbpackStore,
			title: 'Package',
			clicksToEdit:2,	
			//Das Columnmodel in der Editorgrid ist etwas erweitert, im Vergleich zu der normalen Grid.
			//Es wird zusätzlich ein Editor benötigt, um festzulegen, wie die Änderung der Gridzelle abgehandelt werden soll.
			columns: [
				{ 
				width: 50, 
				dataIndex: 'packagename',
				editor: new Ext.form.ComboBox({
                    fieldLabel: 'Package*',
					xtype:'combo',
					allowBlank:false,
					editable:false,
					id:'currentCombo',
					forceSelection:true,
					name:'packagename',
					triggerAction:'all',
					mode: 'local',
					//um alle Packages aus der DB in dieser Combobox anzeigen zu können, müssen wir einen Store erstellen
					//und diesen über den CmdGetPackage-Command befüllen lassen.
					store: packageStore,
					valueField: 'ID_Package',
					displayField: 'packagename',
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
									if(combo.store.data.items[i].json.packagename == combo.startValue) {
										oldValue = combo.store.data.items[i].json.ID_Package;
									}
								}
								Ext.Ajax.request({
									waitTitle:'Connecting', 
									waitMsg:'Sending data...',
									url: 'index.php',
									params: {
										cmd:"HandleJhbPack",
										ID_Jhb: JhbGrid.getSelectionModel().getSelected().data.ID_Jhb,
										ID_Package: record.data.ID_Package,
										oldText: combo.startValue,
										oldValue: oldValue
									},
									failure:function(response,options){
										Ext.example.msg('Status', 'not Updated, Errors occured!');
									},
									success:function(response,options){
										var responseData = Ext.util.JSON.decode(response.responseText);
										if(responseData.success == true) {
											jhbpackStore.reload();
											jhbpackStore.commitChanges();
											Ext.example.msg('Erfolg', 'Package erfolgreich dem Standort zugeordnet!');
										} else {
											jhbpackStore.reload();
											jhbpackStore.commitChanges();
											Ext.example.msg('Fehler!', 'Dieses Package ist bereits auf diesem Standort zugeordnet!');
										}
									}
								});
							}
						}, 
						//Der Listener auf dem Blur Event ist notwendig, damit die Combobox keinen Zahlenwert anzeigt, falls man
						//in den Eingabemodus wechselt, keine Eingabe tätigt und danach den Eingabemodus wieder verlässt.
						//der Blur-Event wird ausgelöst, wenn der Eingabemodus der Combobox beendet wird.
						'blur': {
							fn: function() {jhbpackStore.reload();}
						}
					}
                })
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

/*************************************************************************************************/
/********************    Mergen der beiden Teile JHB und PACKAGES in ein einziges Panel   ****************/
/*************************************************************************************************/
		
		var JhbTeilung = new Ext.Panel({
			title:'Junge Hotels',
			closable:true,
			id:'JhbTeilung',
			layout:'border',
			iconCls:'herbergen',
			items:[JhbGrid,JhbPackGrid]
		});
		
		//beim Schließen des Jungen Hotels-Tabs müssen auch sämtliche erzeugte Variablen wieder zerstört werden, damit der Referenz-Count auf 0 gestellt wird
		//damit der Garbage-Collector seine Arbeit erledigen kann.
		JhbTeilung.addListener('beforedestroy',function() {
			jhbStore.destroy();
			jhbpackStore.destroy();
			packageStore.destroy();
		});
		
		//hier wird das erstellte Teilungsgrid an das TabPanel im Center-Bereich geadded
		Ext.getCmp('tabcenter').add(JhbTeilung).show();
		//doLayout ist notwendig, wenn ein Item in einen bereits gerenderten Container nachträglich
		//eingepflegt wird. So wie das Panel in das Tabpanel.
		Ext.getCmp('bl2_center').doLayout();

	
	} else Ext.getCmp('tabcenter').setActiveTab('JhbTeilung');
}
