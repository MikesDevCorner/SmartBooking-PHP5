/************************
In dieser Javascript-Datei steht der Code zum Aufbau für das Login-Fenster. Die Funktion Write_Log_In in der login.php ruft
diese Javascript zu Hilfe um das Loginfenster darzustellen. 
 **********************/
 
 Ext.onReady(function(){
	Ext.QuickTips.init();

	var login = new Ext.FormPanel({
		labelWidth:60,
		standardSubmit: true,
		bodyStyle:'padding:10px;',
		//monitorValid:true,
		width:307,
		autoHeight:true,
		defaultType:'textfield',
		items:[
			{
				xtype:'box', //create image
				autoEl:{
					tag:'img',
					src:'Resources/images/profile.png'
				}
			},{
				fieldLabel:'e-Mail',
				name:'user_email',
				anchor: '100%',
				allowBlank:false
			},{
				fieldLabel:'Passwort',
				name:'passwort',
				anchor: '100%',
				inputType:'password',
				id: 'pass',
				allowBlank:false
			}
		],
		buttons:[{
			text:'Login',
			//formBind: true,
			handler:function(){
				var fp = this.ownerCt.ownerCt,
				form = fp.getForm();
				form.submit();
			}
		},{
			text: 'Reset',
			handler: function(){
				login.getForm().reset();
			}
		}]
	});

	var createwindow = new Ext.Window({
		frame:true,
		title:'Smart Booking Login...',
		width:320,
		resizable:false,
		height:170,
		draggable:false,
		closable: false,
		items: login
	});

	createwindow.show();
});  