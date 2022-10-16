<!DOCTYPE html>
<html lang="de">
	<head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
	  <title><?php print $this->title.' '.$this->version; ?></title>
			<link rel="stylesheet" type="text/css" href="Resources/ext3/resources/css/ext-all-notheme.css" />  
			<link rel="stylesheet" type="text/css" href="Resources/ext3/src/shared/examples.css" />
			<link rel="stylesheet" type="text/css" href="Resources/ext3/resources/css/xtheme-tp.css" />
			<link rel="stylesheet" type="text/css" href="Templates/Frontend/css/frontend.css" />
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
		<script type="text/javascript" src="Resources/ext3/adapter/ext/ext-base.js"></script>
		<script type="text/javascript">document.getElementById('loading-msg').innerHTML = 'Laden der UI Basis-Komponenten...';</script>
		<script type="text/javascript" src="Resources/ext3/ext-all.js"></script>
		<script type="text/javascript" src="Resources/ext3/src/ux/xdatefield.js"></script>
		<script type="text/javascript" src="Resources/ext3/src/shared/examples.js"></script>
		<script type="text/javascript" src="Templates/Frontend/javascript/Frontend.js"></script>
	</body>
</html>