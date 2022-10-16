/************************************************************************************************
----------------------------Funktion, um einen Tab zum Mainbereich zu adden.----------------------------------
Ich habe mich für diese Variante entschieden, da somit das Initiieren des Programmes flotter geht. 
Beim Instanziieren eines neuen Tabs für das Center-Panel wird der jeweilige Programmteil nachgeladen. 
Ich bin der Meinung das diese Herangehensweise den Workflow des Users am wenigsten beeinträchtigt.
Technisch wäre es auch möglich, alle Tabs beim Ext.onReady()  Event zu laden. Man hätte dadurch den Vorteil
einer verkürzten Zeit während des Betriebes. Dafür dauert das initiierende Laden des Programmes um ein viel-
faches länger und nicht benötigte Programmteile werden gleich von Beginn an immer mitgeladen.
*************************************************************************************************/

function addPartnerTab(){
	//zuerst gehört gecheckt, ob es den Tab nicht vielleicht schon gibt.
	//wenn ja, wird er nur mehr focusiert, wenn nein werden die Grids, Forms und Stores erstellt
	//und alles läuft wie geschmiert :)
	if(document.getElementById('partnerTab') == null) {
				
		// create the data store
		var partnerStore = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url: 'index.php',
				method: 'POST'
			}),
			baseParams:{
				cmd: "FillPartnerGrid"
			},
			remoteSort:false,
			sortInfo: {field:'ID_Partner', direction:'DESC'},
			reader: new Ext.data.JsonReader({
				root: 'results',
				totalProperty: 'total'
			},Ext.data.Record.create([
				 {name: 'ID_Partner', type:'int'},
				 {name: 'firmenname', type:'string'},
				 {name: 'vorname', type:'string'},
				 {name: 'nachname', type:'string'},
				 {name: 'adresse', type:'string'},
				 {name: 'plz', type:'string'},
				 {name: 'ort', type:'string'},
				 {name: 'tel', type:'string'},
				 {name: 'email', type:'string'},
				 {name: 'letzteBearbeitung', type: 'date', dateFormat: 'Y-m-d'}
			  ])
			)
		});
		//das Polling nach neuen Datensätzen soll so lange true sein, bis ein Datensatz in Bearbeitung steht. Während dieser Bearbeitung
		//wird diese Eigenschaft auf false gesetzt und somit ein reload des stores verhindert.
		partnerStore._pollEnabled = true;
		partnerStore.addListener('update',function(st,rec,op) {
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
						key: 'ID_Partner',
						keyID: rec.data.ID_Partner,
						table:"tPartner",
						field: j,
						value: obj[j]
					},
					failure:function(response,options){
						Ext.example.msg('Status', 'not Updated, Errors occured!');
						
					},
					success:function(response,options){
						var responseJSON = Ext.decode(response.responseText);
	
						if(responseJSON.error==true) { //FEHLERBEHANDLUNG
							handleException(responseJSON);
						} else {
							if(responseJSON.success == true) {
								partnerStore.reload();
								partnerStore.commitChanges();
								Ext.example.msg('Status', 'Updated successfully!');
							} else Ext.example.msg('Fehler!', 'Leider kein Zugriff');
						}
					}
				});
			 }
		});
	
	
		//Pfad für Druck-Layout-Einstellungs-CSS:
		Ext.ux.GridPrinter.stylesheetPath = 'Templates/Application/css/grid_print.css';
	
		var partnerGrid = new Ext.grid.GridPanel({
			title:'Partner',
			frame: false,
			border:true,
			iconCls: 'partner',
			id:'partnerGrid',
			closable:true,
			store: partnerStore,
			columns: [
				{header: "Nr", width: 65, sortable: true, dataIndex: 'ID_Partner'},
				{header: "Firmenname", width: 115, sortable: true, dataIndex: 'firmenname'},
				{header: "Vorname", width: 115, sortable: true, dataIndex: 'vorname'},
				{header: "Nachname", width: 115, sortable: true, dataIndex: 'nachname'},
				{header: "Adresse", width: 90, sortable: true, dataIndex: 'adresse'},
				{header: "PLZ", width: 50, sortable: true, dataIndex: 'plz'},
				{header: "Ort", width: 90, sortable: true, dataIndex: 'ort'},
				{header: "Telefon", width: 115, sortable: true, dataIndex: 'tel'},
				{header: "eMail", width: 115, sortable: true, dataIndex: 'email'},
				{header: "Zuletzt bearb.", width: 90, sortable: true, xtype: 'datecolumn', format: 'd.m.Y', dataIndex: 'letzteBearbeitung'}
			],
			stripeRows: true,
			viewConfig: {
				forceFit:true
			},    
			layout:'fit',
			region:'center',
			sm: new Ext.grid.RowSelectionModel({
				singleSelect:true
			}),
			bbar: new Ext.PagingToolbar({
			  pageSize: 10,
			  store: partnerStore,
			  displayInfo: true,
			  plugins: new Ext.ux.ProgressBarPager()
			}),
			tbar: new Ext.Toolbar({
				items: [{tooltip:'Partner anzeigen',
					iconCls:'lesen',
					id:'partnerShowButton',
					handler:function() {
						var rec = partnerGrid.getSelectionModel().getSelected();
						if(rec) 
						{
							 //Datensatz Partner Anzeigen 
							 var showPartnerFS = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									defaults: {width: 200},
									bodyStyle:'padding:10px',
									defaultType: 'textfield',
									height: 'auto',
									border: false,
									items:[{
									  fieldLabel: 'Partner-ID',
									  readOnly:true,
									  disabled:true,
									  name: 'ID_Partner'
								  },{						  
									  fieldLabel: 'Firma/Partnername*',
									  readOnly:true,
									  name: 'firmenname'
								  },{						  
									  fieldLabel: 'Vorname*',
									  readOnly:true,
									  name: 'vorname'
								  },{						  
									  fieldLabel: 'Nachname*',
									  readOnly:true,
									  name: 'nachname'
								  },{
									  fieldLabel: 'Adresse',
									  readOnly:true,
									  name: 'adresse'
								  },{
									  fieldLabel: 'PLZ*',
									  readOnly:true,
									  name: 'plz'
								  },{
									  fieldLabel: 'Ort*',
									  readOnly:true,
									  name: 'ort'
								  },{						  
									  fieldLabel: 'Telefon*',
									  readOnly:true,
									  name: 'tel'
								  },{						  
									  fieldLabel: 'E-Mail*',
									  readOnly:true,
									  name: 'email'
								  },{						  
									  fieldLabel: 'Zuletzt bearbeitet*',
									  readOnly:true,
									  hideTrigger:true,
									  format: 'd.m.Y',
									  xtype:'datefield',
									  name: 'letzteBearbeitung'
								  }]
							 });
							 var showPartnerFP = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'partnerForm',
								items: [showPartnerFS],
								buttons: [{text:'Ok',
										   handler:function() {win.close();}}]
							});
					  
							var win = new Ext.Window({
								title:'Partnerdaten anzeigen',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [showPartnerFP]
							});
							showPartnerFP.getForm().loadRecord(partnerGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}	
					},
					width:50
				},{
					tooltip:'Partner bearbeiten',
					iconCls:'schreiben',
					id:'PartnerEditButton',
					handler:function() {
						//das Polling des Stores wird ausgeschalten, solange bis die Bearbeitung des Datensatzes abgeschlossen ist.
						partnerStore._pollEnabled = false;
						//der in der Grid selektierte Record aus dem Store wird vollständig in der Variable rec gespeichert, und in das FormPanel zum Bearbeiten geladen.
						var rec = partnerGrid.getSelectionModel().getSelected();
						//wenn diese if-Abfrage false ergibt ist kein Datensatz in der Grid selektiert und es wird ein entsprechender Hinweis ausgegeben.
						if(rec) 
						{
							//Datensatz Ändern 
							var writePartnerFS = new Ext.form.FieldSet({
								labelAlign: 'left',
								labelWidth: 150,
								layout:'form',
								defaults: {width: 200},
								bodyStyle:'padding:10px',
								defaultType: 'textfield',
								height: 'auto',
								border: false,
								items:[{
									  fieldLabel: 'Partner-ID',
									  disabled:true,
									  name: 'ID_Partner'
									},{
									  fieldLabel: 'Firmenname',
									  name: 'firmenname'
									},{
									  fieldLabel: 'Vorname',
									  allowBlank:false,
									  name: 'vorname'
									},{
									  fieldLabel: 'Nachname',
									  allowBlank:false,
									  name: 'nachname'
									},{
									  fieldLabel: 'Adresse',
									  allowBlank:false,
									  name: 'adresse'
									},{
									  fieldLabel: 'PLZ',
									  allowBlank:false,
									  name: 'plz'
									},{
									  fieldLabel: 'Ort',
									  allowBlank:false,
									  name: 'ort'
									},{
									  fieldLabel: 'Telefon',
									  name: 'tel'
									},{
									  fieldLabel: 'E-Mail',
									  name: 'email'
									}
								],
								buttons: [{ 
									text:'save',
									iconCls:'save',
									formBind: true,
									handler: function() {
										writePartnerFP.getForm().updateRecord(partnerGrid.getSelectionModel().getSelected());
										//das Polling für den Store wieder aktivieren...
										partnerStore._pollEnabled = true;
										win.close();
									}
								},{
									text: 'cancel',
									handler: function() {
										//das Polling für den Store wieder aktivieren...
										partnerStore._pollEnabled = true;
										win.close();
									}
								}]
							});
							
							 var writePartnerFP = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'PartnerForm',
								monitorValid:true,
								items: [writePartnerFS]
							});
					  
							var win = new Ext.Window({
								title:'Partner-Datensatz ändern',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [writePartnerFP]
							});
							writePartnerFP.getForm().loadRecord(partnerGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  },
					  width:50
				},{
					tooltip:'neuer Partner',
					iconCls:'add',
					id:'PartnerNewButton',
					handler: function() {
						 //Datensatz Neuer Partner
						 var neuPartnerFS = new Ext.form.FieldSet({
								labelAlign: 'left',
								labelWidth: 150,
								layout:'form',
								defaults: {width: 200},
								bodyStyle:'padding:10px',
								defaultType: 'textfield',
								height: 'auto',
								border: false,
								items:[{
									  fieldLabel: 'Firmenname',
									  name: 'firmenname'
								  },{
									  fieldLabel: 'Vorname',
									  allowBlank:false,
									  name: 'vorname'
								  },{
									  fieldLabel: 'Nachname',
									  allowBlank:false,
									  name: 'nachname'
								  },{
									  fieldLabel: 'Adresse',
									  allowBlank:false,
									  name: 'adresse'
								  },{
									  fieldLabel: 'PLZ',
									  allowBlank:false,
									  name: 'plz'
								  },{
									  fieldLabel: 'Ort',
									  allowBlank:false,
									  name: 'ort'
								  },{
									  fieldLabel: 'Telefon',
									  name: 'tel'
								  },{
									  fieldLabel: 'E-Mail',
									  name: 'email'
								  }]
						 });
						 var neuPartnerFP = new Ext.form.FormPanel({
							labelAlign: 'left',
							id:'PartnerForm',
							monitorValid:true,
							url:'index.php',
							items: [neuPartnerFS],
							buttons: [{
							  text: 'Save',
							  formBind: true,
							  iconCls:'save',
							  handler: function(){ 
								neuPartnerFP.getForm().submit({ 
									method:'POST', 
									waitTitle:'Connecting', 
									waitMsg:'Sending data...',
									params: {
										cmd:'InsertPartner'										
									},
									success:function(form, action){ 
										if(action.result.success == true) {
											Ext.example.msg('Status', 'Saved successfully!');
											partnerStore.reload();
										} else {
											Ext.example.msg('Fehler', 'Nicht gespeichert!!');
										}
										win.close();
									},
									failure:function(form, action){ 
										if(action.failureType == 'server'){ 
											Ext.example.msg('Not Saved. Server-Error Occured.');
										}else{ 
											Ext.example.msg('Warning!', 'Server is unreachable at the Moment: ' + action.response.responseText);
										} 
										win.close();
									} 
								}); 
							}
						  },{
							  text: 'Cancel',
							  handler: function() {win.close();}
						  }]
						});
				  
						var win = new Ext.Window({
							title:'Partner-Datensatz hinzufügen',
							closable:true,
							width:420,
							border:true,
							resizable:false,
							modal:true,
							items: [neuPartnerFP]
						});
						win.show(this);
					  },
					  width:50
				},{
					tooltip:'Partner löschen',
					iconCls:'delete',
					id:'PartnerDeleteButton',
					handler: function() {
						var rec = partnerGrid.getSelectionModel().getSelected();
						if(rec) 
						{							
						  Ext.Msg.show({
							   title:'wirklich löschen?',
							   msg: 'Sie sind dabei, einen Partner zu löschen. Wollen Sie diesen Partner wirklich löschen?',
							   buttons: Ext.Msg.YESNO,
							   fn: function(buttonID) {
									if(buttonID=='yes') {
										  Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
												waitTitle:'Connecting', 
												waitMsg:'updating data...',
												url: 'index.php',
												params: {
													cmd:"Update",
													key: 'ID_Partner',
													keyID: partnerGrid.getSelectionModel().getSelected().data.ID_Partner,
													table:"tPartner",
													field: 'aktiv',
													value: 0
												},
												failure:function(response,options){
													Ext.example.msg('Status', 'Not deleted! Error Occured!');
												},
												success:function(response,options){
													var responseData = Ext.util.JSON.decode(response.responseText);
													if(responseData.success == true) {
														partnerStore.reload();
														partnerStore.commitChanges();
														Ext.example.msg('Status', 'Deleted successfully!');
													} else {
														Ext.example.msg('Fehler', 'Keine Berechtigung');
													}
												}
											});
										  partnerStore.reload(); 			            		  			
									}
							   },
							   icon: Ext.MessageBox.QUESTION
						  });
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  },
					  iconCls:'delete',
					  width:50
				},{
						tooltip:'Partner Mail',
						iconCls:'email',
						id:'KundenMailButton',
						width:50,
						handler:function() {
						
							if(partnerGrid.getSelectionModel().hasSelection()) {
								var MailFS = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									title:'Mail',
									bodyStyle:'padding:10px',
									defaults: {width: 200},
									defaultType: 'textfield',
									border: false,
									items:[{
											  fieldLabel: 'Betreff',
											  xtype: 'textfield',
											  name: 'subject'
										  },{
											  fieldLabel: 'Text',
											  xtype: 'textarea',
											  name: 'body'
										  }]
								});
						  
								var neuMailFP = new Ext.form.FormPanel({
									labelAlign: 'left',
									monitorValid:true,
									url:'index.php',
									items: [MailFS],
									buttons: [{
									  text: 'Send',
									  formBind: true,
									  iconCls:'email',
									  handler: function(){ 
										neuMailFP.getForm().submit({ 
											method:'POST', 
											waitTitle:'Connecting', 
											waitMsg:'Sending data...',
											params: {
												cmd:'Mail',
												to:partnerGrid.getSelectionModel().getSelected().data.email
											},
											success:function(form, action) { 
												Ext.example.msg('Success', 'Mail erfolgreich gesendet!');
												win.close();
											},
											failure:function(form, action) { 
												var responseJSON = Ext.decode(action.response.responseText);
												handleException(responseJSON); 
											} 
										}); 
									}
								  },{
									  text: 'Cancel',
									  handler: function() {win.close();}
								  }]
								});
						  
								var win = new Ext.Window({
									title:'Partner-Mail',
									closable:true,
									width:420,
									border:true,
									resizable:false,
									modal:true,
									items: [neuMailFP]
								});
								win.show(this);
							} else {
								Ext.example.msg('Fehler', 'Kein Datensatz ausgewählt.');
							}
						  },
						  width:50
					},{
					tooltip:'Tabelle drucken',
					iconCls:'print',
					id:'DruckenButton',
					width:50,
					handler:function() {
						//nachträglich eininstalliertes extjs-Plugin
						Ext.ux.GridPrinter.print(partnerGrid);
					}
				},'->',{
					xtype:'textfield',
					name:'searchfield',
					id:'partnersuchfeld',
					enableKeyEvents:true,
					emptyText:'Partner suchen...'
				}]
			})
		});	 
		
		//dieser Event wird bei jedem Keyup-Event des Suchfeldes ausgelöst. Wir machen nach jedem Buchstaben einen AJAX-Request und
		//schießen das Ergebnis dieses neuen Requests an den Store. Hoffentlich ist der Datenbankzugriff schnell genug damit sich dieser geile
		//moderne Effekt den ich mir vorstelle auch zu 100% entfaltet... --> wenn dieser Kommentar in der Endversion noch enthalten ist, dann gehts :)
		Ext.getCmp('partnersuchfeld').addListener('keyup',function(tf,e) {
			partnerStore.reload({params:{suchen:tf.getValue(),start:0, limit:10}});
		});

		//beim Schließen des Partner-Tabs müssen auch sämtliche erzeugte Variablen wieder zerstört werden, damit der Referenz-Count auf 0 gestellt wird
		//damit der Garbage-Collector seine Arbeit erledigen kann.
		partnerGrid.addListener('beforedestroy',function() {
			partnerStore.destroy();
		});
		//die ersten 10 Datensätze in den Store laden (Event an die Grid)
		pollForChanges(partnerGrid,true);
		//hier wird die gerade erstellte GridForm-Kombination an das TabPanel im Center-Bereich geadded
		Ext.getCmp('tabcenter').add(partnerGrid).show();
		//doLayout ist notwendig, wenn ein Item in einen bereits gerenderten Container nachträglich
		//eingepflegt wird. So wie die grid in das Tabpanel.
		Ext.getCmp('bl2_center').doLayout();
	} else Ext.getCmp('tabcenter').setActiveTab('partnerGrid');
}