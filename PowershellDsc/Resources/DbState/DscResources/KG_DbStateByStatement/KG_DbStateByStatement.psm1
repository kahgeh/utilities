function GetQueryResult
{
	param(
	 [string]$sqlText=$("select name from sysobjects where type='T'"),
	 [string]$dbName='master',
	 [string]$server=".",
	 [string]$userId="Use SSPI",
	 [string]$pwd="None",
	 [string]$connectionString=$null
	)
	
	if ( $server -ne $null )
	{
		#translate java jdbc format 
		$server =$server.Replace(':', ',')
	}

    if ( [string]::IsNullOrEmpty($connectionString) )
	{
		if( $userId -eq "Use SSPI")
		{
		  $connection=New-Object system.data.sqlclient.sqlconnection("Data Source=$server;Initial Catalog=$dbName;Integrated Security=SSPI;")
		}
		else
		{
		  $connection=New-Object system.data.sqlclient.sqlconnection("Data Source=$server;Initial Catalog=$dbName;User ID=$userId;Password=$pwd")
		}
	}	
	 $connection.Open()
	 $sqlCommand = new-object system.data.sqlclient.SqlCommand ($sqlText, $connection )

	$sqlAdapter = New-Object System.Data.SqlClient.SqlDataAdapter
	$sqlAdapter.SelectCommand = $sqlCommand

	$resultSet = New-Object System.Data.DataSet
	$sqlAdapter.Fill($resultSet)  | out-null
	$connection.Close()

    $result=@{}
    if($resultSet -ne $null -and $resultSet.Tables -ne $null -and $resultSet.Tables.Count -gt 0 -and $resultSet.Tables[0].Rows.Count -gt 0)
    {
	    $table=$resultSet.Tables[0]
        $table.Columns|%{
            $column=$_
            $result.Add($column.ColumnName,$table.Rows[0][$column.ColumnName])
        }
        $result
        return

    }

    $result
	
}


function ExecuteNonQuery
{
	param(
	 [string]$sqlText=$("select name from sysobjects where type='T'"),
	 [string]$dbName="master",
	 [string]$server=".",
	 [string]$userId="Use SSPI",
	 [string]$pwd="None",
	 [string]$connectionString=$null
	)

	if ( $server -ne $null )
	{
		#translate java jdbc format 
		$server =$server.Replace(':', ',')
	}

	if ( [string]::IsNullOrEmpty($connectionString) )
	{
		if( $userId -eq "Use SSPI")
		{
		  $connection=New-Object system.data.sqlclient.sqlconnection("Data Source=$server;Initial Catalog=$dbName;Integrated Security=SSPI;")
		}
		else
		{
		  $connection=New-Object system.data.sqlclient.sqlconnection("Data Source=$server;Initial Catalog=$dbName;User ID=$userId;Password=$pwd")
		}
	}	
	try
	{
		$connection.Open()
		$sqlCommand = New-Object System.Data.SqlClient.SqlCommand($sqlText, $connection )
		$rowsAffected=$sqlCommand.ExecuteNonQuery()
		$private:result=("rows affected={0}" -f $rowsAffected)
	}		
	finally
	{
		$connection.Close()
	}
}

function ExecuteScalar
{
	param(
	 [string]$sqlText=$("select name from sysobjects where type='T'"),
	 [string]$dbName='master',
	 [string]$server=".",
	 [string]$userId="Use SSPI",
	 [string]$pwd="None",
	 [string]$connectionString=$null
	)

	if ( $server -ne $null )
	{
		#translate java jdbc format 
		$server =$server.Replace(':', ',')
	}

	if ( [string]::IsNullOrEmpty($connectionString) )
	{
		if( $userId -eq "Use SSPI")
		{
		  $connection=New-Object system.data.sqlclient.sqlconnection( "Data Source=$server;Initial Catalog=$dbName;Integrated Security=SSPI;")
		}
		else
		{
		  $connection=New-Object system.data.sqlclient.sqlconnection( "Data Source=$server;Initial Catalog=$dbName;User ID=$userId;Password=$pwd")
		}
	}	
	try
	{
		$connection.Open()
		$sqlCommand = New-Object System.Data.SqlClient.SqlCommand($sqlText, $connection )
		$private:result=$sqlCommand.ExecuteScalar()
		$private:result
	}		
	finally
	{
		$connection.Close()
	}
}

function ReplacePlaceHolders
{
	[OutputType([String])]
	param
	(
		[parameter(Mandatory = $true)]	
		[String]
		$SqlText,
		$Variables 
	)

	if($Variables -eq $null)
	{
		$SqlText
		return
	}


	foreach($var in $Variables)
    {
		$SqlText=$SqlText.Replace("__$($var.Key)__", $var.Value)
	}
	$SqlText

}

function Get-TargetResource
{
	[CmdletBinding()]
    [OutputType([System.Collections.Hashtable])]
    param
    (
       [parameter(Mandatory = $true)]
       $ServerName,
	   [parameter(Mandatory = $true)]
	   [String]
	   $DatabaseName,
	   [parameter(Mandatory = $true)]
	   [String]
	   $TestSql,
	   [parameter(Mandatory = $true)]
	   [String]
	   $GetSql,
	   [parameter(Mandatory = $true)]
	   [String]
	   $SetSql,
	   [Microsoft.Management.Infrastructure.CimInstance[]] 
	   $Variables
	)

	GetQueryResult (ReplacePlaceHolders $GetSql $Variables) $DatabaseName $ServerName
		
}


function Set-TargetResource
{
	[CmdletBinding()]
    param
    (
       [parameter(Mandatory = $true)]
       $ServerName,
	   [parameter(Mandatory = $true)]
	   [String]
	   $DatabaseName,
	   [parameter(Mandatory = $true)]
	   [String]
	   $TestSql,
	   [parameter(Mandatory = $true)]
	   [String]
	   $GetSql,
	   [parameter(Mandatory = $true)]
	   [String]
	   $SetSql,
	   [Microsoft.Management.Infrastructure.CimInstance[]] 
	   $Variables
	)

	ExecuteNonQuery (ReplacePlaceHolders $SetSql $Variables) $DatabaseName $ServerName
}

function Test-TargetResource
{
	[CmdletBinding()]
	[OutputType([System.Boolean])]
    param
    (
       [parameter(Mandatory = $true)]
       $ServerName,
	   [parameter(Mandatory = $true)]
	   [String]
	   $DatabaseName,
	   [parameter(Mandatory = $true)]
	   [String]
	   $TestSql,
	   [parameter(Mandatory = $true)]
	   [String]
	   $GetSql,
	   [parameter(Mandatory = $true)]
	   [String]
	   $SetSql,
	   [Microsoft.Management.Infrastructure.CimInstance[]] 
	   $Variables
	)
	
	$result=ExecuteScalar (ReplacePlaceHolders $TestSql $Variables) $DatabaseName $ServerName

	$result -eq 1

}