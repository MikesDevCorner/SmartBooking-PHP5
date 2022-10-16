<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title><?php print $this->title.' '.$this->version; ?></title>

  <link rel="stylesheet" type="text/css" href="Resources/ext3/resources/css/ext-all-notheme.css" />  
  <link rel="stylesheet" type="text/css" href="Resources/ext3/src/shared/examples.css" />
  
  <!-- TEMPLATE AUSW�HLEN (Overrides der ext-all.css) -->
  <link rel="stylesheet" type="text/css" href="Resources/ext3/resources/css/xtheme-tp.css" />
  
  <!-- Einbinden der eigenen CSS-Klassen (und der Overrides) -->
  <link rel="stylesheet" type="text/css" href="Templates/Application/css/application.css" />
</head>

<body>

  <div id="loading">
  <div class="loading-indicator">
			<img src="Resources/images/loading.gif" id="loadingDiv" alt="loading" />
				  <?php print $this->title.' '.$this->version; ?><br />
				  <span id="loading-msg">Styles und Images werden geladen...</span>
	  </div>
  </div>

  <!-- Einbinden der Framework-Javascripts-->
  <script type="text/javascript">document.getElementById('loading-msg').innerHTML = 'Laden der Grund-Bibliotheken...';</script>
  <script type="text/javascript" src="Resources/ext3/adapter/ext/ext-base-debug.js"></script>
  <script type="text/javascript">document.getElementById('loading-msg').innerHTML = 'Laden der UI Basis-Komponenten...';</script>
  <script type="text/javascript" src="Resources/ext3/ext-all.js"></script>
  
  <!-- Einbinden der noch ben�tigten Framework-Extensions -->
  <script type="text/javascript">document.getElementById('loading-msg').innerHTML = 'Laden der UI-Extensions...';</script>
  <script type="text/javascript" src="Resources/ext3/src/ux/SlidingPager.js"></script>
  <script type="text/javascript" src="Resources/ext3/src/ux/SliderTip.js"></script>
  <script type="text/javascript" src="Resources/ext3/src/ux/CheckColumn.js"></script>
  <script type="text/javascript" src="Resources/ext3/src/ux/ProgressBarPager.js"></script>
  <script type="text/javascript" src="Resources/ext3/src/ux/PagingMemoryProxy.js"></script>
  <script type="text/javascript" src="Resources/ext3/src/ux/xdatefield.js"></script>
  <script type="text/javascript" src="Resources/ext3/src/ux/GridPrinter.js"></script>
  <script type="text/javascript" src="Resources/ext3/src/ux/RowExpander.js"></script>
  <script type="text/javascript" src="Resources/ext3/src/shared/examples.js"></script>
  
  <!-- Einbinden der eigenen Javascripts-->
  <script type="text/javascript">document.getElementById('loading-msg').innerHTML = 'Laden der Applikation...';</script>
  <script type="text/javascript" src="Templates/Application/javascript/pollForChanges.js"></script>
  <script type="text/javascript" src="Templates/Application/javascript/addanfrage.js"></script>
  <script type="text/javascript" src="Templates/Application/javascript/addbuchung.js"></script>
  <script type="text/javascript" src="Templates/Application/javascript/addauswertungen.js"></script>
  <script type="text/javascript" src="Templates/Application/javascript/addleistungen.js"></script>
  <script type="text/javascript" src="Templates/Application/javascript/addpartner.js"></script>
  <script type="text/javascript" src="Templates/Application/javascript/addpackage.js"></script>
  <script type="text/javascript" src="Templates/Application/javascript/adduser.js"></script>
  <script type="text/javascript" src="Templates/Application/javascript/addjugendherberge.js"></script>
  <script type="text/javascript" src="Templates/Application/javascript/addkunden.js"></script>
  <script type="text/javascript" src="Templates/Application/javascript/Application.js"></script>
  
</body>
</html>


