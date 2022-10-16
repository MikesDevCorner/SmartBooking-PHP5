<?php

	include_once("Interfaces".DIRECTORY_SEPARATOR."ICommandResolver.php");	

	class FrontController {
		private $resolver;
		public function __construct(ICommandResolver $resolver) {
			$this->resolver = $resolver;
		}
		
		public function handleRequest(IRequest $request, IResponse $response) {
			$command = $this->resolver->getCommand($request);
			$command->execute($request, $response);
			$response->flush();
		}
	}