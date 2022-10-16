<?php

interface ISecurityObject {

	public function checkCredentials(IDbConnection $db, IRequest $request);
}