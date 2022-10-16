/************************************************************************************************
----------------------------Funktion, um einen Tab zum Mainbereich zu adden.----------------------------------
Ich habe mich für diese Variante entschieden, da somit das Initiieren des Programmes flotter geht. 
Beim Instanziieren eines neuen Tabs für das Center-Panel wird der jeweilige Programmteil nachgeladen. 
Ich bin der Meinung das diese Herangehensweise den Workflow des Users am wenigsten beeinträchtigt.
Technisch wäre es auch möglich, alle Tabs beim Ext.onReady()  Event zu laden. Man hätte dadurch den Vorteil
einer verkürzten Zeit während des Betriebes. Dafür dauert das initiierende Laden des Programmes um ein viel-
faches länger und nicht benötigte Programmteile werden gleich von Beginn an immer mitgeladen.
*************************************************************************************************/

function addBuchungTab(){
	//zuerst gehört gecheckt, ob es den Tab nicht vielleicht schon gibt.
	//wenn ja, wird er nur mehr focusiert, wenn nein werden die Grids, Forms und Stores erstellt
	if(document.getElementById("buchungGrid") == null) {
		
		
		var stati = new Ext.data.ArrayStore({
			fields: ['Buchungsstatus'],
			data: [['offen'],['reserviert'],['termine_gesendet'],['abgeschlossen'],['bezahlt']]
		});
		
		
		/*  IN DIESEM STORE WERDEN DIE DATENSÄTZE DER BUCHUNGEN GESPEICHERT **************/
		/*******************************************************************************/
		var buchungStore = new Ext.data.Store({
			proxy: new Ext.data.HttpProxy({
				url: 'index.php',
				method: 'POST'
			}),
			baseParams:{
				cmd: "FillBuchungGrid",
				filter:true,
				comboFilter:'offen'
			},
			remoteSort:false,
			sortInfo: {field:'ID_Buchung', direction:'DESC'},
			reader: new Ext.data.JsonReader({
				root: 'results',
				totalProperty: 'total'
			},Ext.data.Record.create([
				 {name: 'ID_Buchung', type:'int'},
				 {name: 'resyBuchungsNr', type:'string'},
				 {name: 'Organisation', type:'string'},
				 {name: 'Ansprechperson', type:'string'},
				 {name: 'packagename', type:'string'},
				 {name: 'terminAnreise', type:'date', dateFormat: 'Y-m-d'},
				 {name: 'ersatzTerminAnreise', type:'date', dateFormat: 'Y-m-d'},
				 {name: 'kinder', type:'int'},
				 {name: 'erwachsene', type:'int'},
				 {name: 'female', type:'int'},
				 {name: 'male', type:'int'},
				 {name: 'vegetarier', type:'int'},
				 {name: 'relVorschriften', type:'string'},
				 {name: 'allergien', type:'string'},
				 {name: 'username', type:'string'},
				 {name: 'letzteBearbeitung', type:'date', dateFormat: 'Y-m-d'},
				 {name: 'erstelltAm', type: 'date', dateFormat: 'Y-m-d'},
				 {name: 'buchungsStatus', type:'string'}
			  ])
			)
		});
		//das Polling nach neuen Datensätzen soll so lange true sein, bis ein Datensatz in Bearbeitung steht. Während dieser Bearbeitung
		//wird diese Eigenschaft auf false gesetzt und somit ein reload des stores verhindert.
		buchungStore._pollEnabled = true;
		
		//DIESER LISTENER LAUSCHT AUF ÄNDERUNGEN, DIE MANUELL IM STORE VORGENOMMEN WURDEN
		//UND UPDATED DIESE ÄNDERUNG AUCH INSTANTLY IN DER DATENBANK.
		buchungStore.addListener('update',function(st,rec,op) {
		  //Im Objekt obj werden als Eigenschaften alle Änderungen gespeichert. In der Schleife wird für jede dieser Eigenschaften
		  //ein eigener AJAX-Call abgesetzt, der den geänderten Wert in der Datenbank aktualisiert.
		  var obj = eval(rec.getChanges());
		  if (typeof(obj) == "object")
			for (var j in obj) {   //das ist die Schleife aus dem I-Netz! TOLLE SACHE!
				var fieldwert = j;
				 if(j == "packagename") {	//In der Grid ist das Package ein String, 
					 fieldwert = "ID_Package";  //Darstellen tun wir einen String, updaten eine ID.
				 }
				 Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
					waitTitle:'Connecting', 
					waitMsg:'Sending data...',
					url: 'index.php',
					params: {
						cmd: "Update",
						key: 'ID_Buchung',
						keyID: rec.data.ID_Buchung,
						table: "tBuchung",
						field: fieldwert,
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
								buchungStore.reload();
								buchungStore.commitChanges();
								Ext.example.msg('Status', 'Updated successfully!');
							} else Ext.example.msg('Fehler!', 'Leider kein Zugriff');
						}
					}
				});
			}
		});
	
	
/*********************************************************************************/
/****Die Funktionen, die in den Toolbarbuttons auf der Grid hinterlegt sind:                    */
/*********************************************************************************/
	
		/*  DIESER BUTTON IST ZUM ANZEIGEN DER BUCHUNGSDATEN ZUSTÄNDIG   **************/
		/*****************************************************************************/
		function BuchungAnzeigen() {
			
			//der in der Grid selektierte Record aus dem Store wird vollständig in der Variable rec gespeichert, und in das FormPanel zum Bearbeiten geladen.
			var rec = buchungGrid.getSelectionModel().getSelected();
			
			//wenn diese if-Abfrage false ergibt ist kein Datensatz in der Grid selektiert und es wird ein entsprechender Hinweis ausgegeben.
			if(rec) 
			{
				
				/*  BEREICH FÜR DIE BUCHUNGSDATEN  *****************************************/
				/*****************************************************************************/
				var BuchungShowFS1 = new Ext.form.FieldSet({
					labelAlign: 'left',
					labelWidth: 115,
					columnWidth: .50,
					layout:'form',
					defaults: {width: 130},
					bodyStyle:'padding:10px',
					defaultType: 'textfield',
					height: 'auto',
					border: false,
					items:[{
						  fieldLabel: 'Buchungsnr.',
						  readOnly:true,
						  disabled:true,
						  name: 'ID_Buchung'
						},{
							fieldLabel: 'Termin*',
							allowBlank:false,
							readOnly:true,
							format: 'd.m.Y',
							xtype:'datefield',
							name: 'terminAnreise'
						},{
							fieldLabel: 'Ersatztermin',
							format: 'd.m.Y',
							readOnly:true,
							hideTrigger:true,
							xtype:'datefield',
							name: 'ersatzTerminAnreise'
						},{
							fieldLabel: 'Package*',
							xtype:'combo',
							disabled:true,
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
							}),
							valueField: 'ID_Package',
							displayField: 'packagename',
							name: 'packagename'							  
						},{
						  fieldLabel: 'Organisation',
						  readOnly:true,
						  disabled:true,
						  name: 'Organisation'
						},{
						  fieldLabel: 'Ansprechperson',
						  readOnly:true,
						  disabled:true,
						  name: 'Ansprechperson'
						},{
						  fieldLabel: 'Kinder',
						  readOnly:true,
						  name: 'kinder'
						},{
						  fieldLabel: 'Erwachsene',
						  readOnly:true,
						  name: 'erwachsene'
						},{
						  fieldLabel: 'Weiblich',
						  readOnly:true,
						  name: 'female'
						},{
						  fieldLabel: 'Männlich',
						  readOnly:true,
						  name: 'male'
						}
					]
				});
				
				var BuchungShowFS2 = new Ext.form.FieldSet({
					labelAlign: 'left',
					labelWidth: 115,
					layout:'form',
					columnWidth: .50,
					defaults: {width: 130},
					bodyStyle:'padding:10px',
					defaultType: 'textfield',
					height: 'auto',
					border: false,
					items:[{
						  fieldLabel: 'Resy Buchungsnr.',
						  allowBlank:false,
						  readOnly:true,
						  name: 'resyBuchungsNr'
						},{
						  fieldLabel: 'Vegetarier',
						  readOnly:true,
						  name: 'vegetarier'
						},{
						  fieldLabel: 'Rel.Vorschriften',
						  readOnly:true,
						  xtype:'textarea',
						  name: 'relVorschriften'
						},{
						  fieldLabel: 'Allergien',
						  readOnly:true,
						  xtype:'textarea',
						  name: 'allergien'
						},{
							fieldLabel: 'Buchungsstatus*',
							xtype:'combo',
							allowBlank:false,
							readOnly:true,
							hideTrigger:true,
							editable:false,
							forceSelection:true,
							triggerAction:'all',
							mode: 'local',
							store: stati,
							valueField: 'Buchungsstatus',
							displayField: 'Buchungsstatus',
							name: 'buchungsStatus'
						}
					]
				});
				
				var BuchungShowFP = new Ext.form.FormPanel({
					labelAlign: 'left',
					id:'PartnerForm',
					title:'Daten',
					monitorValid:true,
					layout:'column',
					url:'index.php',
					items: [BuchungShowFS1,BuchungShowFS2],
					buttons: [{
						text: 'ok',
						handler: function() {
							win.close();
						}
					}]
				});
				BuchungShowFP.getForm().loadRecord(rec);
				
				/* BEREICH FÜR DIE HINWEISE*****************************************/
				/*****************************************************************************/
				var HinweiseStore = new Ext.data.Store({
					proxy: new Ext.data.HttpProxy({
						url: 'index.php',
						method: 'POST'
					}),
					baseParams:{
						cmd: "FillBuchungshinweisGrid",
						ID_Buchung: rec.data.ID_Buchung
					},
					reader: new Ext.data.JsonReader({
						root: 'results',
						totalProperty: 'total'
					},Ext.data.Record.create([
						 {name: 'ID_Buchungsinfo', type:'int'},
						 {name: 'infoDatum', type:'date', dateFormat: 'Y-m-d'},
						 {name: 'infotext', type:'string'},
						 {name: 'user', type:'string'}
					  ])
					)
				});
				
				HinweiseStore.load();
				
				var expander = new Ext.ux.grid.RowExpander({
					tpl : new Ext.Template(
						'<p><b>Hinweistext:</b><br />{infotext}</p>'
					)
				});

				
				var HinweiseGrid = new Ext.grid.GridPanel({
					title:'Hinweise',
					stripeRows: true,
					height:300,
					viewConfig: {
						forceFit:true
					},
					animCollapse: false,
					store: HinweiseStore,
					columns: [
						expander,
						{header: "Datum", width: 30, sortable: true, xtype: 'datecolumn', format: 'd.m.Y', dataIndex: 'infoDatum'},
						{header: "User / Hinweis", width: 135, sortable: false, dataIndex: 'user'}
					],
					sm: new Ext.grid.RowSelectionModel({
						singleSelect:true
					}),
					plugins: expander,
					bbar: new Ext.Toolbar({
						items: ['->',{
							text:'  o.k.',
							width:100,
							iconCls:'grant',
							handler:function() {
								//das Polling für den Store wieder aktivieren...
								win.close();
							}
						}]
					})
				});
				
				/*  BEREICH FÜR DIE TIMETABLE*****************************************/
				/*****************************************************************************/
				var TimetableStore = new Ext.data.Store({
					proxy: new Ext.data.HttpProxy({
						url: 'index.php',
						method: 'POST'
					}),
					autoLoad:'true',
					baseParams:{
						cmd: "FillTimetableGrid",
						ID_Buchung: rec.data.ID_Buchung
					},
					reader: new Ext.data.JsonReader({
						root: 'results',
						totalProperty: 'total'
					},Ext.data.Record.create([
						 {name: 'ID_LeistungsZeitpunkt', type:'int'},
						 {name: 'Leistung', type:'string'},
						 {name: 'EchtDatum', type:'date', dateFormat: 'Y-m-d'},
						 {name: 'EchtUhrzeit', type:'string'}
					  ])
					)
				});
								
				
				var TimetableGrid = new Ext.grid.GridPanel({
					title:'Zeiten',
					stripeRows: true,
					height:300,
					viewConfig: {
						forceFit:true
					},
					store: TimetableStore,
					columns: [
						{header: "Leistung", width: 210, sortable: false, dataIndex: 'Leistung'},
						{	header: "Datum", 
							width: 90, 
							sortable: true, 
							xtype: 'datecolumn', 
							format: 'd.m.Y', 
							dataIndex: 'EchtDatum'
						},
						{	header: "Uhrzeit", 
							width: 90, 
							sortable: false, 
							dataIndex: 'EchtUhrzeit'
						}
					],
					sm: new Ext.grid.RowSelectionModel({
						singleSelect:true
					}),
					bbar: new Ext.Toolbar({
						items: ['->',{
							text:'  o.k.',
							width:100,
							iconCls:'grant',
							handler:function() {
								//das Polling für den Store wieder aktivieren...
								buchungStore._pollEnabled = true;
								win.close();
							}
						}]
					})
				});
				
				/*    TABPANEL, DER DIE TIMETABLE, DIE HINWEISE und die BUCHUNGSDATEN BEINHALTET****/
				/*******************************************************************************/
				var BuchungShowTabPanel = new Ext.TabPanel({
					activeTab: 0,
					items:[BuchungShowFP, TimetableGrid, HinweiseGrid]
				});
				
				/*    TABPANEL, DER DIE TIMETABLE, DIE HINWEISE und die BUCHUNGSDATEN BEINHALTET****/
				/*******************************************************************************/
				var win = new Ext.Window({
				title:'Buchung bearbeiten',
				closable:true,
				width:600,
				height:390,
				layout:'fit',
				border:true,
				resizable:false,
				modal:true,
				items: [BuchungShowTabPanel]
				}).show(this);
			} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
		}
		
		/*  DIESER BUTTON IST ZUM BEARBEITEN DER BUCHUNGSDATEN ZUSTÄNDIG   **************/
		/*****************************************************************************/
		function BuchungBearbeiten() {
			//das Polling des Stores wird ausgeschalten, solange bis die Bearbeitung des Datensatzes abgeschlossen ist.
			buchungStore._pollEnabled = false;
			//der in der Grid selektierte Record aus dem Store wird vollständig in der Variable rec gespeichert, und in das FormPanel zum Bearbeiten geladen.
			var rec = buchungGrid.getSelectionModel().getSelected();
			//wenn diese if-Abfrage false ergibt ist kein Datensatz in der Grid selektiert und es wird ein entsprechender Hinweis ausgegeben.
			if(rec) 
			{
				
				/*  BEREICH FÜR DIE BUCHUNGSDATEN  *****************************************/
				/*****************************************************************************/
				var BuchungChangeFS1 = new Ext.form.FieldSet({
					labelAlign: 'left',
					labelWidth: 115,
					columnWidth: .50,
					layout:'form',
					defaults: {width: 130},
					bodyStyle:'padding:10px',
					defaultType: 'textfield',
					height: 'auto',
					border: false,
					items:[{
						  fieldLabel: 'Buchungsnr.',
						  readOnly:true,
						  disabled:true,
						  name: 'ID_Buchung'
						},{
							fieldLabel: 'Termin*',
							allowBlank:false,
							format: 'd.m.Y',
							xtype:'datefield',
							name: 'terminAnreise'
						},{
							fieldLabel: 'Ersatztermin',
							format: 'd.m.Y',
							xtype:'datefield',
							name: 'ersatzTerminAnreise'
						},{
							fieldLabel: 'Package*',
							xtype:'combo',
							disabled:true,
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
							}),
							valueField: 'ID_Package',
							displayField: 'packagename',
							name: 'packagename'							  
						},{
						  fieldLabel: 'Organisation',
						  readOnly:true,
						  disabled:true,
						  name: 'Organisation'
						},{
						  fieldLabel: 'Ansprechperson',
						  readOnly:true,
						  disabled:true,
						  name: 'Ansprechperson'
						},{
						  fieldLabel: 'Kinder',
						  name: 'kinder'
						},{
						  fieldLabel: 'Erwachsene',
						  name: 'erwachsene'
						},{
						  fieldLabel: 'Weiblich',
						  name: 'female'
						},{
						  fieldLabel: 'Männlich',
						  name: 'male'
						}
					]
				});
				
				var BuchungChangeFS2 = new Ext.form.FieldSet({
					labelAlign: 'left',
					labelWidth: 115,
					layout:'form',
					columnWidth: .50,
					defaults: {width: 130},
					bodyStyle:'padding:10px',
					defaultType: 'textfield',
					height: 'auto',
					border: false,
					items:[{
						  fieldLabel: 'Resy Buchungsnr.',
						  allowBlank:false,
						  name: 'resyBuchungsNr'
						},{
						  fieldLabel: 'Vegetarier',
						  name: 'vegetarier'
						},{
						  fieldLabel: 'Rel.Vorschriften',
						  xtype:'textarea',
						  name: 'relVorschriften'
						},{
						  fieldLabel: 'Allergien',
						  xtype:'textarea',
						  name: 'allergien'
						},{
							fieldLabel: 'Buchungsstatus*',
							xtype:'combo',
							allowBlank:false,
							editable:false,
							forceSelection:true,
							triggerAction:'all',
							mode: 'local',
							store: stati,
							valueField: 'Buchungsstatus',
							displayField: 'Buchungsstatus',
							name: 'buchungsStatus'
						}
					]
				});
				
				var BuchungChangeFP = new Ext.form.FormPanel({
					labelAlign: 'left',
					id:'PartnerForm',
					title:'Daten',
					monitorValid:true,
					layout:'column',
					url:'index.php',
					items: [BuchungChangeFS1,BuchungChangeFS2],
					buttons: [{
						text:'save',
						iconCls:'save',
						formBind: true,
						handler: function() {
							BuchungChangeFP.getForm().updateRecord(buchungGrid.getSelectionModel().getSelected());
							//das Polling für den Store wieder aktivieren...
							buchungStore._pollEnabled = true;
							win.close();
						}
					},{
						text: 'cancel',
						handler: function() {
							//das Polling für den Store wieder aktivieren...
							buchungStore._pollEnabled = true;
							win.close();
						}
					}]
				});
				BuchungChangeFP.getForm().loadRecord(rec);
				
				/* BEREICH FÜR DIE HINWEISE*****************************************/
				/*****************************************************************************/
				var HinweiseStore = new Ext.data.Store({
					proxy: new Ext.data.HttpProxy({
						url: 'index.php',
						method: 'POST'
					}),
					baseParams:{
						cmd: "FillBuchungshinweisGrid",
						ID_Buchung: rec.data.ID_Buchung
					},
					reader: new Ext.data.JsonReader({
						root: 'results',
						totalProperty: 'total'
					},Ext.data.Record.create([
						 {name: 'ID_Buchungsinfo', type:'int'},
						 {name: 'infoDatum', type:'date', dateFormat: 'Y-m-d'},
						 {name: 'infotext', type:'string'},
						 {name: 'user', type:'string'}
					  ])
					)
				});
				
				HinweiseStore.load();
				
				var expander = new Ext.ux.grid.RowExpander({
					tpl : new Ext.Template(
						'<p><b>Hinweistext:</b><br />{infotext}</p>'
					)
				});

				
				var HinweiseGrid = new Ext.grid.GridPanel({
					title:'Hinweise',
					stripeRows: true,
					height:300,
					viewConfig: {
						forceFit:true
					},
					animCollapse: false,
					store: HinweiseStore,
					columns: [
						expander,
						{header: "Datum", width: 30, sortable: true, xtype: 'datecolumn', format: 'd.m.Y', dataIndex: 'infoDatum'},
						{header: "User / Hinweis", width: 135, sortable: false, dataIndex: 'user'}
					],
					sm: new Ext.grid.RowSelectionModel({
						singleSelect:true
					}),
					plugins: expander,
					tbar: new Ext.Toolbar({
						items: [{
							width:50,
							iconCls:'add',
							handler:function() {
								var neuerHinweisFS = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									title:'neuer Hinweis',
									bodyStyle:'padding:10px',
									defaults: {width: 200},
									defaultType: 'textfield',
									height: 'auto',
									border: false,
									items:[{
											  fieldLabel: 'Hinweis',
											  xtype: 'textarea',
											  name: 'infotext'
									}]
								});

								var neuerHinweisFP = new Ext.form.FormPanel({
									labelAlign: 'left',
									monitorValid:true,
									url:'index.php',
									items: [neuerHinweisFS],
									buttons: [{
									  text: 'Speichern',
									  formBind: true,
									  iconCls:'save',
									  handler: function(){ 
										neuerHinweisFP.getForm().submit({ 
											method:'POST', 
											waitTitle:'Connecting', 
											waitMsg:'Sending data...',
											params: {
												cmd:"InsertBuchungsHinweis",
												ID_Buchung:rec.data.ID_Buchung
											},
											success:function(form, action) { 
												var responseData = Ext.util.JSON.decode(action.response.responseText);
												if(responseData.success == true) {
													HinweiseStore.reload();
													HinweiseStore.commitChanges();
													Ext.example.msg('Status', 'Erfolgreich angelegt!');
												} else {
													Ext.example.msg('Fehler', 'Keine Berechtigung');
												}
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
									title:'neuer Hinweis',
									closable:true,
									width:420,
									border:true,
									resizable:false,
									modal:true,
									items: [neuerHinweisFP]
								});
								win.show(this);
							}
						},{
							width:50,
							iconCls:'delete',
							handler:function() {
								Ext.Ajax.request({
									waitTitle:'Connecting', 
									waitMsg:'Sending data...',
									url: 'index.php',
									params: {
										cmd: "DeleteBuchungsHinweis",
										ID_BuchungsHinweis: HinweiseGrid.getSelectionModel().getSelected().data.ID_Buchungsinfo
									},
									failure:function(response,options){
										Ext.example.msg('Status', 'nicht gelöscht, Errors occured!');
									},
									success:function(response,options){
										var responseJSON = Ext.decode(response.responseText);

										if(responseJSON.error==true) { //FEHLERBEHANDLUNG
											handleException(responseJSON);
										} else {
											if(responseJSON.success == true) {
												HinweiseStore.reload();
												HinweiseStore.commitChanges();
												Ext.example.msg('Status', 'Erfolgreich gelöscht!');
											} else Ext.example.msg('Fehler!', 'Leider kein Zugriff');
										}
									}
								});
							}
						}]
					}),
					bbar: new Ext.Toolbar({
						items: ['->',{
							text:'  o.k.',
							width:100,
							iconCls:'grant',
							handler:function() {
								//das Polling für den Store wieder aktivieren...
								buchungStore._pollEnabled = true;
								win.close();
							}
						}]
					})
				});
				
				/*  BEREICH FÜR DIE TIMETABLE*****************************************/
				/*****************************************************************************/
				var TimetableStore = new Ext.data.Store({
					proxy: new Ext.data.HttpProxy({
						url: 'index.php',
						method: 'POST'
					}),
					autoLoad:'true',
					baseParams:{
						cmd: "FillTimetableGrid",
						ID_Buchung: rec.data.ID_Buchung
					},
					reader: new Ext.data.JsonReader({
						root: 'results',
						totalProperty: 'total'
					},Ext.data.Record.create([
						 {name: 'ID_LeistungsZeitpunkt', type:'int'},
						 {name: 'Leistung', type:'string'},
						 {name: 'EchtDatum', type:'date', dateFormat: 'Y-m-d'},
						 {name: 'EchtUhrzeit', type:'string'}
					  ])
					)
				});
				
				TimetableStore.addListener('update',function(st,rec,op) {
				//Im Objekt obj werden als Eigenschaften alle Änderungen gespeichert. In der Schleife wird für jede dieser Eigenschaften
				//ein eigener AJAX-Call abgesetzt, der den geänderten Wert in der Datenbank aktualisiert.
			
					var obj = eval(rec.getChanges());
					if (typeof(obj) == "object")
					for (var j in obj) {
						Ext.Ajax.request({
							waitTitle:'Connecting', 
							waitMsg:'Sending data...',
							url: 'index.php',
							params: {
								cmd: "Update",
								key: 'ID_Leistungszeitpunkt',
								keyID: rec.data.ID_LeistungsZeitpunkt,
								table: "tLeistungszeitpunkt",
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
										TimetableStore.reload();
										TimetableStore.commitChanges();
										Ext.example.msg('Status', 'Updated successfully!');
									} else Ext.example.msg('Fehler!', 'Leider kein Zugriff');
								}
							}
						});
					}
				});
				
				
				var TimetableGrid = new Ext.grid.EditorGridPanel({
					title:'Zeiten',
					stripeRows: true,
					height:300,
					viewConfig: {
						forceFit:true
					},
					store: TimetableStore,
					columns: [
						{header: "Leistung", width: 210, sortable: false, dataIndex: 'Leistung'},
						{	header: "Datum", 
							width: 90, 
							sortable: true, 
							xtype: 'datecolumn', 
							format: 'd.m.Y', 
							dataIndex: 'EchtDatum',
							editor: new Ext.form.DateField({
								format: 'd.m.Y'
							})
						},
						{	header: "Uhrzeit", 
							width: 90, 
							sortable: false, 
							dataIndex: 'EchtUhrzeit', 
							editor: new Ext.form.TextField({allowBlank: false})
						}
					],
					sm: new Ext.grid.RowSelectionModel({
						singleSelect:true
					}),
					bbar: new Ext.Toolbar({
						items: ['->',{
							text:'  o.k.',
							width:100,
							iconCls:'grant',
							handler:function() {
								//das Polling für den Store wieder aktivieren...
								buchungStore._pollEnabled = true;
								win.close();
							}
						}]
					})
				});
				
				/*    TABPANEL, DER DIE TIMETABLE, DIE HINWEISE und die BUCHUNGSDATEN BEINHALTET****/
				/*******************************************************************************/
				var BuchungChangeTabPanel = new Ext.TabPanel({
					activeTab: 0,
					items:[BuchungChangeFP, TimetableGrid, HinweiseGrid]
				});
				
				/*    TABPANEL, DER DIE TIMETABLE, DIE HINWEISE und die BUCHUNGSDATEN BEINHALTET****/
				/*******************************************************************************/
				var win = new Ext.Window({
				title:'Buchung bearbeiten',
				closable:true,
				width:600,
				height:390,
				layout:'fit',
				border:true,
				resizable:false,
				modal:true,
				items: [BuchungChangeTabPanel]
				}).show(this);
			} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
		}

				
		
		
		//SENDEN VON MAILS ÜBER DEN COMMAND cmdMail.php
		function MailSenden() {
			if(buchungGrid.getSelectionModel().hasSelection()) {
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
								to:buchungGrid.getSelectionModel().getSelected().data.email
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
		}
		
		
		
		/***************************************************************************/
		/*********************       DIE GRID IM MAINPANEL       ***************************/
		/***************************************************************************/
		
		/*
		//renderer, um das Statusfeld zu färben.
		function colorStatus(value, metaData, record, rowIndex, colIndex, store){
			if(value=='offen') {
				metaData.css = 'redtext';
			}
			if(value=='bezahlt') {
				metaData.css = 'greentext';
			}
			if(value=='abgeschlossen') {
				metaData.css = 'greentext';
			}
			return value;
		}
		*/
		
		//Pfad für Druck-Layout-Einstellungs-CSS:
		Ext.ux.GridPrinter.stylesheetPath = 'Templates/Application/css/grid_print.css';
		
		var buchungGrid = new Ext.grid.EditorGridPanel({
			title:'Buchungen',
			frame: false,
			border:true,
			iconCls: 'buchungen',
			id:'buchungGrid',
			closable:true,
			store: buchungStore,
			columns: [
				{header: "Nr", width: 65, sortable: true, dataIndex: 'ID_Buchung'},
				{header: "Erstellt am", width: 105, sortable: true, xtype: 'datecolumn', format: 'd.m.Y', dataIndex: 'erstelltAm'},
				{	header: "Status", 
					width: 115,
					/*renderer:colorStatus,*/
					sortable: true, 
					dataIndex: 'buchungsStatus',
					editor: new Ext.form.ComboBox({
						triggerAction: 'all',
						mode: 'local',
						store: stati,
						editable:false,
						lazyRender: true,
						valueField: 'Buchungsstatus',
						displayField: 'Buchungsstatus',
						listClass: 'x-combo-list-small'
					})
				},
				{header: "Termin", width: 100, sortable: true, xtype: 'datecolumn', format: 'd.m.Y', dataIndex: 'terminAnreise'},
				{header: "Kinder", width: 65, sortable: true, dataIndex: 'kinder'},
				{header: "Erw.", width: 65, sortable: true, dataIndex: 'erwachsene'},
				{header: "Package", width: 135, sortable: true, dataIndex: 'packagename'},
				{header: "Organisation", width: 135, sortable: true, dataIndex: 'Organisation'},
				{header: "Ansprechperson", width: 150, sortable: true, dataIndex: 'Ansprechperson'}
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
			  store: buchungStore,
			  displayInfo: true,
			  plugins: new Ext.ux.ProgressBarPager()
			}),
			tbar: new Ext.Toolbar({
				items: [{
					tooltip:'Buchung anzeigen',
					iconCls:'lesen',
					id:'BuchungShowButton',
					width:50,
					handler: BuchungAnzeigen
				},{
					tooltip:'Buchung bearbeiten',
					iconCls:'schreiben',
					id:'BuchungEditButton',
					width:50,
					handler: BuchungBearbeiten
				},{
					tooltip:'Mail an Kunden senden',
					iconCls:'email',
					id:'MailSendenButton',
					width:50,
					handler:MailSenden
				},{
					tooltip:'Tabelle drucken',
					iconCls:'print',
					id:'DruckenButton',
					width:50,
					handler:function() {
						//nachträglich eininstalliertes extjs-Plugin
						Ext.ux.GridPrinter.print(buchungGrid);
					}
				},'->','Status: ',{
					xtype:'combo',
					typeAhead: false,
					triggerAction:'all',
					mode: 'local',
					width:100,
					store: stati,
					editable:false,
					id:'comboFilter',
					value:'offen',
					valueField: 'Buchungsstatus',
					displayField: 'Buchungsstatus'
				},{
					  xtype:'button',
					  enableToggle: true,
					  width:70,
					  id:'btnFilter',
					  text:'gefiltert',
					  pressed:true,
					  toggleHandler: function() {
						if(Ext.getCmp('btnFilter').pressed) {
							Ext.getCmp('btnFilter').setText('gefiltert');
						}
						else {
							Ext.getCmp('btnFilter').setText('ungefiltert');
						}
						buchungStore.setBaseParam('filter', Ext.getCmp('btnFilter').pressed);
						buchungStore.setBaseParam('comboFilter', Ext.getCmp('comboFilter').getValue());
						buchungStore.load({params:{start:0, limit:10}});
					  },
					  tooltip:'Filter aus Combobox benutzen'
				  },'-','-','Suchen: ',{
					xtype:'textfield',
					name:'searchfield',
					id:'buchungsuchfeld',
					enableKeyEvents:true,
					emptyText:'Suchkriterien'
				}]
			})
		});	 
		Ext.getCmp('comboFilter').addListener('select',function() {
			buchungStore.setBaseParam('comboFilter', Ext.getCmp('comboFilter').getValue());
			buchungStore.load({params:{start:0, limit:10}});
		});
				
		
		//dieser Event wird bei jedem Keyup-Event des Suchfeldes ausgelöst. Wir machen nach jedem Buchstaben einen AJAX-Request und
		//schießen das Ergebnis dieses neuen Requests an den Store. Hoffentlich ist der Datenbankzugriff schnell genug damit sich dieser geile
		//moderne Effekt den ich mir vorstelle auch zu 100% entfaltet... --> wenn dieser Kommentar in der Endversion noch enthalten ist, dann gehts :)
		Ext.getCmp('buchungsuchfeld').addListener('keyup',function(tf,e) {
			buchungStore.reload({params:{suchen:tf.getValue(),start:0, limit:10}});
		});

		//beim Schließen des Buchungs-Tabs müssen auch sämtliche erzeugte Variablen wieder zerstört werden, damit der Referenz-Count auf 0 gestellt wird
		//damit der Garbage-Collector seine Arbeit erledigen kann.
		buchungGrid.addListener('beforedestroy',function() {
			buchungStore.destroy();
		});
		//die ersten 10 Datensätze in den Store laden (Event an die Grid)
		pollForChanges(buchungGrid,true);
		//hier wird die gerade erstellte GridForm-Kombination an das TabPanel im Center-Bereich geadded
		Ext.getCmp('tabcenter').add(buchungGrid).show();
		//doLayout ist notwendig, wenn ein Item in einen bereits gerenderten Container nachträglich
		//eingepflegt wird. So wie die grid in das Tabpanel.
		//Ext.getCmp('bl2_center').doLayout();
	} else Ext.getCmp('tabcenter').setActiveTab('buchungGrid');
}