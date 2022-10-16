/************************
In dieser Javascript-Datei steht der Code zum Aufbau für das Frontend.
 **********************/
 
Ext.onReady(function(){

	//Für die Darstellung des Logos unterscheiden wird die User des IE6 zum Rest der Userschaft.
	//Im IE6 können PNG-Grafiken mit Alphawert nicht richtig dargestellt werden. In diesem Fall
	//verwenden wir einfach ein gif-Image.
	var logo;
	if(/MSIE 6/i.test(navigator.userAgent)) {
		logo='<img src="Resources/images/logo.gif" alt="logo" />';
	} else {
		logo='<img src="Resources/images/logo.png" alt="logo" />';
	}

	Ext.BLANK_IMAGE_URL = 'Resources/ext3/resources/images/default/s.gif';

	
	var norden = new Ext.Panel({
		region:'north',
			height:60,
			border:false,
			id:'northbox',
			html:logo,
			layout:'fit',
			collapsible:false,
			collapsed:false
	});
	
	
	var randomValue1 = Math.round(Math.random() * 10);
	var randomValue2 = Math.round(Math.random() * 10);
	var targetValue = randomValue1 + randomValue2;


	var anfrageFieldset1 = new Ext.form.FieldSet({				
		labelWidth: 150,
		columnWidth:.5,
		layout: 'form',
		border:false,
		bodyStyle:'padding:20px 5px 5px 5px',
		items: [{
			fieldLabel: 'Jugendherberge*',
			xtype:'combo',
			allowBlank:false,
			id:'JhbComboID',
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
					id: 'ID_Jhb'
				},Ext.data.Record.create([
					{name: 'ID_Jhb', type: 'int'},
					{name: 'jhb', type: 'string'}
				])),
				baseParams:{
					cmd: "GetJhb"
				},
				autoLoad: true	
			}),
			valueField: 'ID_Jhb',
			displayField: 'jhb',
			name: 'jhb',
			anchor:'80%'
		},{
			fieldLabel: 'Paket*',
			xtype:'combo',
			allowBlank:false,
			editable:false,
			id:'PaketComboID',
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
					cmd: "GetPackage"
				}
			}),
			valueField: 'ID_Package',
			displayField: 'packagename',
			name: 'packagename',
			hiddenName: 'ID_Package',
			hiddenId:'hiddenPackageIdCombo',
			name:'ID_Package',
			anchor:'80%'	
		},{
			fieldLabel: 'Termin Anreisetag*',
			allowBlank:false,
			format: 'd.m.Y',
			id:'anreisedatum',
			minValue: new Date(),
			xtype:'xdatefield',
			name: 'termin',
			anchor:'80%'
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
			name: 'kategorie',
			anchor:'80%'
		},{
			xtype:'textfield',
			fieldLabel: 'Organisation',
			name: 'organisation',
			anchor:'95%'
		},{
			 xtype:'textfield',
			fieldLabel: 'Vorname*',
			allowBlank:false,
			name: 'vorname',
			anchor:'95%'
		},{
			xtype:'textfield',
			fieldLabel: 'Nachname*',
			allowBlank:false,
			name: 'nachname',
			anchor:'95%'
		},{
			xtype:'textfield',
			fieldLabel: 'Adresse*',
			allowBlank:false,
			name: 'adresse',
			anchor:'95%'
		},{
			xtype:'textfield',
			fieldLabel: 'PLZ*',
			allowBlank:false,
			name: 'plz',
			anchor:'95%'
		},{
			xtype:'textfield',
			fieldLabel: 'Ort*',
			allowBlank:false,
			name: 'ort',
			anchor:'95%'
		},{
			xtype:'textfield',
			fieldLabel: 'Telefon',
			name: 'tel',
			anchor:'95%'
		},{
			xtype:'textfield',
			fieldLabel: 'Fax',
			name: 'fax',
			anchor:'95%'
		},{
			xtype:'textfield',
			fieldLabel: 'eMail',
			vtype:'email',
			name: 'email',
			anchor:'95%'
		},{
			xtype:'textfield',
			fieldLabel: 'Telefon Ansprechpartner*',
			allowBlank:false,
			name: 'telAP',
			anchor:'95%'
		},{
			xtype:'textfield',
			fieldLabel: 'eMail Ansprechpartner*',
			id:'mailAnsprechperson',
			allowBlank:false,
			vtype:'email',
			name: 'emailAP',
			anchor:'95%'
		}]
	});
	
	Ext.getCmp('JhbComboID').addListener('select',function() {
		Ext.getCmp('PaketComboID').getStore().setBaseParam('ID_Jhb', Ext.getCmp('JhbComboID').getValue())
		Ext.getCmp('PaketComboID').getStore().load();
		Ext.getCmp('PaketComboID').setValue("");
	});

	
	var anfrageFieldset2 = new Ext.form.FieldSet({				
		labelWidth: 150,
		columnWidth:.5,
		layout: 'form',
		border:false,
		bodyStyle:'padding:20px 5px 5px 5px',
		items: [{
			xtype:'textfield',
			fieldLabel: 'Anzahl Erwachsene',
			name: 'erwachsene',
			anchor:'50%'
		},{
			xtype:'textfield',
			fieldLabel: 'Anzahl Kinder',
			name: 'kinder',
			anchor:'50%'
		},{
			xtype:'textfield',
			fieldLabel: 'Anzahl Weiblich',
			name: 'female',
			anchor:'50%'
		},{
			xtype:'textfield',
			fieldLabel: 'Anzahl Männlich',
			name: 'male',
			anchor:'50%'
		},{
			xtype:'textfield',
			fieldLabel: 'Anzahl Vegetarier',
			name: 'vegetarier',
			anchor:'50%'
		},{
			fieldLabel: 'religiöse Speisevorschriften',
			xtype: 'textarea',
			name: 'relVorschriften',
			anchor:'95%'
		},{
			fieldLabel: 'Allergien',
			xtype: 'textarea',
			name: 'allergien',
			anchor:'95%'
		},{
			fieldLabel: 'Bemerkung',
			xtype: 'textarea',
			name: 'bemerkung',
			anchor:'95%'
		},{
			xtype:'textfield',
			fieldLabel:'<b style="color:#ff0000">Bitte addieren Sie '+randomValue1+' + '+randomValue2+'</b>',
			anchor:'60%',
			id:'targetValue'
		}]
	});
	
		
	var anfrageForm = new Ext.form.FormPanel({
		labelAlign:'center',
		id:'anfrageForm',
		region:'center',
		frame:true,
		border:true,
		layout:'column',
		url:'index.php',
		buttons: [{
			text: 'Senden',
			id:'sendButton',
			formBind: true,
			handler: function(){
			
				if(Ext.getCmp('targetValue').getValue() != targetValue) {
					Ext.example.msg('Sicherheitsfrage', 'Bitte tragen Sie das richtige Ergebnis der Rechnung ein!!');
				} 
				else {
					anfrageForm.getForm().submit({
						method:'POST', 
						waitTitle:'Connecting', 
						waitMsg:'Sending data...',
						params: {
							cmd:'InsertAnfrage',
							ersatztermin: Ext.getCmp('anreisedatum').getValue()
						},
						success:function(form, action){ 
							if(action.result.success == true) {
								Ext.Msg.alert('Anfrage gesendet', 'Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt. Sie werden in Kürze von uns kontaktiert.');
								anfrageForm.getForm().reset();
							} else {
								Ext.example.msg('Fehler', 'Nicht gespeichert!!');
							}
						
						},
					});
					
					
					Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
						waitTitle:'Connecting', 
						waitMsg:'Sending data...',
						url: 'index.php',
						params: {
							cmd:"Mail",
							to: "roland@widmayer.at",
							body: "Ein Konsument hat eine Anfrage an Sie gerichtet! Bitte prüfen Sie in der Applikation Smart Booking die neuen Anfragen und ergreifen Sie eine geeignete Maßnahme.",
							subject:"Neues Ticket eingelangt!"
						},
						failure:function(response,options){
							Ext.example.msg('Fehler', 'Server wurde nicht erreicht! Bitte versuchen Sie es später nochmals.');
						},
						success:function(response,options){
							var responseJSON = Ext.decode(response.responseText);

							if(responseJSON.error==true) { //FEHLERBEHANDLUNG
								handleException(responseJSON);
							} else {
								if(responseJSON.success == true) {
									Ext.example.msg('Status', 'Sachbearbeiter wurde informiert!');
								} else Ext.example.msg('Fehler!', 'Leider kein Zugriff');
							}
						}
					});
					
					Ext.Ajax.request({		//hier wird der AJAX-Call abgesetzt.
						waitTitle:'Connecting', 
						waitMsg:'Sending data...',
						url: 'index.php',
						params: {
							cmd:"Mail",
							to: Ext.getCmp('mailAnsprechperson').getValue(),
							body: "Vielen Dank, Ihre Anfrage für den "+Ext.getCmp('anreisedatum').value+" wurde erfolgreich übermittelt. \nUnsere Sachbearbeiter werden sich so bald wie möglich bei Ihnen melden. \n\nFreundliche Grüße, \nIhr NOEJHW Team",
							subject:"Anfrage erfolgreich übermittelt"
						},
						failure:function(response,options){
							Ext.example.msg('Fehler', 'Server wurde nicht erreicht! Bitte versuchen Sie es später nochmals.');
						},
						success:function(response,options){
							var responseJSON = Ext.decode(response.responseText);

							if(responseJSON.error==true) { //FEHLERBEHANDLUNG
								handleException(responseJSON);
							} else {
								if(responseJSON.success == true) {
									Ext.example.msg('Status', 'Sie haben ein Mail zur Bestätigung erhalten.');
								} else Ext.example.msg('Fehler!', 'Leider kein Zugriff');
							}
						}
					});
				}
			}
		},{
			text: 'Reset',
			handler: function() {
				anfrageForm.getForm().reset();
			}
		}],
		items:[anfrageFieldset1,anfrageFieldset2]
	});

		
		
	var viewport=new Ext.Viewport ({
		layout:'border',
		items:[norden, anfrageForm]
	});

	//-----------Ausblenden des Loading-Prozessbar nachdem alles geladen wurde----------
	Ext.get('loading').fadeOut({remove: false});


});  


function handleException(err) {
	Ext.example.msg("Type: "+err.type, err.message); //weiter Unterscheidung mit Fehler-Objekt
}