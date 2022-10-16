/************************************************************************************************
----------------------------Funktion, um einen Tab zum Mainbereich zu adden.----------------------------------
Ich habe mich für diese Variante entschieden, da somit das Initiieren des Programmes flotter geht. 
Beim Instanziieren eines neuen Tabs für das Center-Panel wird der jeweilige Programmteil nachgeladen. 
Ich bin der Meinung das diese Herangehensweise den Workflow des Users am wenigsten beeinträchtigt.
Technisch wäre es auch möglich, alle Tabs beim Ext.onReady()  Event zu laden. Man hätte dadurch den Vorteil
einer verkürzten Zeit während des Betriebes. Dafür dauert das initiierende Laden des Programmes um ein viel-
faches länger und nicht benötigte Programmteile werden gleich von Beginn an immer mitgeladen.
*************************************************************************************************/

function addLeistungenTab(){
	//zuerst gehört gecheckt, ob es den Tab nicht vielleicht schon gibt.
	//wenn ja, wird er nur mehr focusiert, wenn nein werden die Grids, Forms und Stores erstellt
	//und alles läuft wie geschmiert :)
	if(document.getElementById('leistungsGrid') == null) {

		// create the data store
		var leistungStore = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url: 'index.php',
				method: 'POST'
			}),
			remoteSort:false,
			sortInfo: {field:'ID_Leistung', direction:'DESC'},
			baseParams:{
				cmd: "FillLeistungGrid"
			},
			reader: new Ext.data.JsonReader({
				root: 'results',
				totalProperty: 'total'
			},Ext.data.Record.create([
				 {name: 'ID_Leistung', type:'int'},
				 {name: 'Leistung', type:'string'},
				 {name: 'StandardUhrzeit', type:'string'},
				 {name: 'LeistungsBemerkung', type:'string'},
				 {name: 'ID_Partner', type:'int'},
				 {name: 'firmenname', type:'string'},
			  ])
			)
		});
		//das Polling nach neuen Datensätzen soll so lange true sein, bis ein Datensatz in Bearbeitung steht. Während dieser Bearbeitung
		//wird diese Eigenschaft auf false gesetzt und somit ein reload des stores verhindert.
		leistungStore._pollEnabled = true;
		leistungStore.addListener('update',function(st,rec,op) {
		 
		  var obj = eval(rec.getChanges());
		  if (typeof(obj) == "object")
			 for (var j in obj) {   //das ist die Schleife aus dem I-Netz! TOLLE SACHE!
			 var fieldwert = j;
			 
			 if(j == "firmenname") {	//In der Grid ist das Package ein String, 
				 fieldwert = "ID_Partner";  //Darstellen tun wir einen String, updaten eine ID.
			 }
		 
				 Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
						waitTitle:'Connecting', 
						waitMsg:'Sending data...',
						url: 'index.php',
						params: {
							cmd:"Update",
							key: 'ID_Leistung',
							keyID: rec.data.ID_Leistung,
							table:"tLeistung",
							field: fieldwert,
							value: obj[j]
						},
						failure:function(response,options){
							Ext.example.msg('Status', 'not Updated, Errors occured!');
							
						},
						success:function(response,options){
							var responseData = Ext.util.JSON.decode(response.responseText);
							if(responseData.success == true) {
								leistungStore.reload();
								leistungStore.commitChanges();
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
	
		var leistungsGrid = new Ext.grid.GridPanel({
			title:'Leistung',
			frame: false,
			border:true,
			iconCls: 'leistungen',
			id:'leistungsGrid',
			closable:true,
			store: leistungStore,
			columns: [
				{header: "Nr", width: 65, sortable: true, dataIndex: 'ID_Leistung'},
				{header: "Leistungsname", width: 115, sortable: true, dataIndex: 'Leistung'},
				{header: "Standard-Uhrzeit", width: 135, sortable: true, dataIndex: 'StandardUhrzeit'},
				{header: "Partnername", width:135, sortable: true, dataIndex: 'firmenname'}
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
			  store: leistungStore,
			  displayInfo: true,
			  plugins: new Ext.ux.ProgressBarPager()
			}),
			tbar: new Ext.Toolbar({
				items: [{
					tooltip:'Leistung anzeigen',
					iconCls:'lesen',
					id:'LeistungShowButton',
					width:50,
					handler:function() {
					var rec = leistungsGrid.getSelectionModel().getSelected();
						if(rec) 
						{
							 //Datensatz Anzeigen - 1. Fieldset (Buchungsdaten) 
							 var Leistunganz = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									defaults: {width: 200},
									bodyStyle:'padding:10px',
									defaultType: 'textfield',
									title:'Leistungsdaten',
									height: 'auto',
									border: false,
									items:[{
										  fieldLabel: 'Partnername',
										  disabled:true,
										  readOnly:true,											  
										  name: 'firmenname'
									  },{
										  fieldLabel: 'Leistung-ID',
										  disabled:true,
										  readOnly:true,											  
										  name: 'ID_Leistung'
									  },{
										  fieldLabel: 'Leistung',
										  readOnly:true,
										  name: 'Leistung'
									  },{
										  fieldLabel: 'Standard Uhrzeit',
										  readOnly:true,
										  name: 'StandardUhrzeit'
									  },{ 
										  fieldLabel: 'Leistungs Bemerkung',
										  readOnly:true,
										  xtype:'textarea',
										  name: 'LeistungsBemerkung'
									  }]
							 });
							 
							 
							 
							var showLeistunganze = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'ticketForm',
								items: [{
									//xtype:'tabpanel',
									activeTab: 0,
									defaults:{autoHeight:true}, 
									items:[Leistunganz]
								}],
								buttons: [{text:'Ok',
										   handler:function() {win.close();}}]
							});
					  
							var win = new Ext.Window({
								title:'Leistungs-Datensatz anzeigen',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [showLeistunganze]
							});
							showLeistunganze.getForm().loadRecord(leistungsGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}	
					  }
				 
				},{
					tooltip:'Leistung bearbeiten',
					iconCls:'schreiben',
					id:'LeistungEditButton',
					width:50,
					handler:function() {

						leistungStore._pollEnabled = false;
						//der in der Grid selektierte Record aus dem Store wird vollständig in der Variable rec gespeichert, und in das FormPanel zum Bearbeiten geladen.
						var rec = leistungsGrid.getSelectionModel().getSelected();
						//wenn diese if-Abfrage false ergibt ist kein Datensatz in der Grid selektiert und es wird ein entsprechender Hinweis ausgegeben.
						if(rec) 
						{
							 //Datensatz Ändern -  Fieldset (Buchungsdaten) 
							 var writeLeistung = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									defaults: {width: 200},
									bodyStyle:'padding:10px',
									defaultType: 'textfield',
									title:'Leistungsdaten',
									height: 'auto',
									border: false,
									items:[{
										  fieldLabel: 'Partner',
										  xtype:'combo',
										  allowBlank:false,
										  editable:false,
										  forceSelection:true,
										  triggerAction:'all',
										  mode: 'local',
										  store: new Ext.data.Store({
											proxy: new Ext.data.HttpProxy({
												url: 'index.php',
												method: 'POST'
											}),
											reader: new Ext.data.JsonReader({
												root: 'results',
												totalProperty: 'total',
												id: 'ID_Partner'
											},Ext.data.Record.create([
													{name: 'ID_Partner', type: 'int'},
													{name: 'firmenname', type: 'string'}
												])),
											baseParams:{
												cmd: "GetPartner"
											},
											autoLoad: true	
										  }),
										  valueField: 'ID_Partner',
										  displayField: 'firmenname',
										  name: 'firmenname'
									  },{
										  fieldLabel: 'Leistung-ID',
										  disabled:true,
										  readOnly:true,
										  name: 'ID_Leistung'
									  },{
										  fieldLabel: 'Leistung',
										  name: 'Leistung'
									  },{
										  fieldLabel: 'Standard Uhrzeit',
										  name: 'StandardUhrzeit'
									  },{
										  fieldLabel: 'Leistungs Bemerkung',
										  xtype:'textarea',
										  name: 'LeistungsBemerkung'
									  }]
							 });
						
						
						var fpLeitunganze = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'ticketForm',
								items: [{
									activeTab: 0,
									defaults:{autoHeight:true}, 
									items:[writeLeistung]
								}],
								buttons: [{ text:'save',
											iconCls:'save',
											formBind: true,
											handler: function() {
												fpLeitunganze.getForm().updateRecord(leistungsGrid.getSelectionModel().getSelected());
												//das Polling für den Store wieder aktivieren...
												leistungStore._pollEnabled = true;
												win.close();
											}
										  },{
											text: 'cancel',
											handler: function() {
												//das Polling für den Store wieder aktivieren...
												leistungStore._pollEnabled = true;
												win.close();
											}
										  }
										 ]
							});
					  
							var win = new Ext.Window({
								title:'Leistungs-Datensatz bearbeiten',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [fpLeitunganze]
							});
							fpLeitunganze.getForm().loadRecord(leistungsGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}	
					  }          								
				},{
					tooltip:'neue Leistung',
					iconCls:'add',
					id:'LeistungNewButton',
					width:50,
					handler:function() {
					
					 var FsetLeistunganlegen = new Ext.form.FieldSet({
							labelAlign: 'left',
							labelWidth: 150,
							layout:'form',
							defaults: {width: 200},
							defaultType: 'textfield',
							bodyStyle:'padding:10px',
							title:'Leistungsdaten',
							height: 'auto',
							border: false,
							items:[{
									  fieldLabel: 'Partner*',
									  xtype:'combo',
									  allowBlank:false,
									  editable:false,
									  forceSelection:true,
									  triggerAction:'all',
									  mode: 'local',
									  store: new Ext.data.Store({
										proxy: new Ext.data.HttpProxy({
											url: 'index.php',
											method: 'POST'
										}),
										reader: new Ext.data.JsonReader({
											root: 'results',
											totalProperty: 'total',
											id: 'ID_Partner'
										},Ext.data.Record.create([
												{name: 'ID_Partner', type: 'int'},
												{name: 'firmenname', type: 'string'}
											])),
										baseParams:{
											start: 0,
											cmd: "GetPartner"
										},
										autoLoad: true	
									  }),
									  
									  valueField: 'ID_Partner',
									  displayField: 'firmenname',
									  hiddenName: 'ID_Partner',
									  hiddenId:'hiddenLeistungIdCombo',
									  name:'ID_Partner'
								  },{
									  fieldLabel: 'Leistung',
									  name: 'Leistung'
								  },{
									  fieldLabel: 'Standard Uhrzeit',
									  name: 'StandardUhrzeit'
	
								  },{
									  fieldLabel: 'Leistungs Bemerkung',
									  name: 'LeistungsBemerkung'
									  
								  }]
						 });
						
						var neuLeistungneuFP = new Ext.form.FormPanel({
							labelAlign: 'left',
							id:'ticketForm',
							monitorValid:true,
							url:'index.php',
							items: [{
								activeTab: 0,
								defaults:{autoHeight:true}, 
								items:[FsetLeistunganlegen]
							}],
							buttons: [{
							  text: 'Save',
							  formBind: true,
							  iconCls:'save',
							  handler: function(){ 
								neuLeistungneuFP.getForm().submit({ 
									method:'POST', 
									waitTitle:'Connecting', 
									waitMsg:'Sending data...',
									params: {
										cmd:'InsertLeistung'										
									},
									success:function(form, action){ 
										if(action.result.success == true) {
											Ext.example.msg('Status', 'Saved successfully!');
											leistungStore.reload();
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
							title:'Leistungs-Datensatz hinzufügen',
							closable:true,
							width:420,
							border:true,
							resizable:false,
							modal:true,
							items: [neuLeistungneuFP]
						});
						win.show(this);
					  },
					  width:50
				},{
					tooltip:'Leistung löschen',
					iconCls:'delete',
					id:'LeistungDeleteButton',
					width:50,
					handler:function() {
				
					var rec = leistungsGrid.getSelectionModel().getSelected();
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
													key: 'ID_Leistung',
													keyID: leistungsGrid.getSelectionModel().getSelected().data.ID_Leistung,
													table:"tLeistung",
													field: 'aktiv',
													value: 0
												},
												failure:function(response,options){
													Ext.example.msg('Status', 'Not deleted! Error Occured!');
												},
												success:function(response,options){
													var responseData = Ext.util.JSON.decode(response.responseText);
													if(responseData.success == true) {
														leistungStore.reload();
														leistungStore.commitChanges();
														Ext.example.msg('Status', 'Deleted successfully!');
													} else {
														Ext.example.msg('Fehler', 'Keine Berechtigung');
													}
												}
											});
										  leistungStore.reload(); 			            		  			
									}
							   },
							   icon: Ext.MessageBox.QUESTION
						  });
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  }
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
					id:'leistungsuchfeld',
					enableKeyEvents:true,
					emptyText:'Leistung suchen...'
				}]
			})
		});	 
		
		//dieser Event wird bei jedem Keyup-Event des Suchfeldes ausgelöst. Wir machen nach jedem Buchstaben einen AJAX-Request und
		//schießen das Ergebnis dieses neuen Requests an den Store. Hoffentlich ist der Datenbankzugriff schnell genug damit sich dieser geile
		//moderne Effekt den ich mir vorstelle auch zu 100% entfaltet... --> wenn dieser Kommentar in der Endversion noch enthalten ist, dann gehts :)
		Ext.getCmp('leistungsuchfeld').addListener('keyup',function(tf,e) {
			leistungStore.reload({params:{suchen:tf.getValue(),start:0, limit:10}});
		});

		//beim Schließen des Buchungs-Tabs müssen auch sämtliche erzeugte Variablen wieder zerstört werden, damit der Referenz-Count auf 0 gestellt wird
		//damit der Garbage-Collector seine Arbeit erledigen kann.
		leistungsGrid.addListener('beforedestroy',function() {
			leistungStore.destroy();
		});
		//die ersten 10 Datensätze in den Store laden (Event an die Grid)
		pollForChanges(leistungsGrid,true);
		//hier wird die gerade erstellte GridForm-Kombination an das TabPanel im Center-Bereich geadded
		Ext.getCmp('tabcenter').add(leistungsGrid).show();
		//doLayout ist notwendig, wenn ein Item in einen bereits gerenderten Container nachträglich
		//eingepflegt wird. So wie die grid in das Tabpanel.
		Ext.getCmp('bl2_center').doLayout();

	
	} else Ext.getCmp('tabcenter').setActiveTab('leistungsGrid');
}
