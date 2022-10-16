<?php
interface IDbConnection {

	public function affected_rows();
	
	public function query($sql);

	public function real_escape_string($value);
}
