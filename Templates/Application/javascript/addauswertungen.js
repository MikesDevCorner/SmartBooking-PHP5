                                                                     
                                             
/************************************************************************************************
----------------------------Funktion, um einen Tab zum Mainbereich zu adden.----------------------------------
Ich habe mich für diese Variante entschieden, da somit das Initiieren des Programmes flotter geht. 
Beim Instanziieren eines neuen Tabs für das Center-Panel wird der jeweilige Programmteil nachgeladen. 
Ich bin der Meinung das diese Herangehensweise den Workflow des Users am wenigsten beeinträchtigt.
Technisch wäre es auch möglich, alle Tabs beim Ext.onReady()  Event zu laden. Man hätte dadurch den Vorteil
einer verkürzten Zeit während des Betriebes. Dafür dauert das initiierende Laden des Programmes um ein viel-
faches länger und nicht benötigte Programmteile werden gleich von Beginn an immer mitgeladen.
*************************************************************************************************/

//Pfad für Druck-Layout-Einstellungs-CSS:
Ext.ux.GridPrinter.stylesheetPath = 'Templates/Application/css/grid_print.css';

function addAuswertungenTab(){
	//zuerst gehört gecheckt, ob es den Tab nicht vielleicht schon gibt.
	//wenn ja, wird er nur mehr focusiert, wenn nein werden die Grids, Forms und Stores erstellt
	//und alles läuft wie geschmiert :)
	if(document.getElementById('auswertungsTab') == null) {
	

		var CenterAuswertungen = new Ext.Panel({
			region:'center',
			layout:'fit',
			frame:false,
			border:false
		});
		
		
		var WestAuswertungen = new Ext.Panel({
			region:'west',
			border:true,
			title:'Statistiken:',
			frame:true,
			layout: {
				type:'vbox',
				padding:'25',
				align:'stretch' 
			},
			defaults:{margins:'0 0 30 0'}, 
			width:200,
			items:[ 
				new Ext.Button({
					text: "Diag. Anfragen",
					id:'btnZeitAnfragen', 
					flex:1,
					iconCls: 'anfrage',
					scale:'medium',
					handler: function() {
						
						
						var AnfrageGraphFS = new Ext.form.FieldSet({
							labelAlign: 'left',
							labelWidth: 150,
							layout:'form',
							defaults: {width: 200},
							bodyStyle:'padding:10px',
							defaultType: 'xdatefield',
							title:'Auswahl',
							height: 'auto',
							border: false,
							items:[{
								fieldLabel: 'Datum Von',
								allowBlank:false,
								format: 'Y-m-d',
								id:'txtVon',
								name: 'anfang'
							},{
								fieldLabel: 'Datum Bis',
								allowBlank:false,
								id:'txtBis',
								format: 'Y-m-d',
								name: 'ende'
							}]
						});
						
						
						var AnfrageGraphFP = new Ext.form.FormPanel({
							labelAlign: 'left',
							id:'AnfrageGraphFP',
							items: [{
								activeTab: 0,
								defaults:{autoHeight:true}, 
								items:[AnfrageGraphFS]
							}],
							buttons: [{
								text: 'zurück',
								handler: function() {
									win.close();
								}
							},{ 
								text:'zur Grafik',
								formBind: true,
								handler: function() {
								
									var store = new Ext.data.Store({
										proxy: new Ext.data.HttpProxy({
											url: 'index.php',
											method: 'POST'
										}),
										remoteSort:true,
										baseParams:{
											cmd: "GetAnfrageGraphData"
										},
										reader: new Ext.data.JsonReader({
											root: 'results',
											totalProperty: 'total'
										},Ext.data.Record.create([
											{name: 'MONTH', type:'string'},
											{name: 'anzahl', type:'int'}
										  ])
										)
									});
									
									store.load({params:{anfang:Ext.getCmp('txtVon').getValue(),ende:Ext.getCmp('txtBis').getValue()}});
									
									var panel = new Ext.Panel({
										title: 'Zeitdiagramm: Anzahl Anfragen nach Zeitraum',
										layout:'fit',

										items: {
											xtype: 'linechart',
											store: store,
											xField: 'MONTH',
											yField: 'anzahl',
											listeners: {
												itemclick: function(o){
													var rec = store.getAt(o.index);
													Ext.example.msg('Click', 'Sie haben auf {0} geklickt.', rec.get('MONTH'));
												}
											}
										}
									});
									
									CenterAuswertungen.removeAll();
									CenterAuswertungen.add(panel);
									CenterAuswertungen.doLayout();
									win.close();
								}
							}]
						});
						
						var win = new Ext.Window({
							title:'Anzahl der Anfragen',
							closable:true,
							width:420,
							border:true,
							resizable:false,
							modal:true,
							items: [AnfrageGraphFP]
						}).show(this);
						
					}
				}),
				new Ext.Button({
					text: "Diag. Buchungen",
					id:'btnBuchungsStati', 
					flex:1,
					iconCls: 'buchungen',
					scale:'medium',
					handler: function() {
						
						var store = new Ext.data.Store({
							proxy: new Ext.data.HttpProxy({
								url: 'index.php',
								method: 'POST'
							}),
							remoteSort:true,
							baseParams:{
								cmd: "GetBuchungsGraphData"
							},
							reader: new Ext.data.JsonReader({
								root: 'results',
								totalProperty: 'total'
							},Ext.data.Record.create([
								{name: 'jhb', type:'string'},
								{name: 'anzahl', type:'int'}
							  ])
							)
						});
						store.load();

						// extra extra simple
						var panel = new Ext.Panel({
							title: 'Balkendiagramm: Anzahl Buchungen nach Jugendherberge',
							layout:'fit',
							items: {
								xtype: 'columnchart',
								store: store,
								xField: 'jhb',
								yField: 'anzahl',
								listeners: {
									itemclick: function(o){
										var rec = store.getAt(o.index);
										Ext.example.msg('Click', 'Sie haben auf {0} geklickt.', rec.get('jhb'));
									}
								}
							}
						});
						
						CenterAuswertungen.removeAll();
						CenterAuswertungen.add(panel);
						CenterAuswertungen.doLayout();
						
					}
				}),
				new Ext.Button({
					text: 'Bericht nach JHB',
					id:'btnAuswertung1', 
					iconCls: 'herbergen',
					scale:'medium',
					flex:1,
					handler: function() {

						var Buchungjhb = new Ext.form.FieldSet({
							labelAlign: 'left',
							labelWidth: 150,
							layout:'form',
							defaults: {width: 200},
							bodyStyle:'padding:10px',
							defaultType: 'textfield',
							title:'Auswahl',
							height: 'auto',
							border: false,
							items:[{
								fieldLabel: 'JHB',
								xtype:'combo',
								allowBlank:false,
								editable:false,
								forceSelection:true,
								id:'jhbComboID',
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
											id: 'ID_Jhb'
										},Ext.data.Record.create([
											{name: 'ID_Jhb', type: 'int'},
											{name: 'jhb', type: 'string'}
										])
									),
									baseParams:{
										cmd: "GetJhb"
									},
									autoLoad: true	
								}),
								valueField: 'ID_Jhb',
								displayField: 'jhb',
								name: 'jhb'
							},{
								fieldLabel: 'Datum Von',
								allowBlank:false,
								format: 'Y-m-d',
								id:'txtJhbVonTermin',
								xtype:'xdatefield',
								name: 'Vontermin'
							},{
								fieldLabel: 'Datum Bis',
								allowBlank:false,
								id:'txtJhbBisTermin',
								format: 'Y-m-d',
								xtype:'xdatefield',
								name: 'Bistermin'
							}]
						});

						
						
						var showBuchungjhb = new Ext.form.FormPanel({
							labelAlign: 'left',
							id:'Buchungjhb',
							items: [{
								activeTab: 0,
								defaults:{autoHeight:true}, 
								items:[Buchungjhb]
							}],
							buttons: [{
								text: 'zurück',
								handler: function() {
									win.close();
								}
							},{ 
								text:'zum Bericht',
								formBind: true,
								handler: function() {
									
									//Daten Store   JHB
									var BuchungjhbStore = new Ext.data.Store({
										proxy: new Ext.data.HttpProxy({
											url: 'index.php',
											method: 'POST'
										}),
										remoteSort:true,
										baseParams:{
											cmd: "FillJHBAuswertungGrid"
										},
										reader: new Ext.data.JsonReader({
											root: 'results',
											totalProperty: 'total'
										},Ext.data.Record.create([
											 {name: 'jhb', type:'string'},
											 {name: 'resyBuchungsNr', type:'string'},
											 {name: 'organisation', type:'string'},
											 {name: 'Ansprechperson', type:'string'},
											 {name: 'packagename', type:'string'},
											 {name: 'terminAnreise', type:'date', dateFormat: 'Y-m-d'},
											 {name: 'buchungsStatus', type:'string'},
											 {name: 'kinder', type:'int'},
											 {name: 'erwachsene', type:'int'},
											 {name: 'Gesamt', type:'int'}
										  ])
										)
									});

									// Grid JHB
									var BerechnungjhbGrid = new Ext.grid.GridPanel({
										title:'Bericht der Buchungen nach Jugendherbergen',
										frame: false,
										border:true,
										iconCls: 'herbergen',
										id:'JHBAuswertungGrid',
										closable:true,
										store: BuchungjhbStore,
										columns: [
											{header: "Jugendherberge", width: 115, sortable: false, dataIndex: 'jhb'},
											{header: "Resy Buchungsnummer", width: 115, sortable: false, dataIndex: 'resyBuchungsNr'},
											{header: "Schule / Firma", width: 130, sortable: false, dataIndex: 'organisation'},
											{header: "Ansperchsperson", width: 115, sortable: false, dataIndex: 'Ansprechperson'},
											{header: "Packagename", width:115, sortable: false, dataIndex: 'packagename'},
											{header: "Anreise Termin", width:90, sortable: false, xtype: 'datecolumn', format: 'd.m.Y', dataIndex: 'terminAnreise'},
											{header: "Buchungs Status", width:90, sortable: false, dataIndex: 'buchungsStatus'},
											{header: "Kinder", width:40, sortable: false, dataIndex: 'kinder'},
											{header: "Erwachsene", width:40, sortable: false, dataIndex: 'erwachsene'},
											{header: "Gesamt", width:40, sortable: false, dataIndex: 'Gesamt'}
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
										tbar: new Ext.Toolbar({
											items: [{tooltip:'Tabelle drucken',
												iconCls:'print',
												id:'DruckenButton',
												width:50,
												handler:function() {
													//nachträglich eininstalliertes extjs-Plugin
													Ext.ux.GridPrinter.print(BerechnungjhbGrid); }
												}]
											})
									});
								
									BuchungjhbStore.load({params:{jhb:Ext.getCmp('jhbComboID').getValue(), Vontermin:Ext.getCmp('txtJhbVonTermin').getValue(),Bistermin:Ext.getCmp('txtJhbBisTermin').getValue()}});
									CenterAuswertungen.removeAll();
									CenterAuswertungen.add(BerechnungjhbGrid);
									CenterAuswertungen.doLayout();
									win.close();
								}
							}]
						});
							  
						var win = new Ext.Window({
							title:'Buchungen JHB',
							closable:true,
							width:420,
							border:true,
							resizable:false,
							modal:true,
							items: [showBuchungjhb]
						}).show(this);
					}
				}), new Ext.Button({
					text: "Bericht nach Partner",
					id:'btnAuswertung2', 
					flex:1,
					iconCls: 'partner',
					scale:'medium',
					handler: function() {
						
						var BuchungPartner = new Ext.form.FieldSet({
							labelAlign: 'left',
							labelWidth: 150,
							layout:'form',
							defaults: {width: 200},
							bodyStyle:'padding:10px',
							defaultType: 'textfield',
							title:'Auswahl',
							height: 'auto',
							border: false,
							items:[{
								fieldLabel: 'Partner',
								xtype:'combo',
								allowBlank:false,
								editable:false,
								id:'ComboPartner',
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
										])
									),
									baseParams:{
										cmd: "GetPartner"
									},
									autoLoad: true	
								}),
								valueField: 'ID_Partner',
								displayField: 'firmenname',
								name: 'firmenname'
							},{
								fieldLabel: 'Datum Von',
								allowBlank:false,
								format: 'Y-m-d',
								id:'txtPartnerVonTermin',
								xtype:'xdatefield',
								name: 'Vontermin'
							},{
								fieldLabel: 'Datum Bis',
								allowBlank:false,
								id:'txtPartnerBisTermin',
								format: 'Y-m-d',
								xtype:'xdatefield',
								name: 'Bistermin'
							}]
						});
						
						
						var showBuchungPartner = new Ext.form.FormPanel({
							labelAlign: 'left',
							id:'BuchungPartner',
							items: [{
								activeTab: 0,
								defaults:{autoHeight:true}, 
								items:[BuchungPartner]
							}],
							buttons: [{
								text: 'zurück',
								handler: function() {
								win.close();
								}
							},{ 
								text:'zum Bericht',
								formBind: true,
								handler: function() {
								
									//Daten Store  Partner
									var BuchungPartnerStore = new Ext.data.Store({
										proxy: new Ext.data.HttpProxy({
											url: 'index.php',
											method: 'POST'
										}),
										remoteSort:true,
										baseParams:{
											cmd: "FillPartnerAuswertungGrid"
										},
										reader: new Ext.data.JsonReader({
											root: 'results',
											totalProperty: 'total'
										},Ext.data.Record.create([
											 {name: 'firmenname', type:'string'},
											 {name: 'organisation', type:'string'},
											 {name: 'Ansprechperson', type:'string'},
											 {name: 'Termin', type:'date', dateFormat: 'Y-m-d'},
											 {name: 'StandardUhrzeit', type:'string'},
											 {name: 'erwachsene', type:'int'},
											 {name: 'kinder', type:'int'},
											 {name: 'Gesamt_Personen', type:'int'},
											 {name: 'buchungsStatus', type:'string'}
										  ])
										)
									});

									// Grid Partner
									var BerechnungPartnerGrid = new Ext.grid.GridPanel({
										title:'Bericht der Buchungen nach Partnern',
										frame: false,
										border:true,
										iconCls: 'herbergen',
										id:'PartnerAuswertungGrid',
										closable:true,
										store: BuchungPartnerStore,
										columns: [
											{header: "Partner Name", width: 110, sortable: false, dataIndex: 'firmenname'},
											{header: "Organisation", width: 115, sortable: false, dataIndex: 'organisation'},
											{header: "Ansprechperson", width: 110, sortable: false, dataIndex: 'Ansprechperson'},
											{header: "Termin", width:80, sortable: false, xtype: 'datecolumn', format: 'd.m.Y', dataIndex: 'Termin'},
											{header: "Standard Zeit", width:65, sortable: false, dataIndex: 'StandardUhrzeit'},
											{header: "Erwachsene", width:40, sortable: false, dataIndex: 'erwachsene'},
											{header: "Kinder", width:40, sortable: false, dataIndex: 'kinder'},
											{header: "Pers Ges.", width:40, sortable: false, dataIndex: 'Gesamt_Personen'},
											{header: "Status", width:50, sortable: false, dataIndex: 'buchungsStatus'}
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
										tbar: new Ext.Toolbar({
											items: [{tooltip:'Tabelle drucken',
												iconCls:'print',
												id:'DruckenButton',
												width:50,
												handler:function() {
													//nachträglich eininstalliertes extjs-Plugin
													Ext.ux.GridPrinter.print(BerechnungPartnerGrid); 
												}
											}]
										})
									});
								
								
									BuchungPartnerStore.load({params:{jhb:Ext.getCmp('ComboPartner').getValue(), Vontermin:Ext.getCmp('txtPartnerVonTermin').getValue(),Bistermin:Ext.getCmp('txtPartnerBisTermin').getValue()}});
									CenterAuswertungen.removeAll();
									CenterAuswertungen.add(BerechnungPartnerGrid);
									CenterAuswertungen.doLayout();
									win.close();
								}
							}]
						});
						
						
						var win = new Ext.Window({
							title:'Buchungen Partner',
							closable:true,
							width:420,
							border:true,
							resizable:false,
							modal:true,
							items: [showBuchungPartner]
						}).show(this);
					}					
				})
			]
		});
		
		var AuswertungPanel = new Ext.Panel({
			title:'Statistik',
			closable:true,
			id:'Auswertung',
			layout:'border',
			iconCls: 'auswertungen',
			items:[CenterAuswertungen,WestAuswertungen]
		});
			
		Ext.getCmp('btnBuchungsStati').handler();
		Ext.getCmp('tabcenter').add(AuswertungPanel).show();
	} else Ext.getCmp('tabcenter').setActiveTab('auswertungsTab');
}



//Diese Printklasse habe ich nachträglich installiert...
//Ext.ux.GridPrinter.stylesheetPath = '/some/other/path/gridPrint.css';
//Ext.ux.GridPrinter.print(grid);