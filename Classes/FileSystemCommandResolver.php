<?php
	include_once("Interfaces".DIRECTORY_SEPARATOR."IRequest.php");	
	include_once("Interfaces".DIRECTORY_SEPARATOR."ICommandResolver.php");	


	class FileSystemCommandResolver implements ICommandResolver {
		
		
		//Ordner, in dem die Commands gefunden werden. In unserem Beispiel
		//der Commands-Ordner
		private $path;
		
		
		//falls der CommandResolver den gewünschten Command nicht findet,
		//soll er den defaultCommand nehmen.
		private $defaultCommand;
		
		
		//beim Instanziieren erfährt der FileSystemCommandResolver den Pfad der Commands,
		//und den Namen des Default Commands.
		public function __construct($path, $defaultCommand) {
			$this->path = $path;
			$this->defaultCommand = $defaultCommand; 
		}
				
		
		public function getCommand(IRequest $request) {
			//Der gewünschte Command wird in Form eines Parameters im
			//Requestobjekt übergeben. Dieser Parameter hat den Namen cmd
			if($request->issetParameter('cmd')) {
				//Der Cmd-Parameter existiert, sein Wert ist der Name des gewünschten Commands
				$cmdName = $request->getParameter('cmd');
				$command = $this->loadCommand($cmdName);
				if ($command instanceof ICommand) {
					return $command;
				}
			}
			$command = $this->loadCommand($this->defaultCommand);
			return $command;
		}
		
		
		protected function loadCommand($cmdName) {
			$class = 'cmd'.$cmdName;
			$file = $this->path . DIRECTORY_SEPARATOR . $class . '.php';
			
			//Wenn der Dateiname im Dateisystem nicht gefunden wird, liefert loadCommand
			//false zurück. False ist keien instanceof ICommand, daher wird die getCommand-Methode den
			//DefaultCommand zurückliefern.
			if(!file_exists($file)) {
				return false;
			}
			
			include_once $file;
			
			if(!class_exists($class,false)) {
				return false;
			}
			
			$command = new $class();
			return $command;
		}
	}