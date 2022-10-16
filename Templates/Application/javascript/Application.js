/**************************************************************************************
Hauptbereich, Aufbau des Viewportes und Verschachtelung des Grundlayouts
----------------------------------------------------------------------------------------------------------
Structure in a nutshell: Sehr grob ausgedrückt, wird das Layout wie folgt aufgebaut -
Der Viewport (das ist die Trägerkomponente des gesamten Dokumentes [document.body]) wird in ein Border-Layout
unterteilt. Dieses Borderlayout beinhaltet einen Nordbereich, indem das Logo steht, einen Westbereich für
die Navigation und natürlich einen Center-Bereich. Das Zentrum dieses Borderlayouts ist für sich betrachtet 
nochmals ein eigenes Border Layout. Diesmal mit einem Süd-Bereich für zusätzliche Infos und wieder einem 
Center-Bereich. In diesen Center-Bereich kommt ein TabPanel (eine Trägerkomponente für Registerkarten). 
Nach betätigen eines Buttons in der Navigation wird eine Funktion aufgerufen, die für den aufgerufenen Part 
alle notwendigen Stores und Panels generiert, die Steuerelemente zum Aufrufen der PHP-Commands bereitstellt
und das Gesamtergebnis dieser Funktion in den TabPanel als neue Registerkarte einhängt. 
Nach dem Schließen einer Registerkarte wird der komplette Speicherbereich der Stores und Panels wieder freigegeben.
----------------------------------------------------------------------------------------------------------
In der Applikation.js steht der strukturelle Aufbau des User Interfaces. Hier ist der Aufbau
des Gerüsts und der Navigation das Hauptaugenmerk. Die Steuerelemente der einzelnen
Navigationspunkte finden Sie im jeweiligen "NAME_DES_MENÜPUNKTES.JS"-File
----------------------------------------------------------------------------------------------------------
Dieses Programm benötigt zum Laufen:
	- PHP5.X od. höher
	- mySQL 5.X od. höher (nur mit InnoDB)
******************************************************************************************/


//Die onReady-function wird ausgeführt, wenn der Aufbau der Seite abgeschlossen wird.
//Deswegen ist es der ideale Ansatzpunkt, hier den Javascript-Applikationscode auszuführen.
Ext.onReady(function(){

//Diese clientseitige Try-Catch Fehlerverwaltung soll nur Fehler abfangen, die im Javascript-Code
//auftreten könnten. Alle Fehler, die aus asynchronen Ajax-Calls heraus auftreten und im PHP (am Server)
//den Ursprung haben, werden gesondert in den Callback bzw. Success-Funktionen der Requests gehandhabt.
//Hilfsfunktion zur Ausgabe einer Server-Exception ist die Funktion handleException();
try {

	//Für die Darstellung des Logos unterscheiden wird die User des IE6 zum Rest der Userschaft.
	//Im IE6 können PNG-Grafiken mit Alphawert nicht richtig dargestellt werden. In diesem Fall
	//verwenden wir einfach ein gif-Image.
	var logo;
	if(/MSIE 6/i.test(navigator.userAgent)) {
		logo='<img src="Resources/images/logo.gif" alt="logo" />';
	} else {
		logo='<img src="Resources/images/logo.png" alt="logo" />';
	}

	//Das Blank_Image ist ein 1px großes Gif mit dem Alpha-Wert 100%.
	//Es wird für die korrekte Darstellung der Trigger im aktuellen extjs-Framework benötigt
	//Anscheinend ist hier noch ein Fehler in dieser Version des Frameworks versteckt.
	//Durch manuelles Setzten der Konstante BLANK_IMAGE_URL wird dieses Fehlverhalten umgangen.
	Ext.BLANK_IMAGE_URL = 'Resources/ext3/resources/images/default/s.gif';


	//-------------NORTHBOX -----------------------------------------------
	//Ein leeres Panel, das das Logo und den Head-Balken beeinhaltet.
	//---------------------------------------------------------------------------
	var bl1_northbox = new Ext.Panel({
		region:'north',
		height:60,
		border:false,
		//margins: '0 0 0 0',
		id:'northbox',
		html:logo,
		layout:'fit',
		collapsible:false,
		collapsed:false
	});
	
	//die Mailadresse des Anmelders, sowie die Rechte ins JS holen
	//um damit den Aufbau des Interfaces zu beeinflussen.
	Ext.Ajax.request({
		url: 'index.php',
		params:{
			cmd:'GetRights'
		},
		method: 'POST',
		//Alles "Rechteabhängige" muss in dieser Success-Funktion gecoded werden, da
		//der Call ja asynchron passiert und der Aufbau des restlichen Programmes bereits
		//beendet ist wenn der Response mit den Rights vom Server hier ankommt. Deshalb kann man
		//beim Aufbau außerhalb dieser Success-Funktion auch nicht auf das Objekt responseJSON Zugreifen.
		//Dieses Objekt wird erst erzeugt, wenn der Response vom Server ankommt und die Success-Funktion auslöst.
		success:function(response,options){
			//Requesten der Rechte und speichern im Objekt "responseJSON"
			var responseJSON = Ext.decode(response.responseText);
			
			if(responseJSON.error==true) { //FEHLERBEHANDLUNG
				handleException(responseJSON);
			} else{
				Ext.getCmp('btnuser').setVisible(responseJSON.results[0].right_user);
				Ext.getCmp('btnanfrage').setVisible(responseJSON.results[0].right_anfrage);
				Ext.getCmp('btnbuchung').setVisible(responseJSON.results[0].right_buchung);
				Ext.getCmp('btnleistungen').setVisible(responseJSON.results[0].right_leistung);
				Ext.getCmp('btnpackage').setVisible(responseJSON.results[0].right_package);
				Ext.getCmp('btnpartner').setVisible(responseJSON.results[0].right_partner);
				Ext.getCmp('btnauswertungen').setVisible(responseJSON.results[0].right_auswertungen);
				Ext.getCmp('btnkunden').setVisible(responseJSON.results[0].right_kunde);
				Ext.getCmp('btnjugendherbergen').setVisible(responseJSON.results[0].right_jugendherbergen);
				//doLayout ist notwendig, da wir bereits fertig gerenderte 
				bl1_westpanel.doLayout();
				bl2_south.add({html:'<p>Welcome, '+responseJSON.results[0].username+'!</p><p>Thank you for using Smart Booking. If you experience any inconvenience or miss-behavior, feel free to contact our Support Hotline. You also may have a look at the <a href="Documentation/Manuals/User-Handbuch.pdf" target="_blank">Manual</a>. </p><p>Released in June 2010 under the GPL License. Have a look at the <a href="Documentation/Manuals/Admin-Handbuch.pdf" target="_blank">Administration-Manual</a></p>'});
				bl2_south.doLayout();
				
				//Je nach Berechtigung wird ein Tab als Standart vorgeladen.
				if(responseJSON.results[0].right_anfrage) addAnfrageTab();
				else if(responseJSON.results[0].right_buchung) addBuchungTab();
				else if(responseJSON.results[0].right_kunde) addKundenTab();
				else if(responseJSON.results[0].right_auswertungen) addAuswertungenTab();
				else if(responseJSON.results[0].right_leistung) addLeistungenTab();
				else if(responseJSON.results[0].right_partner) addPartnerTab();
				else if(responseJSON.results[0].right_package) addPackagesTab();
				else if(responseJSON.results[0].right_user) addUserTab();
				else if(responseJSON.results[0].right_jugendherbergen) addJugendherbergenTab();
			}
		},
		failure: function() { //Schwerer Fehler trat auf.
			Ext.Msg.alert('Fehler', 'Server wurde nicht erreicht! Bitte versuchen Sie es später nochmals.');
		}
	});
	
	//---------WEST-Panel------------------------------------------------
	//Der Navigations-Bereich der Applikation. Die Buttons passen sich dynamisch der Höhe des Browserfensters an.
	//Es gibt einen Bottom-Toolbar, der den Logout-Link beinhaltet, sowie ein Toolbar-Menü mit den Optionen.
	//Hier brauchen wir, abweichend zur Einleitung am Seitenbeginn, doch etwas Geschäftslogik: 
	//Die Buttons des Optionsmenüs sind hier ausprogrammiert.
	//---------------------------------------------------------------------------
	
	//Hier wird ein neuer V-Typ abgeleitet, der für die Passwort-Validation
	//zuständig ist (z.B. ob 2 Passwörter zusammenstimmen wie
	//bei der Passwort-Änderung) --> Siehe Beispiel ADVANCED VALIDATION
	Ext.apply(Ext.form.VTypes, {
	     password : function(val, field) {
		if (field.initialPassField) {
		    var pwd = Ext.getCmp(field.initialPassField);
		    return (val == pwd.getValue());
		}
		return true;
	    },
	    passwordText : 'Passwords do not match'
	});
	
	//Und hier die Anlage des West-Panels:
	var bl1_westpanel= new Ext.Panel({
		region:'west',
		title:'Navigation',
		id:'bl1_westpanel',
		collapsible:false,
		//im bbar liegt ein Menü und ein Logout-Button
		bbar:new Ext.Toolbar({
		  items: [{
			  text:'Logout',
			  iconCls:'logout',
			  width:80,
			  id:'btnLogout',
			  handler:function() {
				bl1_northbox.destroy();
				bl1_westpanel.destroy();
				bl2_south.destroy();
				tabcenter.destroy();
				bl1_centerpanel.destroy();
				bl2_center.destroy();
				Ext.Ajax.request({
					url: 'index.php',
					params:{
						cmd:'Logout'
					},
					method: 'POST',
					success:function(response,options){
						//Wenn der Logout-Command ohne Probleme durchgelaufen ist, ist der Success-Code auf true.
						//danach wird die Seite neu geladen und es wird der Anmeldeschirm angezeigt.
						if(Ext.decode(response.responseText).success == true) {
							self.location='index.php';
						} else Ext.Msg.alert('Logout Error', 'Sie wurden nicht vollständig ausgeloggt. Bitte Seite erneut laden und nochmals ausloggen!');
					},
					failure:function() {
						Ext.Msg.alert('Logout Error', 'Der Server wurde nicht erreicht. Bitte versuchen Sie später nochmals sich auszuloggen.');
					}
				});
			  }
			 },{
			  text:'Options',
			  iconCls: 'options',
			  width:80,
			  menu: new Ext.menu.Menu({
				items: [{
					iconCls:'email',
					text: 'eMail Adresse ändern',
					handler: function() {
						//Beim Click auf diesen Button wird ein Fenster geöffnet,
						//von wo aus die neue Mailadresse eingegeben werden kann
						//vorher muss noch das aktuelle Passwort angegeben werden...
						var wndChangeMail = new Ext.Window({
							title:'eMail Adresse ändern',
							closable:true,
							width:420,
							border:true,
							resizable:false,
							modal:true,
							items: [
								new Ext.form.FormPanel({
									labelAlign: 'left',
									monitorValid:true,
									id:'changeEmail',
									items: [
										new Ext.form.FieldSet({
											labelAlign: 'left',
											labelWidth: 150,
											layout:'form',
											defaults: {width: 200},
											bodyStyle:'padding:10px',
											defaultType: 'textfield',
											height: 'auto',
											border: false,
											items:[{
												  fieldLabel: 'Passwort',
												  inputType:'password',
												  name: 'pwd'
											},{
												  fieldLabel: 'neue e-Mail Adresse',
												  vtype:'email',
												  name: 'value'
											}]
										})
									],
									//Hier die Buttons des Formpanels "changeEmail"
									buttons: [{ 
										//dieser Button macht den Form.submit();
										text:'save',
										iconCls:'save',
										formBind: true,
										handler: function() {
										//Diese Funktion setzt überittelt asynchron die Daten
										//des Formulares an die main.php, von wo aus die Daten in der DB
										//geändert werden.
											Ext.getCmp('changeEmail').getForm().submit({
												method: 'POST',
												url:'index.php',
												params: {
													field: 'email',
													cmd: 'UpdateUser'
												},
												success: function(form,action) {
													wndChangeMail.close();
													Ext.example.msg('Success', 'eMail erfolgreich geändert!');
												},
												failure: function(form,action) {
													if(action.result.pwd==true)
														Ext.example.msg('Stop', 'Keine Änderung möglich. Möglicherweise existiert diese Adresse bereits?');
													else
														Ext.example.msg('Stop', 'Passwort leider falsch!');
												}
											});
										}
									  },{
										//dieser Button schließt einfach nur das Window, ohne etwas zu bewirken.
										text: 'cancel',
										handler: function() {wndChangeMail.close();}
									  }
									]
								})
							]
						});
						wndChangeMail.show(this);
					}
				},{
					iconCls:'password',
					text: 'Passwort ändern',
					handler: function() {
						//Beim Click auf diesen Button wird ein Fenster geöffnet,
						//von wo aus das neue Passwort mit 2maliger Eingabe geändert wird.
						//Vorher muss noch das aktuelle Passwort angegeben werden...
						var wndChangePwd = new Ext.Window({
							title:'Passwort ändern',
							closable:true,
							width:420,
							border:true,
							resizable:false,
							modal:true,
							items: [
								new Ext.form.FormPanel({
									labelAlign: 'left',
									monitorValid:true,
									id:'changePassword',
									items: [
										new Ext.form.FieldSet({
											labelAlign: 'left',
											labelWidth: 150,
											layout:'form',
											defaults: {width: 200},
											bodyStyle:'padding:10px',
											defaultType: 'textfield',
											height: 'auto',
											border: false,
											items:[{
												  fieldLabel: 'altes Passwort',
												  inputType:'password',
												  name: 'pwd'
											},{
												  fieldLabel: 'neues Passwort',
												  inputType:'password',
												  id:'newPwd',
												  name: 'newPwd'
											},{
												  fieldLabel: 'neues Passwort wiederh.',
												  vtype: 'password',
												  initialPassField: 'newPwd',
												  inputType:'password',
												  name: 'value'
											}]
										})
									],
									//Hier die Buttons des Formpanels "changePassword"
									buttons: [{ 
										//dieser Button macht den Form.submit();
										text:'save',
										iconCls:'save',
										formBind: true,
										handler: function() {
										//Diese Funktion setzt überittelt asynchron die Daten
										//des Formulares an die main.php, von wo aus die Daten in der DB
										//geändert werden.
											Ext.getCmp('changePassword').getForm().submit({
												method: 'POST',
												url:'index.php',
												params: {
													field: 'passwort',
													cmd: 'UpdateUser'
												},
												success: function(form,action) {
													wndChangePwd.close();
													Ext.example.msg('Success', 'Passwort erfolgreich geändert!');
												},
												failure: function(form,action) {
													if(action.result.pwd==true)
														Ext.example.msg('Stop', 'PWD gleich, nicht upgedatet!');
													else
														Ext.example.msg('Stop', 'Passwort leider falsch!');
												}
											});
										}
									  },{
										//dieser Button schließt einfach nur das Window, ohne etwas zu bewirken.
										text: 'cancel',
										handler: function() {wndChangePwd.close();}
									  }
									]
								})
							]
						});
						wndChangePwd.show(this);					
					}
				}]
			  })
			 }]
		}),
		border:true,
		layout: {
			type:'vbox',
			padding:'20',
			align:'stretch' 
		},
		defaults:{margins:'0 0 15 0'}, 
		width:165,
		items:[ new Ext.Button({
					text: 'Anfragen',
					iconCls: 'anfrage',
					id:'btnanfrage',  	//dieses Objekt hat keinen Namen und muss über diese 
									//ID angesprochen werden. Ext.getCmp('btnanfrage')
					scale:'medium',
					hidden:true,
					//Beim Klick auf den Button wird eine Funktion ausgelöst, die
					//einen neuen Tab im Centertab-Panel generiert. Diese Funktion
					//liegt im ordner /javascript/addXXX.js
					handler: addAnfrageTab,
					flex:1
				}), new Ext.Button({
					text: 'Buchungen',
					id:'btnbuchung',
					iconCls: 'buchungen',
					scale:'medium',
					hidden:true,
					handler: addBuchungTab,
					flex:1
				}), new Ext.Button({
					text: 'Kunden',
					iconCls: 'kunden',
					id:'btnkunden',
					scale:'medium',
					hidden:true,
					handler: addKundenTab,
					flex:1
				}), new Ext.Button({
					text: 'Statistik',
					id:'btnauswertungen',
					iconCls: 'auswertungen',
					scale:'medium',
					hidden:true,
					handler: addAuswertungenTab,
					flex:1
				}), new Ext.Button({
					text: 'Leistungen',
					id:'btnleistungen',
					iconCls: 'leistungen',
					scale:'medium',
					hidden:true,
					handler: addLeistungenTab,
					flex:1
				}), new Ext.Button({
					text: 'Partner',
					iconCls: 'partner',
					id:'btnpartner',
					scale:'medium',
					hidden:true,
					handler: addPartnerTab,
					flex:1
				}), new Ext.Button({
					text: 'Packages',
					id:'btnpackage',
					iconCls: 'packages',
					scale:'medium',
					hidden:true,
					handler: addPackagesTab,
					flex:1
				}), new Ext.Button({
					text: 'User',
					iconCls: 'user',
					id:'btnuser',
					scale:'medium',
					hidden:true,
					handler: addUserTab,
					flex:1
				}), new Ext.Button({
					text: 'Junge Hotels',
					id:'btnjugendherbergen',
					iconCls: 'herbergen',
					scale:'medium',
					hidden:true,
					handler: addJugendherbergenTab,
					flex:1
				})]
	});

	
	//-----------------------CENTER-Panel-------------------------------
	//Das Zentrum der Anwendung (unterhalb des Logos und rechts von der Navigation).
	//Dieses Zentrum ist abermals unterteilt in ein Zentrum und in einen Südbereich.
	//Im Süden steht ein Bereich für zusätzliche Informationen. Im Zentrum ist jetzt endgültig der
	//tatsächliche Arbeitsbereich der Anwendung in Form des TabPanels. In dieses TabPanel werden
	//während der Laufzeit Tabs hinein-erzeugt, wenn auf den entsprechenden Navigationsbutton gedrückt wird.
	//---------------------------------------------------------------------------
	var bl2_south = new Ext.Panel({
		region:'south',
		border:true,
		title:'Information',
		collapsible: true,
		margins: '0 2 0 0',
		collapsed: false,
		split: true,
		height: 90,
		layout:'fit'
	});
	
	var tabcenter = new Ext.TabPanel({
		border:false,
		resizeTabs:true,
		id:'tabcenter',
		minTabWidth: 115,
			tabWidth:135,
			enableTabScroll:true,
			defaults: {autoScroll:true},
		tabPosition:'top'
	});

	var bl2_center = new Ext.Panel({
		region:'center',
		id:'bl2_center',
		layout:'fit',
		border:false,
		items:[tabcenter]
	});
	
	var bl1_centerpanel = new Ext.Panel({
		region:'center',
		margins: '0 0 0 2',
		border:false,
		layout:'border',
		items:[bl2_south, bl2_center]
	});

	
	//---------DER VIEWPORT. DIE TRAEGERKOMPONENTE ANGEWENDET AUF docment.body----------
	var viewport=new Ext.Viewport ({
		layout:'border',
		items:[bl1_northbox, bl1_centerpanel, bl1_westpanel]
	});
	
	
	//Quick-Tipps ermöglichen und den Singleton einige Einstellungen mitgeben :)
	Ext.QuickTips.init();
	Ext.apply(Ext.QuickTips.getQuickTip(), {
		maxWidth: 250,
		minWidth: 100,
		showDelay: 10,
		trackMouse: false
	});
	
	//-----------Ausblenden des Loading-Prozessbar nachdem alles geladen wurde----------
	Ext.get('loading').fadeOut({remove: false});
	

}
/**********************FEHLERBEHANDLUNG********************************************/
catch(err) {
	Ext.example.msg("Leider ist ein Fehler aufgetreten: " + err);
}


});



function handleException(err) {
	Ext.example.msg("Type: "+err.type, err.message); //weiter Unterscheidung mit Fehler-Objekt
}