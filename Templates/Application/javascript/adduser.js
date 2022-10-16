/************************************************************************************************
----------------------------Funktion, um einen Tab zum Mainbereich zu adden.----------------------------------
Ich habe mich für diese Variante entschieden, da somit das Initiieren des Programmes flotter geht. 
Beim Instanziieren eines neuen Tabs für das Center-Panel wird der jeweilige Programmteil nachgeladen. 
Ich bin der Meinung das diese Herangehensweise den Workflow des Users am wenigsten beeinträchtigt.
Technisch wäre es auch möglich, alle Tabs beim Ext.onReady()  Event zu laden. Man hätte dadurch den Vorteil
einer verkürzten Zeit während des Betriebes. Dafür dauert das initiierende Laden des Programmes um ein viel-
faches länger und nicht benötigte Programmteile werden gleich von Beginn an immer mitgeladen.
*************************************************************************************************/

function addUserTab(){
	//zuerst gehört gecheckt, ob es den Tab nicht vielleicht schon gibt.
	//wenn ja, wird er nur mehr focusiert, wenn nein werden die Grids, Forms und Stores erstellt
	if(document.getElementById("userGrid") == null) {
		
		// create the data store
		var userStore = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url: 'index.php',
				method: 'POST'
			}),
			remoteSort:true,
			baseParams:{
				cmd: "FillUserGrid"
			},
			sortInfo: {field:'ID_User', direction:'ASC'},
			reader: new Ext.data.JsonReader({
				root: 'results',
				totalProperty: 'total'
			},Ext.data.Record.create([
				 {name: 'ID_User', type:'int'},
				 {name: 'vorname', type:'string'},
				 {name: 'nachname', type:'string'},
				 {name: 'email', type:'string'},
				 {name: 'adresse', type:'string'},
				 {name: 'plz', type:'string'},
				 {name: 'ort', type:'string'},
				 {name: 'right_User', type:'boolean'},
				 {name: 'right_Anfrage', type:'boolean'},
				 {name: 'right_Buchung', type:'boolean'},
				 {name: 'right_Leistung', type:'boolean'},
				 {name: 'right_Package', type:'boolean'},
				 {name: 'right_Partner', type:'boolean'},
				 {name: 'right_Auswertungen', type:'boolean'},
				 {name: 'right_Kunde', type:'boolean'},
				 {name: 'right_Jugendherbergen', type:'boolean'}
			  ])
			)
		});
		//das Polling nach neuen Datensätzen soll so lange true sein, bis ein Datensatz in Bearbeitung steht. Während dieser Bearbeitung
		//wird diese Eigenschaft auf false gesetzt und somit ein reload des stores verhindert.
		userStore.addListener('update',function(st,rec,op) {
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
							key: 'ID_User',
							keyID: rec.data.ID_User,
							table:"tUser",
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
									userStore.reload();
									userStore.commitChanges();
									Ext.example.msg('Status', 'Updated successfully!');
								} else Ext.example.msg('Fehler!', 'Leider kein Zugriff');
							}
						}
					});
			 }
		});
		
		var checkJHB = new Ext.grid.CheckColumn({header: 'JHB',dataIndex: 'right_Jugendherbergen', width: 55});
		var checkUser = new Ext.grid.CheckColumn({header: 'User',dataIndex: 'right_User', width: 55});
		var checkAnfrage = new Ext.grid.CheckColumn({header: 'Anfrage',dataIndex: 'right_Anfrage', width: 55});
		var checkBuchung = new Ext.grid.CheckColumn({header: 'Buchung',dataIndex: 'right_Buchung', width: 55});
		var checkLeistung = new Ext.grid.CheckColumn({header: 'Leistung',dataIndex: 'right_Leistung', width: 55});
		var checkPackage = new Ext.grid.CheckColumn({header: 'Package',dataIndex: 'right_Package', width: 55});
		var checkPartner = new Ext.grid.CheckColumn({header: 'Partner',dataIndex: 'right_Partner', width: 55});
		var checkAuswertung = new Ext.grid.CheckColumn({header: 'Ausw.',dataIndex: 'right_Auswertungen', width: 55});
		var checkKunde = new Ext.grid.CheckColumn({header: 'Kunde',dataIndex: 'right_Kunde', width: 55});
	
		var userGrid = new Ext.grid.EditorGridPanel({
			title:'User',
			plugins: [checkUser, checkAnfrage, checkBuchung, checkLeistung, checkPackage, checkPartner, 
				checkAuswertung,checkKunde,checkJHB],
			clicksToEdit:1,
			frame: false,
			border:true,
			iconCls: 'user',
			id:'userGrid',
			closable:true,
			store: userStore,
			columns: [
				{header: "Nr", width: 35, sortable: false, dataIndex: 'ID_User'},
				{header: "Vorname", width: 90, sortable: false, dataIndex: 'vorname'},
				{header: "Nachname", width: 90, sortable: false, dataIndex: 'nachname'},
				{header: "eMail", width: 140, sortable: false, dataIndex: 'email'},
				checkUser, checkAnfrage, checkBuchung, checkLeistung, checkPackage, checkPartner, 
				checkAuswertung,checkKunde,checkJHB
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
			  store: userStore,
			  displayInfo: true,
			  plugins: new Ext.ux.ProgressBarPager()
			}),
			tbar: new Ext.Toolbar({
				items: [{
					tooltip:'neuer User',
					iconCls:'add',
					id:'UserNewButton',
					width:50,
					handler:function() {
						
						 //Datensatz Neuer User
						 var neuUserFS = new Ext.form.FieldSet({
								labelAlign: 'left',
								labelWidth: 150,
								layout:'form',
								defaults: {width: 200},
								bodyStyle:'padding:10px',
								defaultType: 'textfield',
								height: 'auto',
								border: false,
								items:[{
										  fieldLabel: 'Vorname',
										  allowBlank:false,
										  name: 'vorname'
									  },{
										  fieldLabel: 'Nachname',
										  allowBlank:false,
										  name: 'nachname'
									  },{
										  fieldLabel: 'eMail',
										  allowBlank:false,
										  name: 'email'
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
									  }]
						 });
						 var neuUserFP = new Ext.form.FormPanel({
							labelAlign: 'left',
							id:'UserForm',
							monitorValid:true,
							url:'index.php',
							items: [neuUserFS],
							buttons: [{
							  text: 'Save',
							  formBind: true,
							  iconCls:'save',
							  handler: function(){ 
								neuUserFP.getForm().submit({ 
									method:'POST', 
									waitTitle:'Connecting', 
									waitMsg:'Sending data...',
									params: {
										cmd:'InsertUser'										
									},
									success:function(form, action){ 
										if(action.result.success == true) {
											Ext.example.msg('Status', 'Saved successfully!');
											userStore.reload();
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
							title:'User-Datensatz hinzufügen',
							closable:true,
							width:420,
							border:true,
							resizable:false,
							modal:true,
							items: [neuUserFP]
						});
						win.show(this);
					}
				},{
					tooltip:'User löschen',
					iconCls:'delete',
					id:'UserDeleteButton',
					width:50,
					handler:function() {
						var rec = userGrid.getSelectionModel().getSelected();
						if(rec) 
						{							
						  Ext.Msg.show({
							   title:'wirklich löschen?',
							   msg: 'Sie sind dabei, einen User zu löschen. Wollen Sie diesen User wirklich löschen?',
							   buttons: Ext.Msg.YESNO,
							   fn: function(buttonID) {
									if(buttonID=='yes') {
										  Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
												waitTitle:'Connecting', 
												waitMsg:'updating data...',
												url: 'index.php',
												params: {
													cmd:"Update",
													key: 'ID_User',
													keyID: userGrid.getSelectionModel().getSelected().data.ID_User,
													table:"tUser",
													field: 'aktiv',
													value: 0
												},
												failure:function(response,options){
													Ext.example.msg('Status', 'Not deleted! Error Occured!');
												},
												success:function(response,options){
													var responseData = Ext.util.JSON.decode(response.responseText);
													if(responseData.success == true) {
														userStore.reload();
														userStore.commitChanges();
														Ext.example.msg('Status', 'Deleted successfully!');
													} else {
														Ext.example.msg('Fehler', 'Keine Berechtigung');
													}
												}
											});
										  userStore.reload(); 			            		  			
									}
							   },
							   icon: Ext.MessageBox.QUESTION
						  });
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					}
				},{
					tooltip:'User bearbeiten',
					iconCls:'schreiben',
					id:'WriteUserButton',
					width:50,
					handler:function() {
						//das Polling des Stores wird ausgeschalten, solange bis die Bearbeitung des Datensatzes abgeschlossen ist.
						userStore._pollEnabled = false;
						//der in der Grid selektierte Record aus dem Store wird vollständig in der Variable rec gespeichert, und in das FormPanel zum Bearbeiten geladen.
						var rec = userGrid.getSelectionModel().getSelected();
						//wenn diese if-Abfrage false ergibt ist kein Datensatz in der Grid selektiert und es wird ein entsprechender Hinweis ausgegeben.
						if(rec) 
						{
							 //Datensatz Ändern 
							 var writeUserFS = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									defaults: {width: 200},
									bodyStyle:'padding:10px',
									defaultType: 'textfield',
									title:'Userdaten',
									height: 'auto',
									border: false,
									items:[{
										  fieldLabel: 'User-ID',
										  disabled:true,
										  name: 'ID_User'
									  },{
										  fieldLabel: 'Vorname',
										  allowBlank:false,
										  name: 'vorname'
									  },{
										  fieldLabel: 'Nachname',
										  allowBlank:false,
										  name: 'nachname'
									  },{
										  fieldLabel: 'eMail',
										  allowBlank:false,
										  name: 'email'
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
									  }]
							 });
							 var writeUserFP = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'UserForm',
								monitorValid:true,
								items: [writeUserFS],
								buttons: [{ text:'save',
											iconCls:'save',
											formBind: true,
											handler: function() {
												writeUserFP.getForm().updateRecord(userGrid.getSelectionModel().getSelected());
												//das Polling für den Store wieder aktivieren...
												userStore._pollEnabled = true;
												win.close();
											}
										  },{
											text: 'cancel',
											handler: function() {
												//das Polling für den Store wieder aktivieren...
												userStore._pollEnabled = true;
												win.close();
											}
										  }
										 ]
							});
					  
							var win = new Ext.Window({
								title:'Userdaten ändern',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [writeUserFP]
							});
							writeUserFP.getForm().loadRecord(userGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  
					}
				},{
						tooltip:'User Mail',
						iconCls:'email',
						id:'KundenMailButton',
						width:50,
						handler:function() {
						
							if(userGrid.getSelectionModel().hasSelection()) {
						
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
												to:userGrid.getSelectionModel().getSelected().data.email
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
									title:'User-Mail',
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
					}]
			})
		});	 
		
		//beim Schließen des User-Tabs müssen auch sämtliche erzeugte Variablen wieder zerstört werden, damit der Referenz-Count auf 0 gestellt wird
		//damit der Garbage-Collector seine Arbeit erledigen kann.
		userGrid.addListener('beforedestroy',function() {
			userStore.destroy();
		});
		//die ersten 10 Datensätze in den Store laden (Event an die Grid)
		//kein Polling bei den Usern....
		userStore.load({params:{start:0, limit:10}});
		//hier wird die gerade erstellte GridForm-Kombination an das TabPanel im Center-Bereich geadded
		Ext.getCmp('tabcenter').add(userGrid).show();
		//doLayout ist notwendig, wenn ein Item in einen bereits gerenderten Container nachträglich
		//eingepflegt wird. So wie die grid in das Tabpanel.
		Ext.getCmp('bl2_center').doLayout();
	} else Ext.getCmp('tabcenter').setActiveTab('userGrid');
}