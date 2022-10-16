/************************************************************************************************
----------------------------Funktion, um einen Tab zum Mainbereich zu adden.----------------------------------
Ich habe mich für diese Variante entschieden, da somit das Initiieren des Programmes flotter geht. 
Beim Instanziieren eines neuen Tabs für das Center-Panel wird der jeweilige Programmteil nachgeladen. 
Ich bin der Meinung das diese Herangehensweise den Workflow des Users am wenigsten beeinträchtigt.
Technisch wäre es auch möglich, alle Tabs beim Ext.onReady()  Event zu laden. Man hätte dadurch den Vorteil
einer verkürzten Zeit während des Betriebes. Dafür dauert das initiierende Laden des Programmes um ein viel-
faches länger und nicht benötigte Programmteile werden gleich von Beginn an immer mitgeladen.
*************************************************************************************************/

function addKundenTab(){
	//zuerst gehört gecheckt, ob es den Tab nicht vielleicht schon gibt.
	//wenn ja, wird er nur mehr focusiert, wenn nein werden die Grids, Forms und Stores erstellt
	if(document.getElementById("kundenGrid") == null) {
		
		// create the data store
		var kundenStore = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url: 'index.php',
				method: 'POST'
			}),
			baseParams:{
				cmd: "FillKundenGrid"
			},
			sortInfo: {field:'ID_Kunde', direction:'DESC'},
			reader: new Ext.data.JsonReader({
				root: 'results',
				totalProperty: 'total'
			},Ext.data.Record.create([
				 {name: 'ID_Kunde', type:'int'},
				 {name: 'kategoriek', type:'string'},
				 {name: 'organisation', type:'string'},
				 {name: 'adresse', type:'string'},
				 {name: 'plz', type:'string'},
				 {name: 'ort', type:'string'},
				 {name: 'telefon', type:'string'},
				 {name: 'fax', type:'string'},
				 {name: 'email', type:'string'},
				 {name: 'resykd', type:'string'},
				 {name: 'username', type:'string'},
				 {name: 'letzteBearbeitung', type:'date', dateFormat: 'Y-m-d'},
				 {name: 'bemerkung', type:'string'},
				 {name: 'erstelltAm', type: 'date', dateFormat: 'Y-m-d'}
			  ])
			)
		});
		//das Polling nach neuen Datensätzen soll so lange true sein, bis ein Datensatz in Bearbeitung steht. Während dieser Bearbeitung
		//wird diese Eigenschaft auf false gesetzt und somit ein reload des stores verhindert.
	
		kundenStore.addListener('update',function(st,rec,op) {
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
							key: 'ID_Kunde',
							keyID: rec.data.ID_Kunde,
							table:"tKunde",
							field: j,
							value: obj[j]
						},
						failure:function(response,options){
							Ext.example.msg('Status', 'not Updated, Errors occured!');
							
						},
						success:function(response,options){
							var responseData = Ext.util.JSON.decode(response.responseText);
							if(responseData.success == true) {
								kundenStore.reload();
								kundenStore.commitChanges();
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
		
		var kundenGrid = new Ext.grid.GridPanel({
			title:'Kunden',
			frame: false,
			border:true,
			iconCls: 'kunden',
			id:'kundenGrid',
			closable:true,
			store: kundenStore,
			columns: [
				{header: "Nr", width: 65, sortable: false, dataIndex: 'ID_Kunde'},
				{header: "Übernommen am", width: 95, sortable: false, xtype: 'datecolumn', format: 'd.m.Y', dataIndex: 'erstelltAm'},
				{header: "Organisation", width: 135, sortable: false, dataIndex: 'organisation'},
				{header: "PLZ", width: 115, sortable: false, dataIndex: 'plz'},
				{header: "Ort", width: 115, sortable: false, dataIndex: 'ort'},
				{header: "Resy Knr.", width: 115, sortable: false, dataIndex: 'resykd'},
				{header: "eMail", width: 115, sortable: false, dataIndex: 'email'}
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
			  store: kundenStore,
			  displayInfo: true,
			  plugins: new Ext.ux.ProgressBarPager()
			}),
			tbar: new Ext.Toolbar({
				items: [{
					tooltip:'Kunde anzeigen',
					iconCls:'lesen',
					id:'KundenShowButton',
					width:50,
					handler:function() {
					
					
					var rec = kundenGrid.getSelectionModel().getSelected();
						if(rec) 
						{
							 //Datensatz Anzeigen - Fieldset (Kundendaten) 
							 var Kundanz = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									defaults: {width: 200},
									bodyStyle:'padding:10px',
									defaultType: 'textfield',
									title:'Kundendaten',
									height: 'auto',
									border: false,
									items:[{
										  fieldLabel: 'Kunde-ID',
										  disabled:true,
										  readOnly:true,											  
										  name: 'ID_Kunde'
									  },{
										  fieldLabel: 'Kategorie',
										  readOnly:true,
										  name: 'kategoriek'
									  },{
										  fieldLabel: 'Organisation',
										  readOnly:true,
										  name: 'organisation'
									  },{
										  fieldLabel: 'Adresse',
										  readOnly:true,
										  name: 'adresse'
									  },{
										  fieldLabel: 'Plz',
										  readOnly:true,
										  hideTrigger:true,
										  name: 'plz'
									  },{
										  fieldLabel: 'Ort',
										  readOnly:true,
										  hideTrigger:true,
										  name: 'ort'
									  },{
										  fieldLabel: 'Telefon',
										  readOnly:true,
										  name: 'telefon'
									  },{
										  fieldLabel: 'Fax',
										  readOnly:true,
										  name: 'fax'
									  },{
										  fieldLabel: 'E-Mail',
										  readOnly:true,
										  name: 'email'
									  },{
										  fieldLabel: 'ResyKdNr.',
										  readOnly:true,
										  name: 'resykd'
									  },{
										  fieldLabel: 'Letzte Bearbeitung',
										  readOnly:true,
										  hideTrigger:true,
										  format: 'd.m.Y',
										  xtype:'datefield',
										  name: 'letzteBearbeitung'
									  },{
										  fieldLabel: 'Username',
										  readOnly:true,
										  name: 'username'
									  },{
										  fieldLabel: 'Bemerkung',
										  readOnly:true,
										  xtype: 'textarea',
										  name: 'bemerkung'
									  },{
										  fieldLabel: 'Erstellt am',
										  readOnly:true,
										  hideTrigger:true,
										  format: 'd.m.Y',
										  xtype:'datefield',
										  name: 'erstelltAm'
									  }]
							 });
							 
							 
							 
							var showKundanze = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'ticketForm',
								items: [{
									//xtype:'tabpanel',
									activeTab: 0,
									defaults:{autoHeight:true}, 
									items:[Kundanz]
								}],
								buttons: [{text:'Ok',
										   handler:function() {win.close();}}]
							});
					  
							var win = new Ext.Window({
								title:'Kunden-Datensatz anzeigen',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [showKundanze]
							});
							showKundanze.getForm().loadRecord(kundenGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}	
					  }
				 
					},
					
				{
					tooltip:'Kunde bearbeiten',
					iconCls:'schreiben',
					id:'KundenEditButton',
					width:50,
					handler:function() {
						
					
						
						
						//der in der Grid selektierte Record aus dem Store wird vollständig in der Variable rec gespeichert, und in das FormPanel zum Bearbeiten geladen.
						var rec = kundenGrid.getSelectionModel().getSelected();
						//wenn diese if-Abfrage false ergibt ist kein Datensatz in der Grid selektiert und es wird ein entsprechender Hinweis ausgegeben.
						if(rec) 
						{
							 //Datensatz Ändern -  Fieldset (Kundendaten) 
							 var Kunden = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									defaults: {width: 200},
									bodyStyle:'padding:10px',
									defaultType: 'textfield',
									title:'Kundendaten',
									height: 'auto',
									border: false,
									items:[{
										  fieldLabel: 'Kunden-ID',
										  name: 'ID_Kunde',
										  disabled:true,
										  readOnly:true
									  },{
										  fieldLabel: 'Kategorie*',
										  xtype:'combo',
										  allowBlank:false,
										  editable:false,
										  forceSelection:true,
										  triggerAction:'all',
										  mode: 'local',
										  store: new Ext.data.ArrayStore({
											fields: ['KategorieText'],
											data: [['Privat'],['Schule'],['Firma']]
										  }),
										  valueField: 'KategorieText',
										  displayField: 'KategorieText',
										  name: 'kategoriek'
									  },{
										  fieldLabel: 'Organisation',
										  name: 'organisation'
									  },{
										  fieldLabel: 'Adresse*',
										  allowBlank:false,
										  name: 'adresse'
									  },{
										  fieldLabel: 'Plz*',
										  allowBlank:false,
										  name: 'plz'
									  },{
										  fieldLabel: 'Ort*',
										  allowBlank:false,
										  name: 'ort'
									  },{
										  fieldLabel: 'Telefon',
										  name: 'telefon'
									  },{
										  fieldLabel: 'Fax',
										  name: 'fax'
									  },{
										  fieldLabel: 'E-Mail',
										  name: 'email'
									  },{
										  fieldLabel: 'Resy KdNr.',
										  name: 'resykd'
									  },{
										  fieldLabel: 'Bemerkung',
										  xtype: 'textarea',
										  name: 'bemerkung'
									  }
									  ]
							 });
						
						
						var fpKundanze = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'ticketForm',
								items: [{
									//xtype:'tabpanel',
									activeTab: 0,
									defaults:{autoHeight:true}, 
									items:[Kunden]
								}],
								buttons: [{ text:'save',
											iconCls:'save',
											formBind: true,
											handler: function() {
												fpKundanze.getForm().updateRecord(kundenGrid.getSelectionModel().getSelected());
												
												win.close();
											}
										  },{
											text: 'cancel',
											handler: function() {
												
												win.close();
											}
										  }
										 ]
							});
					  
							var win = new Ext.Window({
								title:'Kunden-Datensatz bearbeiten',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [fpKundanze]
							});
							fpKundanze.getForm().loadRecord(kundenGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}	
					  }          			
					}

					
				,{
					tooltip:'neuer Kunde',
					iconCls:'add',
					id:'KundenNewButton',
					width:50,
					handler:function()
					{						
						 var FsetKundeanlegen = new Ext.form.FieldSet({
							labelAlign: 'left',
							labelWidth: 150,
							layout:'form',
							defaults: {width: 200},
							defaultType: 'textfield',
							bodyStyle:'padding:10px',
							title:'Personendaten',
							height: 'auto',
							border: false,
							items:[{
									  fieldLabel: 'Kategorie*',
									  xtype:'combo',
									  allowBlank:false,
									  editable:false,
									  forceSelection:true,
									  triggerAction:'all',
									  mode: 'local',
									  store: new Ext.data.ArrayStore({
										fields: ['KategorieText'],
										data: [['Privat'],['Schule'],['Firma']]
									  }),
									  valueField: 'KategorieText',
									  displayField: 'KategorieText',
									  name: 'kategorie'
									},{
									  fieldLabel: 'Organisation',
									  name: 'organisation'
								  },{
									  fieldLabel: 'Adresse*',
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
								  },{
									  fieldLabel: 'Telefon',
									  name: 'telefon'
								  },{
									  fieldLabel: 'Fax',
									  name: 'fax'
								  },{
									  fieldLabel: 'eMail',
									  vtype:'email',
									  name: 'email'
								  },{
									  fieldLabel: 'Resy KdNr.',
									  name: 'resykd'
								  },{
									  fieldLabel: 'Bemerkung',
									  name: 'bemerkung',
									  xtype: 'textarea'
								  }]
						 });
						
						var neuKundenneuFP = new Ext.form.FormPanel({
							labelAlign: 'left',
							id:'ticketForm',
							monitorValid:true,
							url:'index.php',
							items: [{
								//xtype:'tabpanel',
								activeTab: 0,
								defaults:{autoHeight:true}, 
								items:[FsetKundeanlegen]
							}],
							buttons: [{
							  text: 'Save',
							  formBind: true,
							  iconCls:'save',
							  handler: function(){ 
								neuKundenneuFP.getForm().submit({ 
									method:'POST', 
									waitTitle:'Connecting', 
									waitMsg:'Sending data...',
									params: {
										cmd:'InsertKunden'										
									},
									success:function(form, action){ 
										if(action.result.success == true) {
											Ext.example.msg('Status', 'Saved successfully!');
											kundenStore.reload();
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
							title:'Kunden-Datensatz hinzufügen',
							closable:true,
							width:420,
							border:true,
							resizable:false,
							modal:true,
							items: [neuKundenneuFP]
						});
						win.show(this);
					  },
					  width:50
				}
						//Test
						
						//Ext.example.msg('Button', 'neuer Kunde');
					
				,{
					tooltip:'Kunde löschen',
					iconCls:'delete',
					id:'KundenDeleteButton',
					width:50,
					handler:function() {
					
					//test
					
					var rec = kundenGrid.getSelectionModel().getSelected();
						if(rec) 
						{							
						  Ext.Msg.show({
							   title:'wirklich löschen?',
							   msg: 'Sie sind dabei, eine Anfrage zu löschen. Wollen Sie diese Anfrage wirklich löschen?',
							   buttons: Ext.Msg.YESNO,
							   fn: function(buttonID) {
									if(buttonID=='yes') {
										  Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
												waitTitle:'Connecting', 
												waitMsg:'updating data...',
												url: 'index.php',
												params: {
													cmd:"Update",
													key: 'ID_Kunde',
													keyID: kundenGrid.getSelectionModel().getSelected().data.ID_Kunde,
													table:"tKunde",
													field: 'aktiv',
													value: 0
												},
												failure:function(response,options){
													Ext.example.msg('Status', 'Not deleted! Error Occured!');
												},
												success:function(response,options){
													var responseData = Ext.util.JSON.decode(response.responseText);
													if(responseData.success == true) {
														kundenStore.reload();
														kundenStore.commitChanges();
														Ext.example.msg('Status', 'Deleted successfully!');
													} else {
														Ext.example.msg('Fehler', 'Keine Berechtigung');
													}
												}
											});
										  kundenStore.reload(); 			            		  			
									}
							   },
							   icon: Ext.MessageBox.QUESTION
						  });
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  },
					
					// Test
						//Ext.example.msg('Button', 'Kunde löschen');
				},{
					tooltip:'Kunde Ansprechsperson',
					iconCls:'user',
					id:'KundenUserButton',
					width:50,
					handler:function() {
						
						var rec = kundenGrid.getSelectionModel().getSelected();
						if (rec)
						{
							// create the data store
							var AnsprechspersonStore = new Ext.data.Store({
								proxy: new Ext.data.HttpProxy({
									url: 'index.php',
									method: 'POST'
								}),
								baseParams:{
									cmd: "FillAnsprechpersonenGrid"
								},
								reader: new Ext.data.JsonReader({
									root: 'results',
									totalProperty: 'total'
								},Ext.data.Record.create([
									 {name: 'ID_Ansprechperson', type:'int'},
									 {name: 'nachname', type:'string'},
									 {name: 'vorname', type:'string'},
									 {name: 'telefon', type:'string'},
									 {name: 'email', type:'string'},
									 {name: 'letzteBearbeitung', type:'date', dateFormat: 'Y-m-d'},
									 {name: 'bemerkung', type:'string'},
									 {name: 'username', type:'string'}
								  ])
								)
							});
							AnsprechspersonStore.load({params:{ID_Kunde:kundenGrid.getSelectionModel().getSelected().data.ID_Kunde}});
							//das Polling nach neuen Datensätzen soll so lange true sein, bis ein Datensatz in Bearbeitung steht. Während dieser Bearbeitung
							//wird diese Eigenschaft auf false gesetzt und somit ein reload des stores verhindert.
							AnsprechspersonStore.addListener('update',function(st,rec,op) {
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
												key: 'ID_Ansprechperson',
												keyID: rec.data.ID_Ansprechperson,
												table:"tAnsprechperson",
												field: j,
												value: obj[j]
											},
											failure:function(response,options){
												Ext.example.msg('Status', 'not Updated, Errors occured!');
												
											},
											success:function(response,options){
												var responseData = Ext.util.JSON.decode(response.responseText);
												if(responseData.success == true) {
													AnsprechspersonStore.reload();
													AnsprechspersonStore.commitChanges();
													Ext.example.msg('Status', 'Updated successfully!');
												} else {
													Ext.example.msg('Fehler!', 'Leider kein Zugriff');
												}
											}
										});
								 }
							});
						
							var AnsprechspersonGrid = new Ext.grid.EditorGridPanel({
								frame: false,
								border:true,
								height: 'auto',
								id:'AnsprechspersonGrid',
								closable:true,
								store: AnsprechspersonStore,
								columns: [{
									header: 'Nr',
									width: 10,
									dataIndex: 'ID_Ansprechperson'
									},{
									header: 'Nachname*',
									width: 10,
									dataIndex: 'nachname',
									editor: new Ext.form.TextField({
										allowBlank:false
									})
									},{
									header: 'Vorname*',
									width: 10,
									dataIndex: 'vorname',
									editor: new Ext.form.TextField({
										allowBlank:false
									})
									},{
									header: 'eMail*',
									width: 10,
									dataIndex: 'email',
									editor: new Ext.form.TextField({
										allowBlank:false
									})
									},{
									header: 'Telefon*',
									width: 10,
									dataIndex: 'telefon',
									editor: new Ext.form.TextField({
										allowBlank:false
									})
									},{
									header: 'Bemerkung',
									width: 10,
									dataIndex: 'bemerkung',
									editor: new Ext.form.TextField({})
									},{
									header: "Letzte Bearbeitung", 
									width: 10, 
									sortable: false, 
									xtype: 'datecolumn', 
									format: 'd.m.Y', 
									dataIndex: 'letzteBearbeitung'
									}],
								stripeRows: true,
								viewConfig: {
									forceFit:true
								},    
								layout:'fit',
								region:'center',
								sm: new Ext.grid.RowSelectionModel({
									singleSelect:true
								}),
								tbar: new Ext.Toolbar({
									items: [{
										tooltip:'neue Ansprechsperson',
										iconCls:'add',
										id:'AnsprechspersonNewButton',
										width:50,
										handler:function()
										{
										
										
										var FsetAnsprechspersonanlegen = new Ext.form.FieldSet({
												labelAlign: 'left',
												labelWidth: 150,
												layout:'form',
												defaults: {width: 200},
												defaultType: 'textfield',
												bodyStyle:'padding:10px',
												title:'Ansprechspersonen-Daten',
												height: 'auto',
												border: false,
												items:[{
														  fieldLabel: 'Nachname*',
														  allowBlank:false,
														  name: 'nachname'
													  },{
														  fieldLabel: 'Vorname*',
														  allowBlank:false,
														  name: 'vorname'
													  },{
														  fieldLabel: 'Telefon*',
														  allowBlank:false,
														  name: 'telefon'
													  },{
														  fieldLabel: 'eMail*',
														  allowBlank:false,
														  vtype:'email',
														  name: 'email'
													  },{
														  fieldLabel: 'Bemerkung',
														  name: 'bemerkung',
														  xtype: 'textarea'
													  }]
											 });
											
											var neuAnsprechspersonneuFP = new Ext.form.FormPanel({
												labelAlign: 'left',
												id:'ticketForm',
												monitorValid:true,
												url:'index.php',
												items: [{
													activeTab: 0,
													defaults:{autoHeight:true}, 
													items:[FsetAnsprechspersonanlegen]
												}],
												buttons: [{
												  text: 'Save',
												  formBind: true,
												  iconCls:'save',
												  handler: function(){ 
													neuAnsprechspersonneuFP.getForm().submit({ 
														method:'POST', 
														waitTitle:'Connecting', 
														waitMsg:'Sending data...',
														params: {
															cmd:'InsertAnsprechperson',
															ID_Kunde: kundenGrid.getSelectionModel().getSelected().data.ID_Kunde
														},
														success:function(form, action){ 
															if(action.result.success == true) {
																Ext.example.msg('Status', 'Saved successfully!');
																AnsprechspersonStore.reload();
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
												title:'Kunden-Datensatz hinzufügen',
												closable:true,
												width:420,
												border:true,
												resizable:false,
												modal:true,
												items: [neuAnsprechspersonneuFP]
											});
											win.show(this);
										  },
										  width:50
									
										
										
										
										
									},{
										tooltip:'Ansprechsperson löschen',
										iconCls:'delete',
										id:'AnsprechspersonDeleteButton',
										width:50,
										handler:function() {
										
										var rec = AnsprechspersonGrid.getSelectionModel().getSelected();
														if(rec) 
														{							
														  Ext.Msg.show({
															   title:'wirklich löschen?',
															   msg: 'Sie sind dabei, eine Anfrage zu löschen. Wollen Sie diese Anfrage wirklich löschen?',
															   buttons: Ext.Msg.YESNO,
															   fn: function(buttonID) {
																	if(buttonID=='yes') {
																		  Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
																				waitTitle:'Connecting', 
																				waitMsg:'updating data...',
																				url: 'index.php',
																				params: {
																					cmd:"Update",
																					key: 'ID_Ansprechperson',
																					keyID: AnsprechspersonGrid.getSelectionModel().getSelected().data.ID_Ansprechperson,
																					table:"tAnsprechperson",
																					field: 'aktiv',
																					value: 0
																				},
																				failure:function(response,options){
																					Ext.example.msg('Status', 'Not deleted! Error Occured!');
																				},
																				success:function(response,options){
																					var responseData = Ext.util.JSON.decode(response.responseText);
																					if(responseData.success == true) {
																						AnsprechspersonStore.reload();
																						AnsprechspersonStore.commitChanges();
																						Ext.example.msg('Status', 'Deleted successfully!');
																					} else {
																						Ext.example.msg('Fehler', 'Keine Berechtigung');
																					}
																				}
																			});
																		  AnsprechspersonStore.reload(); 			            		  			
																	}
															   },
															   icon: Ext.MessageBox.QUESTION
														  });
														} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  
										
										}	
									}]
								})
							});
						
							
							var Ansprechspersonfenster = new Ext.Window({
								title:'Ansprechspersonen',
								closable:true,
								width:600,
								height: 450,
								layout:'fit',
								border:true,
								resizable:false,
								modal:true,
								items: [AnsprechspersonGrid]
							
							});
						
						Ansprechspersonfenster.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}	
					    
							
					},
				},{
					tooltip:'Kunde Mail',
					iconCls:'email',
					id:'KundenMailButton',
					width:50,
					handler:function() {
						
						if(kundenGrid.getSelectionModel().hasSelection()) {
							
							 var MailFS = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									title:'Mail',
									bodyStyle:'padding:10px',
									defaults: {width: 200},
									defaultType: 'textfield',
									height: 'auto',
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
												to:kundenGrid.getSelectionModel().getSelected().data.email
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
									title:'Kunden-Mail',
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
						Ext.ux.GridPrinter.print(kundenGrid);
					}
				}
					
					//Test
						
						
						//Ext.example.msg('Button', 'Kunde Mail');
					
				,'->',{
					xtype:'textfield',
					name:'searchfield',
					id:'kundensuchfeld',
					enableKeyEvents:true,
					emptyText:'Kunde suchen...'
				}]
			})
		});	 
		
		//dieser Event wird bei jedem Keyup-Event des Suchfeldes ausgelöst. Wir machen nach jedem Buchstaben einen AJAX-Request und
		//schießen das Ergebnis dieses neuen Requests an den Store. Hoffentlich ist der Datenbankzugriff schnell genug damit sich dieser geile
		//moderne Effekt den ich mir vorstelle auch zu 100% entfaltet... --> wenn dieser Kommentar in der Endversion noch enthalten ist, dann gehts :)
		Ext.getCmp('kundensuchfeld').addListener('keyup',function(tf,e) {
			kundenStore.reload({params:{suchen:tf.getValue(),start:0, limit:10}});
		});

		//beim Schließen des Kunden-Tabs müssen auch sämtliche erzeugte Variablen wieder zerstört werden, damit der Referenz-Count auf 0 gestellt wird
		//damit der Garbage-Collector seine Arbeit erledigen kann.
		kundenGrid.addListener('beforedestroy',function() {
			kundenStore.destroy();
		});
		//die ersten 10 Datensätze in den Store laden (Event an die Grid)
		pollForChanges(kundenGrid,true);
		//hier wird die gerade erstellte GridForm-Kombination an das TabPanel im Center-Bereich geadded
		Ext.getCmp('tabcenter').add(kundenGrid).show();
		//doLayout ist notwendig, wenn ein Item in einen bereits gerenderten Container nachträglich
		//eingepflegt wird. So wie die grid in das Tabpanel.
		Ext.getCmp('bl2_center').doLayout();
	} else Ext.getCmp('tabcenter').setActiveTab('kundenGrid');
}