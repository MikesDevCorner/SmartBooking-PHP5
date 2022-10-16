<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title><?php print $this->title.' '.$this->version; ?></title>
</head>
<body>
	<p>Leider ist beim Laden der Seite ein Fehler aufgetreten.<br /><br />Fehlertyp: 
	<?php print $this->type; ?><br />Message:  <?php print $this->message; ?></p>
</body>
</html>