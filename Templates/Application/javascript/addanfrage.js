/************************************************************************************************
----------------------------Funktion, um einen Tab zum Mainbereich zu adden.----------------------------------
Ich habe mich für diese Variante entschieden, da somit das Initiieren des Programmes flotter geht. 
Beim Instanziieren eines neuen Tabs für das Center-Panel wird der jeweilige Programmteil nachgeladen. 
Ich bin der Meinung das diese Herangehensweise den Workflow des Users am wenigsten beeinträchtigt.
Technisch wäre es auch möglich, alle Tabs beim Ext.onReady()  Event zu laden. Man hätte dadurch den Vorteil
einer verkürzten Zeit während des Betriebes. Dafür dauert das initiierende Laden des Programmes um ein viel-
faches länger und nicht benötigte Programmteile werden gleich von Beginn an immer mitgeladen.
*************************************************************************************************/

//addAnfrageTab() erstellt ein Ticketsystem für die eingehenden Anfragen der potentiellen Kunden
//technisch wird ein FormPanel erstellt, indem sich (grob umrissen) ein GridPanel im Center und ein Fielset im Osten
//des Layouts (Border-Layout) befinden. Dieses FormPanel wird in das TabPanel "tabcenter" als neuer Tab eingehängt.
//Den größten Zeilenaufwand nehmen hier die FieldSets mit den vielen Steuerelementen (Textfields, Combo-Boxes, Datefiels...)
//ein.
function addAnfrageTab(){
	//zuerst gehört gecheckt, ob es den Anfragentab nicht vielleicht schon gibt.
	//wenn ja, wird er nur mehr focusiert, wenn nein werden die Grids, Forms und Stores erstellt
	//und alles läuft wie geschmiert :)
	if(document.getElementById('anfrageGridForm') == null) {
		
		  // create the data store
		  var ticketstore = new Ext.data.Store({
			  proxy: new Ext.data.HttpProxy({
				url: 'index.php',
				method: 'POST'
			  }),
			  baseParams:{
				cmd: "FillAnfrageGrid",
				archiv: false
			  },
			  remoteSort:false,
			  sortInfo: {field:'ID_Anfrage', direction:'DESC'},
			  reader: new Ext.data.JsonReader({
				root: 'results',
				totalProperty: 'total'
			  },Ext.data.Record.create([
					 {name: 'ID_Anfrage', type:'int'},
					 {name: 'kategorie', type:'string'},
					 {name: 'organisation', type:'string'},
					 {name: 'packagename', type:'string'},
					 {name: 'termin', type: 'date', dateFormat: 'Y-m-d'},
					 {name: 'ersatztermin', type: 'date', dateFormat: 'Y-m-d'},
					 {name: 'kinder', type:'int'},
					 {name: 'erwachsene', type:'int'},
					 {name: 'female', type:'int'},
					 {name: 'male', type:'int'},
					 {name: 'vegetarier', type:'int'},
					 {name: 'relVorschriften', type:'string'},
					 {name: 'allergien', type:'string'},
					 {name: 'abgefrKnr', type:'string'},
					 {name: 'adresse', type:'string'},
					 {name: 'plz', type:'string'},
					 {name: 'ort', type:'string'},
					 {name: 'tel', type:'string'},
					 {name: 'fax', type:'string'},
					 {name: 'email', type:'string'},                 
					 {name: 'vorname', type:'string'},
					 {name: 'nachname', type:'string'},
					 {name: 'ipadr', type:'string'},
					 {name: 'telAP', type:'string'},
					 {name: 'emailAP', type:'string'},
					 {name: 'uebernommen', type:'boolean'},
					 {name: 'abgelehnt', type:'boolean'},
					 {name: 'username', type:'string'},
					 {name: 'letzteBearbeitung', type:'date', dateFormat: 'Y-m-d'},
					 {name: 'bemerkung', type:'string'},
					 {name: 'erstelltAm', type: 'date', dateFormat: 'Y-m-d'}
				  ])
			  )
		  });
		  //das Polling nach neuen Datensätzen soll so lange true sein, bis ein Datensatz in Bearbeitung steht. Während dieser Bearbeitung
		  //wird diese Eigenschaft auf false gesetzt und somit ein reload des stores verhindert.
		  ticketstore._pollEnabled = true;
		  ticketstore.addListener('update',function(st,rec,op) {
			  //Hier brauchen wir einen kleinen Trick den ich (Gott sei Dank)
			  //aus dem Netz der Netze geklaut habe! Wir müssen ja für jedes upgedatete Feld
			  //einen Ajax-Update-Call machen. Ich hatte aber von rec.getChanges() nur ein Objekt
			  //indem ALLE geänderten Werte gespeichert waren. Diese kurze aber echt geile Schleife
			  //löst mein Problem und setzt für jede Property des Objects einen AJAX-Update-Call ab
			  //mit den geänderten Werten! Genial einfach, einfach genial!!
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
								cmd:"Update",
								key: 'ID_Anfrage',
								keyID: rec.data.ID_Anfrage,
								table:"tAnfrage",
								field: fieldwert,
								value: obj[j]
							},
							failure:function(response,options){
								Ext.Msg.alert('Fehler', 'Server wurde nicht erreicht! Bitte versuchen Sie es später nochmals.');
							},
							success:function(response,options){
								var responseJSON = Ext.decode(response.responseText);
			
								if(responseJSON.error==true) { //FEHLERBEHANDLUNG
									handleException(responseJSON);
								} else {
									if(responseJSON.success == true) {
										ticketstore.reload();
										ticketstore.commitChanges();
										Ext.example.msg('Status', 'Updated successfully!');
									} else Ext.example.msg('Fehler!', 'Leider kein Zugriff');
								}
							}
						});
				 }
		  });
		  
		//custom renderer für Erstellt am: Soll das Datum rot angeben, wenn sei dem Erstellen min. 2 Tage vergangen sind und noch nicht bearbeitet wurde.
		function urgent(value, metaData, record, rowIndex, colIndex, store){
			var ONE_DAY = 1000 * 60 * 60 * 24; //ein Tag in Millisek.
			//Beide Werte in Millisek. umrechnen
			var date1_ms = new Date().getTime();
			var date2_ms = value.getTime();
			// Differenz in Millisekunden
			var difference_ms = date1_ms - date2_ms
			// Auf Tage zurückrechnen
			var difference = Math.round(difference_ms/ONE_DAY)
		
			if(difference > 2 && record.data.abgelehnt==false && record.data.uebernommen==false) 
				{metaData.css = 'redboldtext';}
			return Ext.util.Format.date(value,'d.m.Y');
		}

				
		  // create the Grid
		  var anfrageGrid = new Ext.grid.GridPanel({
			  store: ticketstore,
			  columns: [
				  {header: "Nr", width: 65, sortable: true, dataIndex: 'ID_Anfrage'},
				  {header: "Eingelangt am", renderer: urgent, width: 95, sortable: true, dataIndex: 'erstelltAm'},
				  {header: "Organisation", width: 135, sortable: true, dataIndex: 'organisation'},
				  {header: "Nachname", width: 115, sortable: true, dataIndex: 'nachname'},
				  {header: "Package", width: 115, sortable: true, dataIndex: 'packagename'},
				  {header: "Termin", id:"Termin", width: 95, sortable: true, xtype: 'datecolumn', format: 'd.m.Y', dataIndex: 'termin'}
			  ],
			  stripeRows: true,
			  viewConfig: {
				  forceFit:true
			  },    
			  layout:'fit',
			  region:'center',
			  sm: new Ext.grid.RowSelectionModel({
					singleSelect:true,
					listeners: {
						rowselect: function(sm, row, rec) {
							Ext.getCmp("anfrageGridForm").getForm().loadRecord(rec);
						}
					}
			  }),
			  //Mit diesem Listener auf den "render-Event" könnten wir den ersten Datensatz 
			  //während des Renderns der Grid auswählen lassen.
			  listeners: {
				render: function(g) {
					g.getSelectionModel().selectRow(0);
				},
				delay: 10
			  },
			  bbar: new Ext.PagingToolbar({
				  pageSize: 10,
				  store: ticketstore,
				  displayInfo: true,
				  plugins: new Ext.ux.ProgressBarPager()
			  }),
			  //die Top-Toolbar der Grid, hier sind die Buttons "neue Anfrage",
			  //"Anfrage übernehmen", "abgeschlossene Anfragen anzeigen" und die Suchleiste zuhause.
			  tbar: new Ext.Toolbar({
				  items: [{
					  tooltip:'Datensatz anzeigen',
					  iconCls:'lesen',
					  id:'AnfrageShowButton',
					  handler:function() {
						var rec = anfrageGrid.getSelectionModel().getSelected();
						if(rec) 
						{
							 //Datensatz Anzeigen - 1. Fieldset (Buchungsdaten) 
							 var showAnfrFS1 = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									defaults: {width: 200},
									bodyStyle:'padding:10px',
									defaultType: 'textfield',
									title:'Buchungsdaten',
									height: 'auto',
									border: false,
									items:[{
										  fieldLabel: 'Anfrage-ID',
										  disabled:true,
										  readOnly:true,											  
										  name: 'ID_Anfrage'
									  },{
										  fieldLabel: 'IP Adresse',
										  readOnly:true,
										  name: 'ipadr'
									  },{
										  fieldLabel: 'Kategorie',
										  readOnly:true,
										  name: 'kategorie'
									  },{
										  fieldLabel: 'Package',
										  readOnly:true,
										  name: 'packagename'
									  },{
										  fieldLabel: 'Termin',
										  readOnly:true,
										  hideTrigger:true,
										  format: 'd.m.Y',
										  xtype:'datefield',
										  name: 'termin'
									  },{
										  fieldLabel: 'Ersatz-Termin',
										  readOnly:true,
										  hideTrigger:true,
										  format: 'd.m.Y',
										  xtype:'datefield',
										  name: 'ersatztermin'
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
									  },{
										  fieldLabel: 'Vegetarier',
										  readOnly:true,
										  name: 'vegetarier'
									  },{
										  fieldLabel: 'Kundennr.',
										  readOnly:true,
										  name: 'abgefrKnr'
									  }]
							 });
							  
						   //Datensatz Anzeigen - 2. Fieldset (Personendaten)
							 var showAnfrFS2 = new Ext.form.FieldSet({
								labelAlign: 'left',
								labelWidth: 150,
								layout:'form',
								defaults: {width: 200},
								defaultType: 'textfield',
								bodyStyle:'padding:10px',
								title:'Personendaten',
								height: 'auto',
								border: false,
								items:[{  fieldLabel: 'Schulen- /Firmenname',
										  readOnly:true,
										  name: 'organisation'
									  },{
										  fieldLabel: 'Vorname',
										  readOnly:true,
										  name: 'vorname'
									  },{
										  fieldLabel: 'Nachname',
										  readOnly:true,
										  name: 'nachname'
									  },{
										  fieldLabel: 'Adresse',
										  readOnly:true,
										  name: 'adresse'
									  },{
										  fieldLabel: 'PLZ',
										  readOnly:true,
										  name: 'plz'
									  },{
										  fieldLabel: 'Ort',
										  readOnly:true,
										  name: 'ort'
									  },{
										  fieldLabel: 'Telefon',
										  readOnly:true,
										  name: 'tel'
									  },{
										  fieldLabel: 'Fax',
										  readOnly:true,
										  name: 'fax'
									  },{
										  fieldLabel: 'eMail',
										  readOnly:true,
										  name: 'email'
									  },{
										  fieldLabel: 'Telefon pers.',
										  readOnly:true,
										  name: 'telAP'
									  },{
										  fieldLabel: 'eMail pers.',
										  readOnly:true,
										  name: 'emailAP'
									  }]
							 });
							 
						   //Datensatz Anzeigen - 3. Fieldset (Sonstige Daten)
							 var showAnfrFS3 = new Ext.form.FieldSet({
								labelAlign: 'left',
								labelWidth: 150,
								layout:'form',
								title:'Sonstiges',
								bodyStyle:'padding:10px',
								defaults: {width: 200},
								defaultType: 'textfield',
								height: 'auto',
								border: false,
								items:[{
										  fieldLabel: 'Allergien',
										  xtype: 'textarea',
										  readOnly:true,
										  name: 'allergien'
									  },{
										  fieldLabel: 'religiöse Vorschriften',
										  xtype: 'textarea',
										  readOnly:true,
										  name: 'relVorschriften'
									  },{
										  fieldLabel: 'Übernommen',
										  readOnly:true,
										  disabled:true,
										  xtype: 'checkbox',
										  name: 'uebernommen'
									  },{
										  fieldLabel: 'Abgelehnt',
										  readOnly:true,
										  disabled:true,
										  xtype: 'checkbox',
										  name: 'abgelehnt'
									  },{
										  fieldLabel: 'Erstellt am',
										  readOnly:true,
										  hideTrigger:true,
										  disabled:true,
										  format: 'd.m.Y',
										  xtype:'datefield',
										  name: 'erstelltAm'
									  },{
										  fieldLabel: 'Zuletzt bearbeitet von',
										  disabled:true,
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
									  },{
										  fieldLabel: 'Bemerkung',
										  xtype: 'textarea',
										  readOnly:true,
										  name: 'bemerkung'
									  }]
							});
					  
							var showAnfrFP = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'ticketForm',
								items: [{
									xtype:'tabpanel',
									activeTab: 0,
									defaults:{autoHeight:true}, 
									items:[showAnfrFS1, showAnfrFS2, showAnfrFS3]
								}],
								buttons: [{text:'Ok',
										   handler:function() {win.close();}}]
							});
					  
							var win = new Ext.Window({
								title:'Anfrage-Datensatz anzeigen',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [showAnfrFP]
							});
							showAnfrFP.getForm().loadRecord(anfrageGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}	
					  },	          			
					  width:50
				  },{
					  tooltip:'Datensatz ändern',
					  iconCls:'schreiben',
					  handler:function() {
						//das Polling des Stores wird ausgeschalten, solange bis die Bearbeitung des Datensatzes abgeschlossen ist.
						ticketstore._pollEnabled = false;
						//der in der Grid selektierte Record aus dem Store wird vollständig in der Variable rec gespeichert, und in das FormPanel zum Bearbeiten geladen.
						var rec = anfrageGrid.getSelectionModel().getSelected();
						//wenn diese if-Abfrage false ergibt ist kein Datensatz in der Grid selektiert und es wird ein entsprechender Hinweis ausgegeben.
						if(rec) 
						{
							 //Datensatz Ändern - 1. Fieldset (Buchungsdaten) 
							 var writeAnfrFS1 = new Ext.form.FieldSet({
									labelAlign: 'left',
									labelWidth: 150,
									layout:'form',
									defaults: {width: 200},
									bodyStyle:'padding:10px',
									defaultType: 'textfield',
									title:'Buchungsdaten',
									height: 'auto',
									border: false,
									items:[{
										  fieldLabel: 'Anfrage-ID',
										  readOnly:true,
										  name: 'ID_Anfrage'
									  },{
										  fieldLabel: 'IP Adresse',
										  readOnly:true,
										  name: 'ipadr'
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
										  name: 'kategorie'
									  },{
										  fieldLabel: 'Package*',
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
										  fieldLabel: 'Termin*',
										  allowBlank:false,
										  format: 'd.m.Y',
										  //minValue: new Date(),
										  xtype:'datefield',
										  name: 'termin'
									  },{
										  fieldLabel: 'Ersatz-Termin',
										  format: 'd.m.Y',
										  //minValue: new Date(),
										  xtype:'datefield',
										  name: 'ersatztermin'
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
									  },{
										  fieldLabel: 'Vegetarier',
										  name: 'vegetarier'
									  },{
										  fieldLabel: 'Kundennr.',
										  name: 'abgefrKnr'
									  }]
							 });
							  
						   //Datensatz Ändern - 2. Fieldset (Personendaten)
							 var writeAnfrFS2 = new Ext.form.FieldSet({
								labelAlign: 'left',
								labelWidth: 150,
								layout:'form',
								defaults: {width: 200},
								defaultType: 'textfield',
								bodyStyle:'padding:10px',
								title:'Personendaten',
								height: 'auto',
								border: false,
								items:[{  fieldLabel:'Schulen- /Firmenname',
										  name: 'organisation'
									  },{
										  fieldLabel: 'Vorname*',
										  allowBlank:false,
										  name: 'vorname'
									  },{
										  fieldLabel: 'Nachname*',
										  allowBlank:false,
										  name: 'nachname'
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
										  name: 'tel'
									  },{
										  fieldLabel: 'Fax',
										  name: 'fax'
									  },{
										  fieldLabel: 'eMail',
										  vtype:'email',
										  name: 'email'
									  },{
										  fieldLabel: 'Tel. Ansprechpartner*',
										  allowBlank:false,
										  name: 'telAP'
									  },{
										  fieldLabel: 'eMail Ansprechpartner*',
										  allowBlank:false,
										  vtype:'email',
										  name: 'emailAP'
									  }]
							 });
							 
						   //Datensatz Ändern - 3. Fieldset (Sonstige Daten)
							 var writeAnfrFS3 = new Ext.form.FieldSet({
								labelAlign: 'left',
								labelWidth: 150,
								layout:'form',
								title:'Sonstiges',
								bodyStyle:'padding:10px',
								defaults: {width: 200},
								defaultType: 'textfield',
								height: 'auto',
								border: false,
								items:[{
										  fieldLabel: 'Allergien',
										  xtype: 'textarea',
										  name: 'allergien'
									  },{
										  fieldLabel: 'religiöse Vorschriften',
										  xtype: 'textarea',
										  name: 'relVorschriften'
									  },{
										  fieldLabel: 'Übernommen',
										  xtype: 'checkbox',
										  name: 'uebernommen'
									  },{
										  fieldLabel: 'Abgelehnt',
										  xtype: 'checkbox',
										  name: 'abgelehnt'
									  },{
										  fieldLabel: 'Zuletzt bearbeitet von',
										  readOnly:true,
										  name: 'username'
									  },{
										  fieldLabel: 'Zuletzt bearbeitet am',
										  readOnly:true,
										  hideTrigger:true,
										  format: 'd.m.Y',
										  xtype:'datefield',
										  name: 'letzteBearbeitung'
									  },{
										  fieldLabel: 'Bemerkung',
										  xtype: 'textarea',
										  name: 'bemerkung'
									  }]
							});

							var writeAnfrFP = new Ext.form.FormPanel({
								labelAlign: 'left',
								id:'ticketForm',
								monitorValid:true,
								items: [{
									xtype:'tabpanel',
									activeTab: 0,
									defaults:{autoHeight:true}, 
									items:[writeAnfrFS1, writeAnfrFS2, writeAnfrFS3]
								}],
								buttons: [{ text:'save',
											iconCls:'save',
											formBind: true,
											handler: function() {
												writeAnfrFP.getForm().updateRecord(anfrageGrid.getSelectionModel().getSelected());
												//das Polling für den Store wieder aktivieren...
												ticketstore._pollEnabled = true;
												win.close();
											}
										  },{
											text: 'cancel',
											handler: function() {
												//das Polling für den Store wieder aktivieren...
												ticketstore._pollEnabled = true;
												win.close();
											}
										  }
										 ]
							});
					  
							var win = new Ext.Window({
								title:'Anfrage-Datensatz ändern',
								closable:true,
								width:420,
								border:true,
								resizable:false,
								modal:true,
								items: [writeAnfrFP]
							});
							writeAnfrFP.getForm().loadRecord(anfrageGrid.getSelectionModel().getSelected());
							win.show(this);
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  },
					  width:50
				  },{
					  tooltip:'Neuen Datensatz anlegen',
					  iconCls:'add',
					  handler: function() {
						 //Datensatz NEU - 1. Fieldset (Buchungsdaten) 
						 var neuAnfrFS1 = new Ext.form.FieldSet({
								labelAlign: 'left',
								labelWidth: 150,
								layout:'form',
								defaults: {width: 200},
								bodyStyle:'padding:10px',
								defaultType: 'textfield',
								title:'Buchungsdaten',
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
									  fieldLabel: 'Package*',
									  xtype:'combo',
									  allowBlank:false,
									  editable:false,
									  id:'PackageIdCombo',
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
												{name: 'packagename'}
											])),
										baseParams:{
											start: 0,
											cmd: "GetPackage"
										},
										autoLoad: true	
									  }),
									  valueField: 'ID_Package',
									  displayField: 'packagename',
									  hiddenName: 'ID_Package',
									  hiddenId:'hiddenPackageIdCombo',
									  name:'ID_Package'									  
								  },{
									  fieldLabel: 'Termin*',
									  allowBlank:false,
									  format: 'd.m.Y',
									  minValue: new Date(),
									  xtype:'xdatefield',
									  name: 'termin'
								  },{
									  fieldLabel: 'Ersatz-Termin',
									  format: 'd.m.Y',
									  minValue: new Date(),
									  xtype:'xdatefield',
									  name: 'ersatztermin'
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
								  },{
									  fieldLabel: 'Vegetarier',
									  name: 'vegetarier'
								  },{
									  fieldLabel: 'Kundennr.',
									  name: 'abgefrKnr'
								  }]
						 });
						  
					   //Datensatz NEU - 2. Fieldset (Personendaten)
						 var neuAnfrFS2 = new Ext.form.FieldSet({
							labelAlign: 'left',
							labelWidth: 150,
							layout:'form',
							defaults: {width: 200},
							defaultType: 'textfield',
							bodyStyle:'padding:10px',
							title:'Personendaten',
							height: 'auto',
							border: false,
							items:[{  fieldLabel:'Schulen- /Firmenname',
									  name: 'organisation'
								  },{
									  fieldLabel: 'Vorname*',
									  allowBlank:false,
									  name: 'vorname'
								  },{
									  fieldLabel: 'Nachname*',
									  allowBlank:false,
									  name: 'nachname'
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
									  name: 'tel'
								  },{
									  fieldLabel: 'Fax',
									  name: 'fax'
								  },{
									  fieldLabel: 'eMail',
									  vtype:'email',
									  name: 'email'
								  },{
									  fieldLabel: 'Tel. Ansprechperson*',
									  allowBlank:false,
									  name: 'telAP'
								  },{
									  fieldLabel: 'eMail Ansprechperson*',
									  allowBlank:false,
									  vtype:'email',
									  name: 'emailAP'
								  }]
						 });
						 
						 
					   //Datensatz NEU - 3. Fieldset (Sonstige Daten)
						 var neuAnfrFS3 = new Ext.form.FieldSet({
							labelAlign: 'left',
							labelWidth: 150,
							layout:'form',
							title:'Sonstiges',
							bodyStyle:'padding:10px',
							defaults: {width: 200},
							defaultType: 'textfield',
							height: 'auto',
							border: false,
							items:[{
									  fieldLabel: 'Allergien',
									  xtype: 'textarea',
									  name: 'allergien'
								  },{
									  fieldLabel: 'religiöse Vorschriften',
									  xtype: 'textarea',
									  name: 'relVorschriften'
								  },{
									  fieldLabel: 'Übernommen',
									  xtype: 'checkbox',
									  name: 'uebernommen'
								  },{
									  fieldLabel: 'Abgelehnt',
									  xtype: 'checkbox',
									  name: 'abgelehnt'
								  },{
									  fieldLabel: 'Bemerkung',
									  xtype: 'textarea',
									  name: 'bemerkung'
								  }]
						});
				  
						var neuAnfrFP = new Ext.form.FormPanel({
							labelAlign: 'left',
							id:'ticketForm',
							monitorValid:true,
							url:'index.php',
							items: [{
								xtype:'tabpanel',
								activeTab: 0,
								defaults:{autoHeight:true}, 
								items:[neuAnfrFS1, neuAnfrFS2, neuAnfrFS3]
							}],
							buttons: [{
							  text: 'Save',
							  formBind: true,
							  iconCls:'save',
							  handler: function(){ 
								neuAnfrFP.getForm().submit({ 
									method:'POST', 
									waitTitle:'Connecting', 
									waitMsg:'Sending data...',
									params: {
										cmd:'InsertAnfrage'										
									},
									success:function(form, action){ 
										if(action.result.success == true) {
											Ext.example.msg('Status', 'Saved successfully!');
											ticketstore.reload();
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
							title:'Anfrage-Datensatz hinzufügen',
							closable:true,
							width:420,
							border:true,
							resizable:false,
							modal:true,
							items: [neuAnfrFP]
						});
						win.show(this);
					  },
					  width:50
				  },{
					  tooltip:'Datensatz löschen',
					  handler: function() {
						var rec = anfrageGrid.getSelectionModel().getSelected();
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
													key: 'ID_Anfrage',
													keyID: anfrageGrid.getSelectionModel().getSelected().data.ID_Anfrage,
													table:"tAnfrage",
													field: 'aktiv',
													value: 0
												},
												failure:function(response,options){
													Ext.example.msg('Status', 'Not deleted! Error Occured!');
												},
												success:function(response,options){
													var responseData = Ext.util.JSON.decode(response.responseText);
													if(responseData.success == true) {
														ticketstore.reload();
														ticketstore.commitChanges();
														Ext.example.msg('Status', 'Deleted successfully!');
													} else {
														Ext.example.msg('Fehler', 'Keine Berechtigung');
													}
												}
											});
										  ticketstore.reload(); 			            		  			
									}
							   },
							   icon: Ext.MessageBox.QUESTION
						  });
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  },
					  iconCls:'delete',
					  width:50
				  },{
					  tooltip:'Kunde und Buchung übernehmen',
					  iconCls:'grant',
					  handler: function() {
					  
						var rec = anfrageGrid.getSelectionModel().getSelected();
						//in diese Variable kommt im Success-Callback des Ansprechpersonen-Ajax-Requests die gewählte ID_Ansprechperson
						var AP_ID = null;
						
						if (rec) 
						{
							//STORES
							var SuggestionStore = new Ext.data.Store({
								proxy: new Ext.data.HttpProxy({
									url: 'index.php',
									method: 'POST'
								}),
								remoteSort:true,
								baseParams:{
									cmd: "GetMergeSuggestions",
									alle: false,
									plz:rec.data.plz,
									name:rec.data.organisation,
									resykd:rec.data.abgefrKnr
								},
								sortInfo: {field:'ID_Kunde', direction:'ASC'},
								reader: new Ext.data.JsonReader({
									root: 'results',
									totalProperty: 'total'
								},Ext.data.Record.create([
									{name: 'ID_Kunde', type:'int'},
									{name: 'kategoriek', type:'string'},
									{name: 'organisation', type:'string'},
									{name: 'adresse', type:'string'},
									{name: 'plz', type:'string'}
									])
								)
							});
							SuggestionStore.load({params:{start:0, limit:8}});

							var AnsprechpersonenStore = new Ext.data.Store({
								proxy: new Ext.data.HttpProxy({
									url: 'index.php',
									method: 'POST'
								}),
								remoteSort:true,
								baseParams:{
									cmd: "FillAnsprechpersonenGrid"
								},
								sortInfo: {field:'ID_Ansprechperson', direction:'ASC'},
								reader: new Ext.data.JsonReader({
									root: 'results',
									totalProperty: 'total'
								},Ext.data.Record.create([
									{name: 'ID_Ansprechperson', type:'int'},
									{name: 'nachname', type:'string'},
									{name: 'vorname', type:'string'},
									{name: 'email', type:'string'}
									])
								)
							});

							//GRIDS
							var SuggestionGrid = new Ext.grid.GridPanel({
								title:'Vorschläge für bereits bestehende Kunden',
								id:'SuggestionGrid',
								store: SuggestionStore,
								columns: [
									{header: "Kategorie", width: 95, sortable: false, dataIndex: 'kategoriek'},
									{header: "Organisation", width: 125, sortable: false, dataIndex: 'organisation'},
									{header: "PLZ", width: 75, sortable: false, dataIndex: 'plz'},
									{header: "Adresse", width: 135, sortable: false, dataIndex: 'adresse'}
								],
								stripeRows: true,
								columnWidth: .50,
								viewConfig: {
									forceFit:true
								},
								tbar: new Ext.Toolbar({
									items:['->',{
										xtype:'button',
										id:'btnAlle',
										handler: function(b) {
											SuggestionStore.setBaseParam('alle', Ext.getCmp('btnAlle').pressed);
											SuggestionStore.load({params:{start:0, limit:8}});
										},
										enableToggle: true,
										width: 50,
										tooltip:'alle',
										text:'alle Kunden'
									}]
								}),
								bbar: new Ext.PagingToolbar({
									pageSize: 8,
									store: SuggestionStore,
									displayInfo: true
								}),
								height:260,
								sm: new Ext.grid.RowSelectionModel({
									singleSelect:true
								})
							});

							var AnsprechpersonenGrid = new Ext.grid.GridPanel({
								title:'bestehende Ansprechpersonen',
								id:'AnsprechpersonenGrid',
								store: AnsprechpersonenStore,
								columns: [
									{header: "Nachname", width: 110, sortable: false, dataIndex: 'nachname'},
									{header: "Vorname", width: 135, sortable: false, dataIndex: 'vorname'},
									{header: "eMail", width: 90, sortable: false, dataIndex: 'email'}
								],
								stripeRows: true,
								columnWidth: .50,
								height:300,
								viewConfig: {
									forceFit:true
								},
								sm: new Ext.grid.RowSelectionModel({
									singleSelect:true
								})
							});

							//FORMS
							var kundenForm = new Ext.form.FormPanel({
								id:'uebernehmenFormKunde',
								defaultType: 'textfield',
								title:'neuer Kunde',
								columnWidth: .50,
								bodyStyle:'padding:10px',
								defaults: {
									width:150
								},
								labelAlign: 'left',
								items:[{
									fieldLabel: 'Kategorie',
									readOnly:true,
									name: 'kategorie'
								},{
									fieldLabel: 'Firma',
									readOnly:true,
									name: 'organisation'
								},{
									fieldLabel: 'Nachname',
									readOnly:true,
									name: 'nachname'
								},{
									fieldLabel: 'Adresse',
									readOnly:true,
									name: 'adresse'
								},{
									fieldLabel: 'PLZ',
									readOnly:true,
									name: 'plz'
								},{
									fieldLabel: 'Ort',
									readOnly:true,
									name: 'ort'
								},{
									fieldLabel: 'Telefon',
									readOnly:true,
									name: 'tel'
								},{
									fieldLabel: 'Fax',
									readOnly:true,
									name: 'fax'
								},{
									fieldLabel: 'eMail',
									readOnly:true,
									name: 'email'
								}],
								buttons:[{
									text:'Neuer Kunde',
									handler: function() {
										Ext.Ajax.request({		//hier wird der AJAX-Call für den Kunden abgesetzt.
											waitTitle:'Connecting', 
											waitMsg:'updating data...',
											url: 'index.php',
											params: {
												cmd:"InsertKunden",
												kategorie:rec.data.kategorie,
												organisation:rec.data.organisation,
												adresse:rec.data.adresse,
												plz:rec.data.plz,
												ort:rec.data.ort,
												telefon:rec.data.tel,
												fax:rec.data.fax,
												email:rec.data.email,
												resykd:rec.data.resykd,
												bemerkung:rec.data.bemerkung
											},
											failure:function(response,options){
												Ext.example.msg('Neuer Kunde', 'Nicht übernommen! Error Occured!');
											},
											success:function(response,options){
												var responseData = Ext.util.JSON.decode(response.responseText);
												if(responseData.success == true) {
													Ext.example.msg('Neuer Kunde', 'Kunde erfolgreich angelegt!');
													
													Ext.Ajax.request({		//hier wird der AJAX-Call für die Ansprechperson abgesetzt.
														waitTitle:'Connecting', 
														waitMsg:'updating data...',
														url: 'index.php',
														params: {
															cmd:"InsertAnsprechperson",
															ID_Kunde:responseData.neueID,
															nachname:rec.data.nachname,
															vorname:rec.data.vorname,
															telefon:rec.data.telAP,
															email:rec.data.emailAP
														},
														failure:function(response,options){
															Ext.example.msg('Neuer Kunde', 'Nicht übernommen! Error Occured!');
														},
														success:function(response,options){
															var responseData = Ext.util.JSON.decode(response.responseText);
															if(responseData.success == true) {
																Ext.example.msg('Neue Ansprechperson', 'Ansprechperson erfolgreich angelegt!');
																BuchungsForm.enable();
																AP_ID = responseData.neueAnsprechperson;
																Ext.getCmp('BuchungsForm').getForm().loadRecord(rec);
																UebernehmenTabpanel.setActiveTab(2);
																kundenCombination.disable();
															} else {
																Ext.example.msg('Ansprechperson', 'Keine Berechtigung für Ansprechpersonen!');
															}
														}
													});
												} else {
													Ext.example.msg('Kunden', 'Keine Berechtigung für Kunden!');
												}
											}
										});
										
									}
								},{
									text:'Bestehender Kunde',
									handler: function() {
										if(SuggestionGrid.getSelectionModel().hasSelection() == false) {
											Ext.example.msg('Kein Vorschlag ausgewählt', 'Bitte wählen Sie einen der Vorschläge aus!');
										} else {
											Ext.example.msg('Mergen', 'Kunde erfolgreich zugewiesen!');
											AnsprechpersonenCombination.enable();
											AnsprechpersonenStore.load({params:{ID_Kunde:SuggestionGrid.getSelectionModel().getSelected().data.ID_Kunde}});
											AnsprechpersonenForm.getForm().loadRecord(rec);
											UebernehmenTabpanel.setActiveTab(1);
											kundenCombination.disable();
										}
									}
								}]
							});
							

							var AnsprechpersonenForm = new Ext.form.FormPanel({
								id:'AnsprechpersonForm',
								defaultType: 'textfield',
								title:'neue Ansprechperson',
								columnWidth: .50,
								bodyStyle:'padding:10px',
								defaults: {
									width:150
								},
								labelAlign: 'left',
								items:[{
									fieldLabel: 'Nachname',
									readOnly:true,
									name: 'nachname'
								},{
									fieldLabel: 'Vorname',
									readOnly:true,
									name: 'vorname'
								},{
									fieldLabel: 'eMail',
									readOnly:true,
									name: 'email'
								},{
									fieldLabel: 'Telefon',
									readOnly:true,
									name: 'telefon'
								}],
								buttons:[{
									text:'Neue Ansprechperson',
									handler: function() {
										Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
											waitTitle:'Connecting', 
											waitMsg:'updating data...',
											url: 'index.php',
											params: {
												cmd:"InsertAnsprechperson",
												ID_Kunde:SuggestionGrid.getSelectionModel().getSelected().data.ID_Kunde,
												nachname:rec.data.nachname,
												vorname:rec.data.vorname,
												telefon:rec.data.telAP,
												email:rec.data.emailAP
											},
											failure:function(response,options){
												Ext.example.msg('Neue Ansprechperson', 'Nicht übernommen! Error Occured!');
											},
											success:function(response,options){
												var responseData = Ext.util.JSON.decode(response.responseText);
												if(responseData.success == true) {
													Ext.example.msg('Neue Ansprechperson', 'Ansprechperson erfolgreich angelegt!');
													Ext.getCmp('BuchungsForm').enable();
													Ext.getCmp('BuchungsForm').getForm().loadRecord(rec);
													AP_ID = responseData.neueAnsprechperson;
													UebernehmenTabpanel.setActiveTab(2);
													AnsprechpersonenCombination.disable();
												} else {
													Ext.example.msg('Ansprechperson', 'Keine Berechtigung für Ansprechperson!');
												}
											}
										});
									}
								},{
									text:'Bestehende Ansprechperson',
									handler: function() {
										if(AnsprechpersonenGrid.getSelectionModel().hasSelection() == false) {
											Ext.example.msg('Keine Person ausgewählt', 'Bitte wählen Sie eine der Ansprechpersonen aus!');
										} else {
											Ext.example.msg('Ansprechperson', 'Ansprechperson erfolgreich gewählt!');
											BuchungsForm.enable();
											Ext.getCmp('BuchungsForm').getForm().loadRecord(rec);
											AP_ID = AnsprechpersonenGrid.getSelectionModel().getSelected().data.ID_Ansprechperson;
											UebernehmenTabpanel.setActiveTab(2);
											AnsprechpersonenCombination.disable();
										}
									}
								}]
							});
							
							var BuchungsFieldset1 = new Ext.form.FieldSet({
								labelAlign: 'left',
								layout:'form',
								columnWidth: .50,
								defaults: {width: 150},
								bodyStyle:'padding:10px',
								defaultType: 'textfield',
								border: false,
								items:[{
									fieldLabel: 'Package',
									readOnly:true,
									name: 'packagename'
								},{
									fieldLabel: 'Termin',
									hideTrigger:true,
									format: 'd.m.Y',
									xtype:'datefield',
									readOnly:true,
									name: 'termin'
								},{
									fieldLabel: 'Ersatz-Termin',
									hideTrigger:true,
									format: 'd.m.Y',
									xtype:'datefield',
									readOnly:true,
									name: 'ersatztermin'
								},{
									fieldLabel: 'Anzahl Kinder',
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
								},{
									fieldLabel: 'Vegetarier',
									readOnly:true,
									name: 'vegetarier'
								}]
							});
							
							var BuchungsFieldset2 = new Ext.form.FieldSet({
								labelAlign: 'left',
								layout:'form',
								columnWidth: .50,
								defaults: {width: 125},
								bodyStyle:'padding:10px',
								defaultType: 'textfield',
								border: false,
								items:[{
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
									fieldLabel: 'Bemerkung',
									readOnly:true,
									xtype:'textarea',
									name: 'bemerkung'
								}]
							});
							
							
							var BuchungsForm = new Ext.form.FormPanel({				
								disabled:true,
								id:'BuchungsForm',
								title:'Buchung',
								layout:'column',
								items:[BuchungsFieldset1,BuchungsFieldset2],
								buttons:[{
									text:'Buchung übernehmen',
									handler: function() {
										Ext.Ajax.request({		
											waitTitle:'Connecting', 
											waitMsg:'updating data...',
											url: 'index.php',
											params: {
												ID_Anfrage:rec.data.ID_Anfrage,
												terminAnreise:rec.data.termin,
												ersatzTerminAnreise:rec.data.ersatztermin,
												kinder:rec.data.kinder,
												erwachsene:rec.data.erwachsene,
												female:rec.data.female,
												male:rec.data.male,
												vegetarier:rec.data.vegetarier,
												relVorschriften:rec.data.relVorschriften,
												allergien:rec.data.allergien,
												erstelltAm:rec.data.erstelltAm,
												buchungsStatus:'offen',
												ID_Ansprechperson:AP_ID,
												cmd:"InsertBuchung"
											},											
											failure:function(response,options){
												Ext.example.msg('Buchung', 'Nicht übernommen! Error Occured!');
											},
											success:function(response,options){
												var responseData = Ext.util.JSON.decode(response.responseText);
												if(responseData.success == true) {
													Ext.example.msg('Buchung', 'Buchung erfolgreich gespeichert');
													//Falls die Buchung richtig übernommen wurde, müssen wir auch das Ticket kennzeichnen. 2. Ajax-Call
													Ext.Ajax.request({
														waitTitle:'Connecting', 
														waitMsg:'updating data...',
														url: 'index.php',
														params: {
															cmd:"Update",
															key: 'ID_Anfrage',
															keyID: rec.data.ID_Anfrage,
															table:"tAnfrage",
															field: 'uebernommen',
															value: 1
														},
														failure:function(response,options){
															Ext.example.msg('Buchung', 'Nicht übernommen! Error Occured!');
														},
														success:function(response,options){
															var responseData = Ext.util.JSON.decode(response.responseText);
															if(responseData.success == true) {
																ticketstore.reload();
																ticketstore.commitChanges();
																Ext.example.msg('Buchung', 'Anfrage erfolgreich übernommen!');
																win.close();
															} else {
																Ext.example.msg('Buchung', 'Keine Berechtigung für Anfragen!');
															}
														}
													});
												} else {
													Ext.example.msg('Buchung', 'Keine Berechtigung für Buchung!');
												}
											}
										});
									}
								}]
							});

							//COMBINATIONS
							var kundenCombination = new Ext.Panel({
								title:'Kunde',
								id:'panelKundeUebernehmen',
								layout:'column',						
								items:[kundenForm, SuggestionGrid]
							});

							var AnsprechpersonenCombination = new Ext.Panel({
								title:'Ansprechperson',
								layout: 'column',
								disabled: true,
								items:[AnsprechpersonenForm, AnsprechpersonenGrid]
							});

							//TABPANEL
							var UebernehmenTabpanel = new Ext.TabPanel({
								activeTab: 0,
								items:[kundenCombination, AnsprechpersonenCombination, BuchungsForm]
							});

							//WINDOW
							var win = new Ext.Window({
								title:'Kunde / Ansprechperson / Buchung übernehmen',
								closable:true,
								width:600,
								layout:'fit',
								height: 380,
								frame:true,
								resizable:false,
								modal:true,
								items: [UebernehmenTabpanel]
							});
							Ext.getCmp('uebernehmenFormKunde').getForm().loadRecord(rec);
							win.show(this);		
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  },
					  width:50
				  },{
					  tooltip:'Anfrage ablehnen',
					  iconCls:'deny',
					  handler: function() {
						var rec = anfrageGrid.getSelectionModel().getSelected();
						if(rec) 
						{							
							Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
								waitTitle:'Connecting', 
								waitMsg:'updating data...',
								url: 'index.php',
								params: {
									cmd:"Update",
									key: 'ID_Anfrage',
									keyID: anfrageGrid.getSelectionModel().getSelected().data.ID_Anfrage,
									table:"tAnfrage",
									field: 'abgelehnt',
									value: 1
								},
								failure:function(response,options){
									Ext.example.msg('Status', 'Error Occured!');
								},
								success:function(response,options){
									var responseData = Ext.util.JSON.decode(response.responseText);
									if(responseData.success == true) {
										ticketstore.reload();
										ticketstore.commitChanges();
										Ext.example.msg('Status', 'Anfrage abgelehnt!');
									} else {
										Ext.example.msg('Fehler', 'Keine Berechtigung');
									}
								}
							});
							ticketstore.reload(); 
						} else {Ext.example.msg('Fehler', 'Bitte wählen Sie einen Datensatz aus!');}
					  },
					  width:50
				  },{
					tooltip:'Kunde Mail',
					iconCls:'email',
					id:'KundenMailButton',
					width:50,
					handler:function() {
						ticketstore._pollEnabled = false;
						
						if(anfrageGrid.getSelectionModel().hasSelection()) {
						
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
											to:anfrageGrid.getSelectionModel().getSelected().data.emailAP
										},
										success:function(form, action) { 
											Ext.example.msg('Success', 'Mail erfolgreich gesendet!');
											ticketstore._pollEnabled = true;
											win.close();
										},
										failure:function(form, action) { 
											ticketstore._pollEnabled = true;
											var responseJSON = Ext.decode(action.response.responseText);
											handleException(responseJSON); 
										} 
									}); 
								}
							  },{
								  text: 'Cancel',
								  handler: function() {
									win.close();
									ticketstore._pollEnabled = true;
								  }
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
				},'->','-',{
					  xtype:'button',
					  id:'barchiv',
					  handler: function(b) {
						//Beim ersten Aufruf des Archiv-Buttons wird der Basisparameter "archiv" auf den Toogle-Status des
						//Buttons gesetzt. Beim initialen Laden des Stores ist dieser Button noch nicht erstellt, deswegen
						//diese Vorgehensweise.
						ticketstore.setBaseParam('archiv', Ext.getCmp('barchiv').pressed);
						ticketstore.load({params:{start:0, limit:10}});
					  },
					  enableToggle: true,
					  width: 50,
					  tooltip:'Archiv',
					  iconCls:'archiv'
				  },{ 
					  xtype:'textfield',
					  name:'searchfield',
					  id:'anfragesuchfeld',
					  enableKeyEvents:true,
					  emptyText:'Anfrage suchen...'
				  }]
			  })
		  });

		  
		  //dieser Event wird bei jedem Keyup-Event des Suchfeldes ausgelöst. Wir machen nach jedem Buchstaben einen AJAX-Request und
		  //schießen das Ergebnis dieses neuen Requests an den Store. Hoffentlich ist der Datenbankzugriff schnell genug damit sich dieser geile
		  //moderne Effekt den ich mir vorstelle auch zu 100% entfaltet... --> wenn dieser Kommentar in der Endversion noch enthalten ist, dann gehts :)
		  Ext.getCmp('anfragesuchfeld').addListener('keyup',function(tf,e) {
			ticketstore.reload({params:{suchen:tf.getValue(),start:0, limit:10}});
		  });
		  
		  anfrageGrid.getView().getRowClass = function(record, index){
			  if (record.data.uebernommen == true) {
				  return 'lightgreen';
			  }
			  if (record.data.abgelehnt == true) {
				  return 'lightred';
			  }
			};
		  
		  //Erstellen des Fieldsets, in dem die Daten angezeigt werden, die in der Grid
		  //ausgewählt sind.
		  var anfrageMainFieldset = new Ext.form.FieldSet({
			  labelWidth: 90,
			  region:'east',
			  width: 230,
			  margins: '15 0 0 0',
			  defaults: {width: 110},
			  defaultType: 'textfield',
			  height: 'auto',
			  border: false,
			  items: [{
				  fieldLabel: 'IP Adresse',
				  readOnly:true,
				  name: 'ipadr'
			  },{
				  fieldLabel: 'Kategorie',
				  readOnly:true,
				  name: 'kategorie'
			  },{
				  fieldLabel: 'Kinder',
				  readOnly:true,
				  name: 'kinder'
			  },{
				  fieldLabel: 'Erwachsene',
				  readOnly:true,
				  name: 'erwachsene'
			  },{
				  fieldLabel: 'Adresse',
				  readOnly:true,
				  name: 'adresse'
			  },{
				  fieldLabel: 'PLZ',
				  readOnly:true,
				  name: 'plz'
			  },{
				  fieldLabel: 'Ort',
				  readOnly:true,
				  name: 'ort'
			  },{
				  fieldLabel: 'e-Mail',
				  readOnly:true,
				  name: 'emailAP'
			  },{
				  fieldLabel: 'Vorname AP',
				  readOnly:true,
				  name: 'vorname'
			  },{
				  fieldLabel: 'Nachname AP',
				  readOnly:true,
				  name: 'nachname'
			  },{
				  fieldLabel: 'letzter Bearbeiter',
				  readOnly:true,
				  name: 'username'
			  },{
				  fieldLabel: 'zuletzt bearbeitet',
				  readOnly:true,
				  hideTrigger:true,
				  format: 'd.m.Y',
				  xtype:'datefield',
				  name: 'letzteBearbeitung'
			  }]
		  });
		  //In diesem FormPanel werden die erstellte Grid und das Fieldset gemerged.
		  var anfrageGridForm = new Ext.FormPanel({
			  id: 'anfrageGridForm',
			  frame: false,
			  labelAlign: 'left',
			  iconCls: 'anfrage',
			  closable:true,
			  title: 'Anfragen',
			  layout: 'border',
			  items: [anfrageGrid, anfrageMainFieldset]
		  });
		  //beim Schließen des Anfrage-Tabs müssen auch sämtliche erzeugte Variablen wieder zerstört werden, damit der Referenz-Count auf 0 gestellt wird
		  //damit der Garbage-Collector seine Arbeit erledigen kann.
		  anfrageGridForm.addListener('beforedestroy',function() {
			ticketstore.destroy();
			anfrageGrid.destroy();
			anfrageMainFieldset.destroy();
		  });
		  //die ersten 10 Datensätze in den Store laden (Event an die Grid)
		  pollForChanges(anfrageGrid,true);
		  //hier wird die gerade erstellte GridForm-Kombination an das TabPanel im Center-Bereich geadded
		  Ext.getCmp('tabcenter').add(anfrageGridForm).show();
		  //doLayout ist notwendig, wenn ein Item in einen bereits gerenderten Container nachträglich
		  //eingepflegt wird. So wie die grid in das Tabpanel.
		  Ext.getCmp('bl2_center').doLayout();
	} else Ext.getCmp('tabcenter').setActiveTab('anfrageGridForm');
}